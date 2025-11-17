-- This migration creates tracking columns for invite views

ALTER TABLE `invites`
  ADD COLUMN `first_viewed_at` DATETIME NULL,
  ADD COLUMN `last_viewed_at` DATETIME NULL,
  ADD COLUMN `view_count` INT NOT NULL DEFAULT 0;
