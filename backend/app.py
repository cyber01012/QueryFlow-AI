from fastapi import FastAPI, Depends
from dotenv import load_dotenv
from pydantic import BaseModel
import requests, os
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from models import SessionLocal, Patient, Base, engine
from seed_data import seed_database

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

class QueryRequest(BaseModel):
    question: str

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)  # Create tables if they don't exist
    db = SessionLocal()
    try:
        patient_count = db.query(Patient).count()
        if patient_count == 0:
            print("Database is empty, seeding data...")
            seed_database(db)
        else:
            print(f"Database already contains {patient_count} patients. Skipping seeding.")
    finally:
        db.close()
    yield

app = FastAPI(lifespan=lifespan)

# Allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/query")
def query_db(req: QueryRequest, db=Depends(get_db)):
    schema = "Patients(id, name, age, gender, condition), Doctors(id, name), Appointments(id, patient_id, doctor_id, appointment_date)"
  # Schema definition

    prompt = f"""
    Convert the following question into an SQL query for SQLite.
    Schema: {schema}
    Question: {req.question}
    When comparing strings, use LOWER(column) = LOWER('value') for case-insensitive matching.
    Only return the SQL query.
    """

    print("--- Preparing to call Groq API ---")
    try:
        # Groq API call (OpenAI-compatible endpoint)
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0
            },
            timeout=60
        )
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        data = response.json()
        print("DEBUG GROQ RESPONSE:", data)

    except requests.exceptions.HTTPError as http_err:
        print(f"--- HTTP error occurred: {http_err} ---")
        print(f"--- Response content: {response.text} ---")
        return {"error": f"HTTP error occurred: {http_err}", "details": response.text}
    except requests.exceptions.RequestException as e:
        print(f"--- Groq API request failed: {e} ---")
        return {"error": "Failed to connect to Groq API."}
    except Exception as e:
        print(f"--- An error occurred after API call: {e} ---")
        if 'response' in locals():
            print("--- Raw API Response Text:", response.text)
        return {"error": "An unexpected error occurred processing the API response."}

    try:
        raw_response = data["choices"][0]["message"]["content"]
        # The model sometimes returns the SQL wrapped in markdown
        if "```" in raw_response:
            sql_query = raw_response.split("```")[1]
            if sql_query.lower().startswith('sql'):
                sql_query = sql_query[3:].strip()
        else:
            sql_query = raw_response.strip()
    except (KeyError, IndexError) as e:
        print(f"--- Error parsing Groq response: {e} ---")
        print("--- Full API Response:", data)
        return {"error": "Could not parse SQL query from Groq response."}


    try:
        print(f"--- Executing SQL query: {sql_query} ---")
        results = db.execute(text(sql_query)).fetchall()
        return {"sql": sql_query, "results": [dict(row._mapping) for row in results]}
    except Exception as e:
        print(f"--- Database error: {e} ---")
        return {"error": str(e), "sql": sql_query}

@app.get("/patients/count")
def get_patients_count(db=Depends(get_db)):
    try:
        count = db.query(Patient).count()
        return {"patient_count": count}
    except Exception as e:
        print(f"--- Error getting patient count: {e} ---")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)