import os
from dotenv import load_dotenv

load_dotenv()

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
SERVICE_PORT = int(os.getenv("SERVICE_PORT", "3005"))
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./security_audit.db")

# Anomaly Detection Thresholds
MAX_COMMITS_PER_MINUTE = 5
THREAT_SCORE_THRESHOLD = 75
