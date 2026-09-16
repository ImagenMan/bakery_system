ALTER TABLE frozen_inventory
ADD COLUMN action_type TEXT NOT NULL DEFAULT 'FREEZE'
CHECK (action_type IN ('FREEZE', 'RELEASE'));
