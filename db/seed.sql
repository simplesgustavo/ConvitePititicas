-- Gustavo 4.0 – estrutura inicial de banco (MySQL)

CREATE TABLE IF NOT EXISTS `events` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `name` VARCHAR(191) NOT NULL,
  `starts_at` DATETIME NOT NULL,
  `venue` VARCHAR(191) NULL,
  `theme` JSON NULL,
  `video_url` VARCHAR(512) NULL,
  `fallback_image_url` VARCHAR(512) NULL,
  `rsvp_deadline` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `guests` (
  `id` VARCHAR(191) NOT NULL,
  `event_id` VARCHAR(191) NOT NULL,
  `full_name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(32) NOT NULL UNIQUE,
  `email` VARCHAR(191) NULL,
  `max_companions` SMALLINT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `guests_event_id_fkey`
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `invites` (
  `id` VARCHAR(191) NOT NULL,
  `event_id` VARCHAR(191) NOT NULL,
  `guest_id` VARCHAR(191) NOT NULL UNIQUE,
  `short_code` VARCHAR(191) NOT NULL UNIQUE,
  `sent_at` DATETIME NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `invites_event_id_fkey`
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `invites_guest_id_fkey`
    FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rsvps` (
  `id` VARCHAR(191) NOT NULL,
  `invite_id` VARCHAR(191) NOT NULL UNIQUE,
  `status` ENUM('yes', 'no') NOT NULL,
  `companions` SMALLINT NOT NULL DEFAULT 0,
  `participants_above8` SMALLINT NOT NULL DEFAULT 0,
  `participants_3to7` SMALLINT NOT NULL DEFAULT 0,
  `comment` TEXT NULL,
  `responded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `rsvps_invite_id_fkey`
    FOREIGN KEY (`invite_id`) REFERENCES `invites`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_logs` (
  `id` VARCHAR(191) NOT NULL,
  `event_id` VARCHAR(191) NULL,
  `actor` VARCHAR(191) NOT NULL,
  `action` VARCHAR(191) NOT NULL,
  `payload` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `admin_logs_event_id_fkey`
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Dados de exemplo
INSERT INTO `events` (`id`, `slug`, `name`, `starts_at`, `venue`, `theme`, `video_url`, `fallback_image_url`, `rsvp_deadline`)
VALUES (
  'evt_gustavo40',
  'gustavo-40',
  'Gustavo 4.0 – Feijoada & Chopp',
  '2024-08-24 13:00:00',
  'Espaço Gourmet do Clube das Palmeiras',
  JSON_OBJECT('primary', '#ffbd0e', 'secondary', '#1f1b1a', 'accent', '#1b7d48'),
  'https://cdn.exemplo.com/videos/gustavo40-loop.mp4',
  'https://cdn.exemplo.com/images/gustavo40-frame.jpg',
  '2024-08-20 23:59:00'
)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `guests` (`id`, `event_id`, `full_name`, `phone`, `email`, `max_companions`)
VALUES
  ('gst_ana', 'evt_gustavo40', 'Ana Paula', '5511999990001', 'ana@example.com', 2),
  ('gst_bruno', 'evt_gustavo40', 'Bruno Martins', '5511988880002', 'bruno@example.com', 0),
  ('gst_carla', 'evt_gustavo40', 'Carla Souza', '5511977770003', 'carla@example.com', 1),
  ('gst_diego', 'evt_gustavo40', 'Diego Ferreira', '5511966660004', 'diego@example.com', 3),
  ('gst_eduarda', 'evt_gustavo40', 'Eduarda Lima', '5511955550005', 'eduarda@example.com', 1)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

INSERT INTO `invites` (`id`, `event_id`, `guest_id`, `short_code`, `status`)
VALUES
  ('inv_ana', 'evt_gustavo40', 'gst_ana', 'ana-paula', 'pending'),
  ('inv_bruno', 'evt_gustavo40', 'gst_bruno', 'bruno-martins', 'pending'),
  ('inv_carla', 'evt_gustavo40', 'gst_carla', 'carla-souza', 'pending'),
  ('inv_diego', 'evt_gustavo40', 'gst_diego', 'diego-ferreira', 'pending'),
  ('inv_eduarda', 'evt_gustavo40', 'gst_eduarda', 'eduarda-lima', 'pending')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

INSERT INTO `rsvps` (`id`, `invite_id`, `status`, `companions`, `participants_above8`, `participants_3to7`)
VALUES
  ('rsvp_ana', 'inv_ana', 'yes', 2, 2, 0),
  ('rsvp_bruno', 'inv_bruno', 'no', 0, 0, 0)
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);
