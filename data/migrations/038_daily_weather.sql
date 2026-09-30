CREATE TABLE IF NOT EXISTS daily_weather (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    daily_record_id INTEGER NOT NULL,

    temperature_high REAL,
    temperature_low REAL,
    precipitation REAL,
    rain REAL,

    source TEXT NOT NULL,

    latitude REAL NOT NULL,
    longitude REAL NOT NULL,

    retrieved_at TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT (
        strftime('%Y-%m-%d %H:%M:%S', 'now')
    ),

    updated_at TEXT NOT NULL DEFAULT (
        strftime('%Y-%m-%d %H:%M:%S', 'now')
    ),

    FOREIGN KEY (daily_record_id)
        REFERENCES daily_records(id)
        ON DELETE CASCADE,

    UNIQUE (daily_record_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_weather_daily_record
    ON daily_weather(daily_record_id);
