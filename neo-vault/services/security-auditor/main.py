import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from .schema import schema
from .kafka_listener import kafka_listener
from .engine import security_engine
from .config import SERVICE_PORT

app = FastAPI(title="Neo-vault Security Auditor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

@app.get("/api/v1/security/summary")
async def get_summary():
    return security_engine.get_summary()

@app.get("/health")
async def health():
    return {"status": "UP", "service": "security-auditor"}

@app.on_event("startup")
async def startup_event():
    # Start Kafka listener in background
    asyncio.create_task(kafka_listener.start())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=SERVICE_PORT)
