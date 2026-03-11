import time
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from collections import defaultdict
from .config import MAX_COMMITS_PER_MINUTE, THREAT_SCORE_THRESHOLD

class SecurityEngine:
    def __init__(self):
        self.event_history = []
        self.user_stats = defaultdict(lambda: {"commits": [], "failures": 0, "risk_score": 0})
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.is_model_trained = False
        self.incidents = []

    async def analyze_event(self, topic, data):
        account_id = data.get("accountId", "unknown")
        timestamp = time.time()
        
        # 1. Track Event for ML
        event_entry = {
            "accountId": account_id,
            "topic": topic,
            "timestamp": timestamp,
            "success": data.get("success", True)
        }
        self.event_history.append(event_entry)

        # 2. Rule-based Anomaly Detection
        if topic == "balance.committed":
            self.user_stats[account_id]["commits"].append(timestamp)
            # Filter commits in last 60s
            recent_commits = [t for t in self.user_stats[account_id]["commits"] if timestamp - t < 60]
            self.user_stats[account_id]["commits"] = recent_commits
            
            if len(recent_commits) > MAX_COMMITS_PER_MINUTE:
                self.log_incident(account_id, "RAPID_COMMIT_ANOMALY", "HIGH")

        if topic == "proof.generated" and not data.get("success"):
            self.user_stats[account_id]["failures"] += 1
            if self.user_stats[account_id]["failures"] > 3:
                self.log_incident(account_id, "REPEATED_PROOF_FAILURE", "MEDIUM")

        # 3. ML Anomaly Detection (triggered periodic or every X events)
        if len(self.event_history) > 50:
            self.train_and_predict()

    def train_and_predict(self):
        # Simplify history to features for ML
        # In a real app, this would be more complex
        df = pd.DataFrame(self.event_history[-100:])
        # For demo: use timestamp diffs and success flags
        # This is high-level logic placeholder
        self.is_model_trained = True

    def log_incident(self, account_id, type, severity):
        incident = {
            "incidentId": f"SEC-{int(time.time()*1000)}",
            "accountId": account_id,
            "type": type,
            "severity": severity,
            "timestamp": pd.Timestamp.now().isoformat()
        }
        self.incidents.append(incident)
        print(f"[SECURITY-AUDITOR] ⚠️ ALERT: {type} detected for {account_id}")

    def get_summary(self):
        return {
            "total_incidents": len(self.incidents),
            "incidents": self.incidents[-20:],
            "system_threat_level": "LOW" if len(self.incidents) < 5 else "ELEVATED"
        }

security_engine = SecurityEngine()
