from fastapi import FastAPI, Depends
from dotenv import load_dotenv
from pydantic import BaseModel
import requests, os
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from models import SessionLocal, Patient, Base, engine
from seed_data import seed_database

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

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

    print("--- Preparing to call Gemini API ---")
    try:
        # Gemini API call
        response = requests.post(
            "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent",
            params={"key": GEMINI_API_KEY},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=60
        )
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        data = response.json()
        print("DEBUG GEMINI RESPONSE:", data)

    except requests.exceptions.HTTPError as http_err:
        print(f"--- HTTP error occurred: {http_err} ---")
        print(f"--- Response content: {response.text} ---")
        return {"error": f"HTTP error occurred: {http_err}", "details": response.text}
    except requests.exceptions.RequestException as e:
        print(f"--- Gemini API request failed: {e} ---")
        return {"error": "Failed to connect to Gemini API."}
    except Exception as e:
        print(f"--- An error occurred after API call: {e} ---")
        if 'response' in locals():
            print("--- Raw API Response Text:", response.text)
        return {"error": "An unexpected error occurred processing the API response."}

    try:
        raw_response = data["candidates"][0]["content"]["parts"][0]["text"]
        # The model sometimes returns the SQL wrapped in markdown,soo..
        if "```" in raw_response:
            # Find the SQL code block and extract it
            sql_query = raw_response.split("```")[1]
            # Remove the optional 'sql' language identifier
            if sql_query.lower().startswith('sql'):
                sql_query = sql_query[3:].strip()
        else:
            sql_query = raw_response.strip()
    except (KeyError, IndexError) as e:
        print(f"--- Error parsing Gemini response: {e} ---")
        print("--- Full API Response:", data)
        return {"error": "Could not parse SQL query from Gemini response."}


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