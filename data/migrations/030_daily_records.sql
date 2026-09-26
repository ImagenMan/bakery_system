CREATE TABLE daily_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date DATE NOT NULL UNIQUE,
    opened_at DATETIME,
    closed_at DATETIME,
    weather_high REAL,
    weather_low REAL,
    rain_amount REAL,
    electricity_reading REAL,
    gas_reading REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
