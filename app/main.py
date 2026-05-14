from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.routers import debate, topics

app = FastAPI(
    title="AI Debate Arena",
    description=(
        "Two AI agents argue any topic across multiple rounds. "
        "A neutral judge scores logic, evidence, and persuasiveness. "
        "Watch ideas clash in real time via SSE streaming."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(debate.router, prefix="/api/debate")
app.include_router(topics.router, prefix="/api/topics")

app.mount(
    "/static",
    StaticFiles(directory="debate-frontend/build/static"),
    name="static",
)

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_react_app(full_path: str):
    if full_path.startswith("api"):
        return {"detail": "Not Found"}

    return FileResponse("debate-frontend/build/index.html")