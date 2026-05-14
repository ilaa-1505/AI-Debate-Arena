from fastapi import APIRouter
import random

router = APIRouter(tags=["topics"])

PRESET_TOPICS = {
    "tech": [
        "AI will replace software engineers within 10 years",
        "Open source AI is more dangerous than closed source AI",
        "Big Tech companies should be broken up",
        "Crypto will never replace traditional currency",
        "Remote work permanently kills team culture",
    ],
    "india": [
        "IITs are overrated as institutions",
        "Startups are better career choices than big tech in India",
        "Cricket is India's biggest religion",
        "India's startup ecosystem is built on a funding bubble",
        "English medium education disadvantages rural Indian students",
    ],
    "society": [
        "Social media does more harm than good",
        "Universal Basic Income would destroy work ethic",
        "Cancel culture has gone too far",
        "Democracy is the worst form of government except all the others",
        "Hustle culture is toxic and should be rejected",
    ],
    "education": [
        "College degrees are becoming worthless",
        "Homework should be abolished in schools",
        "Standardised tests are fundamentally unfair",
        "Students learn more outside classrooms than inside them",
    ],
}


@router.get("/")
def get_all_topics():
    return {
        "categories": PRESET_TOPICS,
        "total": sum(len(v) for v in PRESET_TOPICS.values()),
    }


@router.get("/random")
def get_random_topic(category: str = None):
    if category and category in PRESET_TOPICS:
        topics = PRESET_TOPICS[category]
    else:
        topics = [t for group in PRESET_TOPICS.values() for t in group]
    
    chosen = random.choice(topics)
    return {"topic": chosen}


@router.get("/categories")
def get_categories():
    return {"categories": list(PRESET_TOPICS.keys())}
