-- Seed Data for Research Opportunity Portal
USE research_portal;

INSERT INTO opportunities 
(title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status) 
VALUES 
(
    'AI-Driven Network Traffic Optimization', 
    'Investigating deep reinforcement learning models for dynamic traffic routing and congestion management in multi-tenant campus networks.', 
    'Artificial Intelligence & Networking', 
    'Dr. Aris Thorne', 
    'Computer Science', 
    'Python, PyTorch, Mininet, Socket Programming', 
    3, 
    '2026-11-30', 
    'Open'
),
(
    'Quantum Cryptography & Key Distribution Protocols', 
    'Analyzing post-quantum cryptographic primitives and experimental implementation of BB84 protocol simulations in software-defined networks.', 
    'Cybersecurity & Cryptography', 
    'Prof. Elena Vance', 
    'Cyber Security & Software Engineering', 
    'C++, OpenSSL, Python, Linear Algebra', 
    2, 
    '2026-12-15', 
    'Open'
),
(
    'IoT Sensor Networks for Smart Campus Energy Monitoring', 
    'Designing low-power wireless sensor node topologies using LoRaWAN and MQTT protocols for real-time telemetry analytics.', 
    'Internet of Things & Embedded Systems', 
    'Dr. Marcus Brody', 
    'Electrical & Computer Engineering', 
    'C/C++, Arduino/ESP32, MQTT, Node.js, Grafana', 
    4, 
    '2026-10-25', 
    'Closed'
);
