import strawberry
from typing import List
from .engine import security_engine

@strawberry.type
class Incident:
    incidentId: str
    accountId: str
    type: str
    severity: str
    timestamp: str

@strawberry.type
class SecuritySummary:
    total_incidents: int
    system_threat_level: str
    incidents: List[Incident]

@strawberry.type
class Query:
    @strawberry.field
    def security_summary(self) -> SecuritySummary:
        summary = security_engine.get_summary()
        return SecuritySummary(
            total_incidents=summary["total_incidents"],
            system_threat_level=summary["system_threat_level"],
            incidents=[Incident(**i) for i in summary["incidents"]]
        )

schema = strawberry.Schema(query=Query)
