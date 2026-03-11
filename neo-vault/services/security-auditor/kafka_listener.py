import json
import asyncio
from confluent_kafka import Consumer, KafkaError
from .config import KAFKA_BROKER
from .engine import security_engine

class KafkaAuditListener:
    def __init__(self):
        self.conf = {
            'bootstrap.servers': KAFKA_BROKER,
            'group.id': 'security-auditor-group',
            'auto.offset.reset': 'earliest'
        }
        self.consumer = Consumer(self.conf)
        self.topics = ['balance.committed', 'proof.generated', 'verification.result']

    async def start(self):
        self.consumer.subscribe(self.topics)
        print(f"[SECURITY-AUDITOR] 🎧 Listening to Kafka at {KAFKA_BROKER}")
        
        try:
            while True:
                msg = self.consumer.poll(1.0)
                if msg is None:
                    await asyncio.sleep(0.1)
                    continue
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        print(f"Kafka error: {msg.error()}")
                        break
                
                topic = msg.topic()
                data = json.loads(msg.value().decode('utf-8'))
                
                print(f"[SECURITY-AUDITOR] 📥 Processing event from {topic}")
                await security_engine.analyze_event(topic, data)
                
        finally:
            self.consumer.close()

kafka_listener = KafkaAuditListener()
