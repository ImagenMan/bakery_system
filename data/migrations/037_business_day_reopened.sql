CREATE TABLE operational_events_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL
        CHECK (
            event_type IN (
                'LOGIN',
                'LOGOUT',
                'BUSINESS_DAY_OPENED',
                'BUSINESS_DAY_CLOSED',
                'BUSINESS_DAY_REOPENED',
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
    daily_record_id INTEGER
        REFERENCES daily_records(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO operational_events_new (
    id,
    event_type,
    event_at,
    user_id,
    notes,
    created_at,
    daily_record_id
)
SELECT
    id,
    event_type,
    event_at,
    user_id,
    notes,
    created_at,
    daily_record_id
FROM operational_events;

DROP TABLE operational_events;

ALTER TABLE operational_events_new
    RENAME TO operational_events;

CREATE INDEX idx_operational_events_event_at
    ON operational_events(event_at);

CREATE INDEX idx_operational_events_event_type
    ON operational_events(event_type);

CREATE INDEX idx_operational_events_daily_record_id
    ON operational_events(daily_record_id);

CREATE UNIQUE INDEX idx_operational_events_production_day_closed
    ON operational_events(daily_record_id)
    WHERE event_type = 'PRODUCTION_DAY_CLOSED';

CREATE UNIQUE INDEX idx_operational_events_business_day_opened
    ON operational_events(daily_record_id)
    WHERE event_type = 'BUSINESS_DAY_OPENED';
