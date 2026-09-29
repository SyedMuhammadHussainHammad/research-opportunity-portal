# Research Opportunity Portal 🎓

A complete web-based application for managing university research opportunities. Built with a **Python REST API** backend, **MySQL / SQLite** database persistence, and a modern **Bootstrap 5** frontend interface.

---

## 📌 Repository Link
**GitHub Repository:** `https://github.com/username/research-opportunity-portal`

---

## 📖 Scenario & Problem Statement
Currently, university research opportunities are scattered across emails, WhatsApp groups, and physical noticeboards. Many students miss valuable research positions, while faculty members struggle to track and manage their project openings.

The **Research Opportunity Portal** provides a centralized platform where faculty members can post, view, update, close, and delete research opportunities in real time, and students can browse and explore detailed project information.

---

## ✨ Features

- ➕ **Post Opportunities**: Faculty members can create new research openings with detailed parameters (Title, Area, Prerequisites, Positions, Deadline, Status).
- 📋 **View & Search**: Interactive dashboard displaying all opportunities with real-time text search and status filtering (All, Open, Closed).
- 🔍 **Detailed View**: View comprehensive project specifications, supervisor information, and required skills in a clean modal dialog.
- ✏️ **Edit & Update**: Seamlessly update title, department, required skills, positions, or deadlines.
- 🔒 **Status Toggle**: Quickly change project status between **Open** and **Closed**.
- 🗑️ **Delete Opportunities**: Remove unwanted or erroneous research listings with confirmation protection.
- ⚠️ **Validation & Notifications**: Client-side and server-side validation with responsive toast alerts for all actions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend API** | Python 3.11, Flask, Flask-CORS |
| **Database** | MySQL (with automatic SQLite fallback for zero-config testing) |
| **Frontend UI** | HTML5, CSS3, JavaScript (ES6 Fetch API), Bootstrap 5, Bootstrap Icons |
| **Testing** | Postman Collection, Bruno Collection, Python `unittest`/TestClient |

---

## 📁 Project Directory Structure

```
research-opportunity-portal/
├── backend/
│   ├── app.py              # Main Flask REST API application & routing
│   ├── db.py               # Database connector (MySQL / SQLite abstraction)
│   └── config.py           # Configuration settings
├── frontend/
│   ├── index.html          # Main web application interface
│   ├── css/
│   │   └── style.css       # Custom styling & responsive layout
│   └── js/
│       └── main.js         # API integration, DOM manipulation, form validation
├── database/
│   ├── schema.sql          # MySQL database schema definition
│   └── seed.sql            # Sample initial dataset
├── postman/
│   └── Research_Opportunity_Portal.postman_collection.json # Exported Postman collection
├── bruno/
│   ├── bruno.json          # Bruno collection configuration
│   └── *.bru               # Bruno request files
├── .env.example            # Sample environment variable file
├── .gitignore              # Git ignore configuration
├── requirements.txt        # Python package dependencies
└── README.md               # Project documentation
```

---

## 🚀 Setup & Installation Guide

### Prerequisites
- Python 3.8 or higher installed.
- MySQL Server (optional; e.g. via XAMPP, WAMP, or standalone MySQL).

### 1. Clone the Repository
```bash
git clone https://github.com/username/research-opportunity-portal.git
cd research-opportunity-portal
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: Do not commit actual credentials to Git.)*

### 3. Database Setup (MySQL)
Import the schema and initial seed data into MySQL:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```
*Note: If MySQL server is unavailable, the application will automatically initialize a standalone SQLite database (`research_portal.db`) for seamless execution.*

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Run Backend Server
```bash
python backend/app.py
```
The REST API server will start at: `http://localhost:5000`

### 6. Launch Frontend
Open `frontend/index.html` directly in your browser, or navigate to `http://localhost:5000/` when the server is running.

---

## 📡 REST API Reference

| HTTP Method | Endpoint | Description | Success Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/opportunities` | Create a new research opportunity | `201 Created` |
| `GET` | `/api/opportunities` | Retrieve all research opportunities | `200 OK` |
| `GET` | `/api/opportunities/:id` | Retrieve single opportunity by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/opportunities/:id` | Update an existing opportunity | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/api/opportunities/:id` | Delete an opportunity | `200 OK` / `404 Not Found` |

### Sample JSON Payload (Create / Update)
```json
{
  "title": "AI-Driven Network Traffic Optimization",
  "description": "Investigating deep reinforcement learning models for dynamic traffic routing.",
  "research_area": "Artificial Intelligence & Networking",
  "faculty_name": "Dr. Aris Thorne",
  "department": "Computer Science",
  "required_skills": "Python, PyTorch, Mininet, Socket Programming",
  "available_positions": 3,
  "application_deadline": "2026-11-30",
  "status": "Open"
}
```

---

## 🧪 Postman & Bruno API Testing

The project includes exported test suites in both **Postman** and **Bruno** formats inside `/postman` and `/bruno`.

### Tested Scenarios:
1. **Create 3 Opportunities**: POST requests creating research listings.
2. **Get All**: GET `/api/opportunities` returning complete list.
3. **Get One**: GET `/api/opportunities/1` returning specific opportunity.
4. **Update**: PUT `/api/opportunities/1` updating title and positions.
5. **Change Status**: PUT `/api/opportunities/3` setting status to `Closed`.
6. **Delete**: DELETE `/api/opportunities/2` deleting opportunity #2.
7. **Verify 404**: GET `/api/opportunities/2` confirming `404 Not Found`.
8. **Input Validation (400)**: POST invalid payload verifying `400 Bad Request`.

---

## 📹 1-Minute Demonstration Video Guide

To record the 60-second video submission, follow this time-coded script:

| Time | Action / Demonstration |
| :--- | :--- |
| **0:00 - 0:10** | Show backend server running in terminal (`python backend/app.py`) & frontend loading in browser. |
| **0:10 - 0:20** | Click "+ Post Opportunity", fill in form, and submit to create a new research opportunity. |
| **0:20 - 0:30** | Show updated list of opportunities and click "View" to display details modal. |
| **0:30 - 0:40** | Click "Edit", modify positions/deadline, and click "Close" to switch opportunity status to Closed. |
| **0:40 - 0:50** | Click "Delete" on an opportunity and show instant removal. |
| **0:50 - 1:00** | Switch to Postman/Bruno: execute request showing 404 response on deleted ID & 400 response on invalid payload. |

---

## 🔒 Security & Best Practices
- Sensitive configuration is managed via `.env`.
- Output sanitization is applied on the frontend to prevent XSS.
- Structured HTTP error handling for invalid endpoints and missing database records.
