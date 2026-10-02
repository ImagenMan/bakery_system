CREATE TABLE daily_context (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    daily_record_id INTEGER NOT NULL
        REFERENCES daily_records(id),
    context_type TEXT NOT NULL
        CHECK (
            context_type IN (
                'HOLIDAY',
                'SCHOOL_VACATION',
                'LOCAL_EVENT',
                'PROMOTION',
                'OTHER'
            )
        ),
    title TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_context_daily_record_id
    ON daily_context(daily_record_id);
