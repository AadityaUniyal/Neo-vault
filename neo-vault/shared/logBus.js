const EventEmitter = require('events');

class LogBus extends EventEmitter {
    constructor() {
        super();
        this.buffer = [];
        this.maxBuffer = 200;
    }

    log(service, level, message) {
        const entry = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            service,
            level: level.toUpperCase(),
            message: typeof message === 'object' ? JSON.stringify(message) : String(message)
        };

        this.buffer.push(entry);
        if (this.buffer.length > this.maxBuffer) {
            this.buffer.shift();
        }

        this.emit('log', entry);
    }

    getHistory() {
        return this.buffer;
    }
}

// Singleton
const logBus = new LogBus();
module.exports = logBus;
