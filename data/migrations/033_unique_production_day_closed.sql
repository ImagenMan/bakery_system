CREATE UNIQUE INDEX idx_operational_events_production_day_closed
    ON operational_events(daily_record_id)
    WHERE event_type = 'PRODUCTION_DAY_CLOSED';
