-- Add age-specific participant counts to RSVPs
ALTER TABLE `rsvps`
  ADD COLUMN `participants_above8` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `participants_3to7` INTEGER NOT NULL DEFAULT 0;
