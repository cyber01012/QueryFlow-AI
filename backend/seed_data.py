from faker import Faker
import random
from models import SessionLocal, Patient, Doctor, Appointment, init_db

fake = Faker()

def seed_database(db):
    try:
        # Create doctors
        doctor_names = ["Dr. Ali", "Dr. Khan", "Dr. Fatima", "Dr. Ahmed", "Dr. Sana"]
        doctors = []
        print("Seeding doctors...")
        for name in doctor_names:
            doctor = Doctor(name=name)
            doctors.append(doctor)
            db.add(doctor)
        db.commit()
        print(f"Seeded {len(doctors)} doctors.")

        # Get doctor IDs
        doctor_ids = [doctor.id for doctor in doctors]

        # Some sample conditions
        conditions = ["Diabetes", "Hypertension", "Asthma", "Flu", "COVID-19", "Back Pain"]

        # Generate 200 fake patients
        print("Seeding patients...")
        for _ in range(200):
            patient = Patient(
                name=fake.name(),
                age=random.randint(1, 90),
                gender=random.choice(["Male", "Female"]),
                condition=random.choice(conditions)
            )
            db.add(patient)
            db.flush() # Use flush to get patient ID before commit

            # Create appointments for the patient
            num_appointments = random.randint(1, 3)
            for _ in range(num_appointments):
                appointment = Appointment(
                    patient_id=patient.id,
                    doctor_id=random.choice(doctor_ids),
                    appointment_date=fake.date_between(start_date="-1y", end_date="+1y")
                )
                db.add(appointment)
        db.commit()
        print("Seeded 200 patients and their appointments.")

        print("Database seeded with fake data.")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")

if __name__ == '__main__':
    init_db() # Only call init_db when running seed_data.py directly
    db = SessionLocal()
    seed_database(db)
    db.close()