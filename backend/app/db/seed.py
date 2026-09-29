from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import GuidanceContent

Base.metadata.create_all(bind=engine)

def seed_guidance(db: Session):
    if db.query(GuidanceContent).count() > 0:
        return
    
    guidance_data = [
        {
            "condition_name": "Common Cold",
            "description": "A viral infection of your nose and throat (upper respiratory tract).",
            "supportive_care": [
                "Get plenty of rest.",
                "Drink warm fluids like tea or broth.",
                "Use a humidifier to moisten the air.",
                "Gargle with warm salt water for a sore throat."
            ],
            "general_precautions": [
                "Wash your hands frequently.",
                "Avoid close contact with others to prevent spreading."
            ],
            "things_to_avoid": [
                "Avoid sharing utensils or drinking glasses.",
                "Avoid smoking and secondhand smoke."
            ],
            "warning_signs": [
                "High fever (above 101.3 F / 38.5 C).",
                "Symptoms lasting more than 10 days.",
                "Shortness of breath."
            ],
            "when_to_seek_care": [
                "If symptoms worsen or fail to improve after 7-10 days.",
                "If you experience wheezing or severe shortness of breath."
            ],
            "source_name": "Mayo Clinic",
            "source_url": "https://www.mayoclinic.org/diseases-conditions/common-cold/symptoms-causes/syc-20351605",
            "last_reviewed": "2023-05-15"
        },
        {
            "condition_name": "Dengue",
            "description": "A mosquito-borne viral infection causing a severe flu-like illness and, sometimes causing a potentially lethal complication called severe dengue.",
            "supportive_care": [
                "Rest as much as possible.",
                "Drink plenty of fluids (water, isotonic drinks, fruit juices) to prevent dehydration.",
                "Use acetaminophen for pain and fever control (avoid NSAIDs)."
            ],
            "general_precautions": [
                "Use mosquito repellent.",
                "Ensure window and door screens are secure."
            ],
            "things_to_avoid": [
                "Do NOT take aspirin or ibuprofen as they can increase the risk of bleeding.",
                "Avoid mosquito bites to prevent further transmission."
            ],
            "warning_signs": [
                "Severe abdominal pain.",
                "Persistent vomiting.",
                "Bleeding gums or nose.",
                "Fatigue, restlessness."
            ],
            "when_to_seek_care": [
                "Immediately if any warning signs (like bleeding or severe abdominal pain) develop, usually 24-48 hours after fever goes down."
            ],
            "source_name": "WHO",
            "source_url": "https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue",
            "last_reviewed": "2023-03-17"
        },
        {
            "condition_name": "Malaria",
            "description": "A disease caused by a plasmodium parasite, transmitted by the bite of infected mosquitoes.",
            "supportive_care": [
                "Rest in a cool, comfortable environment.",
                "Stay hydrated.",
                "Sponge baths can help reduce fever temporarily."
            ],
            "general_precautions": [
                "Sleep under a mosquito net.",
                "Use insect repellent."
            ],
            "things_to_avoid": [
                "Avoid self-medicating with antimalarial drugs without a proper diagnosis."
            ],
            "warning_signs": [
                "High fever and severe chills.",
                "Confusion or seizures.",
                "Severe anemia (pale skin, extreme fatigue)."
            ],
            "when_to_seek_care": [
                "Seek immediate medical attention if you suspect malaria, especially if you have traveled to an endemic area recently."
            ],
            "source_name": "CDC",
            "source_url": "https://www.cdc.gov/malaria/about/index.html",
            "last_reviewed": "2023-04-10"
        },
        {
            "condition_name": "Migraine",
            "description": "A neurological condition that can cause multiple symptoms, frequently characterized by intense, debilitating headaches.",
            "supportive_care": [
                "Rest in a quiet, dark room.",
                "Apply a cold compress or ice pack to your forehead or the back of your neck.",
                "Stay hydrated."
            ],
            "general_precautions": [
                "Identify and avoid personal migraine triggers (e.g., certain foods, stress, lack of sleep)."
            ],
            "things_to_avoid": [
                "Avoid bright lights, loud noises, and strong odors during an attack.",
                "Avoid caffeine withdrawal or excessive caffeine intake."
            ],
            "warning_signs": [
                "An abrupt, severe headache like a thunderclap.",
                "Headache with fever, stiff neck, confusion, seizures, double vision, numbness or weakness in any part of the body."
            ],
            "when_to_seek_care": [
                "Go to an emergency room if you experience any of the warning signs, as they could indicate a more serious medical problem."
            ],
            "source_name": "MedlinePlus",
            "source_url": "https://medlineplus.gov/migraine.html",
            "last_reviewed": "2023-01-20"
        }
    ]

    for item in guidance_data:
        db_item = GuidanceContent(**item)
        db.add(db_item)
    
    db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    seed_guidance(db)
    db.close()
    print("Database seeded successfully.")
