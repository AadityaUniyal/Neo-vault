/**
 * Neo-Vault Event Bus
 * 
 * Simulates Apache Kafka's pub/sub model for local development.
 * In production, this is replaced by real Kafka via docker-compose.
 * 
 * Topics:
 *  - balance.committed   → Bank publishes signed balance
 *  - proof.generated     → Vault publishes ZK proof
 *  - verification.result → Verifier publishes final result
 */

const EventEmitter = require('events');

class KafkaEventBus extends EventEmitter {
    constructor() {
        super();
        this.topics = new Map();
        this.messageLog = [];
    }

    publish(topic, message) {
        const event = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            topic,
            timestamp: new Date().toISOString(),
            payload: message,
            partition: 0,
            offset: this.messageLog.length
        };

        this.messageLog.push(event);
        this.emit(topic, event);
        this.emit('__all__', event); // For monitoring
        return event;
    }

    subscribe(topic, handler) {
        this.on(topic, handler);
    }

    getLog() {
        return this.messageLog;
    }

    getTopicMessages(topic) {
        return this.messageLog.filter(m => m.topic === topic);
    }
}

// Singleton instance (shared across microservices in dev mode)
const eventBus = new KafkaEventBus();

module.exports = { eventBus, KafkaEventBus };
