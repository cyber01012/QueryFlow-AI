# Introducing an AI powered full stack application . . .

# QueryFlow AI

This project is a web application that allows users to query a database(in this case, SQLite) using natural language. The application converts voice or text input into an SQL query, executes it on a database, and displays data by data visualization through tables and bar chart.

## Features

- **Voice and Text Input**: Supports speech recognition by react or u can type natural language query into a text area.
- **Natural Language to SQL**: The application uses the Gemini API to convert natural language questions into SQL queries.
- **Database Interaction**: The backend executes the generated SQL query on an SQLite database.
- **Data Visualization**: The results of the query can be displayed in a table or a bar chart.
- **Database Seeding**: For data sampling, the database is seeded with fake data using the Faker python library.

## Technologies Used . . .

### Backend

- **Python**: The backend is written in Python.
- **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
- **SQLAlchemy**: The Python SQL Toolkit and Object Relational Mapper.
- **Uvicorn**: An ASGI server implementation, for running the FastAPI application.
- **Gemini API**: Used for converting natural language to SQL.
- **Faker**: A Python package that generates fake data.

### Frontend

- **Next.js**: A React framework for building full-stack web applications.
- **React**: A JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom user interfaces.
- **Recharts**: A composable charting library built on React components.
- **react-speech-recognition**: Used for speech-to-text conversion. Browser support: Chrome and Edge.

## Project Structure

- `backend/`: Contains the Python code for the FastAPI application, database models, and data seeding scripts.
- `frontend/`: Contains the Next.js code for the user interface.

## Getting Started

### Prerequisites

- Python 3.7+
- Node.js and npm

### Backend Setup

1.  Navigate to the `backend` directory.
2.  Create a virtual environment: `python -m venv venv`
3.  Activate the virtual environment: `venv\Scripts\activate`
4.  Install the required packages: `pip install -r requirements.txt`
5.  Create a `.env` file and add your Gemini API key or any other Generative Language Model API key for e.g. : `GEMINI_API_KEY=your_api_key`
6.  Start the backend server: `uvicorn app:app --reload`

### Frontend Setup

1.  Navigate to the `frontend` directory. [for this project, i used NextJS framework]
2.  Install the required packages: `npm install`
3.  Start the frontend development server: `npm run dev`

# Notes on UI 
A slick purple themed interface, started with simplicity and modern look. Hope u like it ;)
