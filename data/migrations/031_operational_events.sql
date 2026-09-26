CREATE TABLE operational_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL
        CHECK (
            event_type IN (
                'LOGIN',
                'LOGOUT',
                'PRODUCTION_DAY_CLOSED',
                'POWER_OUTAGE',
                'EQUIPMENT_ISSUE',
                'OTHER'
            )
        ),
    event_at TEXT NOT NULL,
    user_id INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_operational_events_event_at
    ON operational_events(event_at);

CREATE INDEX idx_operational_events_event_type
    ON operational_events(event_type);
