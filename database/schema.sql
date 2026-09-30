-- Database Schema for Research Opportunity Portal
-- Database: research_portal

CREATE DATABASE IF NOT EXISTS research_portal;
USE research_portal;

DROP TABLE IF EXISTS opportunities;

CREATE TABLE opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    research_area VARCHAR(150) NOT NULL,
    faculty_name VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL,
    required_skills TEXT NOT NULL,
    available_positions INT NOT NULL CHECK (available_positions >= 0),
    application_deadline DATE NOT NULL,
    status ENUM('Open', 'Closed') DEFAULT 'Open' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
