CREATE UNIQUE INDEX idx_operational_events_business_day_opened
    ON operational_events(daily_record_id)
    WHERE event_type = 'BUSINESS_DAY_OPENED';

CREATE UNIQUE INDEX idx_operational_events_business_day_closed
    ON operational_events(daily_record_id)
    WHERE event_type = 'BUSINESS_DAY_CLOSED';
