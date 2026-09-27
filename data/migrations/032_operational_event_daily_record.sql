ALTER TABLE operational_events
ADD COLUMN daily_record_id INTEGER
    REFERENCES daily_records(id);

CREATE INDEX idx_operational_events_daily_record_id
    ON operational_events(daily_record_id);
