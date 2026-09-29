import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from db import db

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

def validate_opportunity_payload(data, is_update=False):
    """Validates research opportunity input payload. Returns (is_valid, error_message)."""
    if not isinstance(data, dict):
        return False, "Invalid JSON payload. Expected a JSON object."

    required_fields = [
        "title", "description", "research_area", "faculty_name",
        "department", "required_skills", "available_positions",
        "application_deadline"
    ]

    # For POST requests, check for missing fields
    if not is_update:
        missing = [field for field in required_fields if field not in data or data[field] is None]
        if missing:
            return False, f"Missing required field(s): {', '.join(missing)}"

    # Validate individual fields if present
    if "title" in data:
        if not isinstance(data["title"], str) or not data["title"].strip():
            return False, "Title must be a non-empty string."

    if "description" in data:
        if not isinstance(data["description"], str) or not data["description"].strip():
            return False, "Description must be a non-empty string."

    if "research_area" in data:
        if not isinstance(data["research_area"], str) or not data["research_area"].strip():
            return False, "Research area must be a non-empty string."

    if "faculty_name" in data:
        if not isinstance(data["faculty_name"], str) or not data["faculty_name"].strip():
            return False, "Faculty name must be a non-empty string."

    if "department" in data:
        if not isinstance(data["department"], str) or not data["department"].strip():
            return False, "Department must be a non-empty string."

    if "required_skills" in data:
        if not isinstance(data["required_skills"], str) or not data["required_skills"].strip():
            return False, "Required skills must be a non-empty string."

    if "available_positions" in data:
        val = data["available_positions"]
        if isinstance(val, bool) or not isinstance(val, int) or val < 0:
            return False, "Available positions must be a non-negative integer."

    if "application_deadline" in data:
        deadline_str = str(data["application_deadline"]).strip()
        try:
            datetime.strptime(deadline_str, "%Y-%m-%d")
        except ValueError:
            return False, "Application deadline must be a valid date in YYYY-MM-DD format."

    if "status" in data:
        status_val = str(data["status"]).strip()
        if status_val not in ["Open", "Closed"]:
            return False, "Status must be either 'Open' or 'Closed'."

    return True, None


def format_opportunity(opp):
    """Formats database row dict into clean API response dict."""
    if not opp:
        return None
    
    # Format date object or string to standard YYYY-MM-DD
    deadline = opp.get("application_deadline")
    if hasattr(deadline, "strftime"):
        deadline_str = deadline.strftime("%Y-%m-%d")
    else:
        deadline_str = str(deadline) if deadline else ""

    created_at = opp.get("created_at")
    if hasattr(created_at, "strftime"):
        created_str = created_at.strftime("%Y-%m-%d %H:%M:%S")
    else:
        created_str = str(created_at) if created_at else ""

    return {
        "id": int(opp["id"]),
        "title": str(opp["title"]),
        "description": str(opp["description"]),
        "research_area": str(opp["research_area"]),
        "faculty_name": str(opp["faculty_name"]),
        "department": str(opp["department"]),
        "required_skills": str(opp["required_skills"]),
        "available_positions": int(opp["available_positions"]),
        "application_deadline": deadline_str,
        "status": str(opp["status"]),
        "created_at": created_str
    }


# Serve Frontend Static Files
@app.route("/")
def serve_frontend():
    return send_from_directory(app.static_folder, "index.html")


# REST API Endpoints

# 1. Create a Research Opportunity
@app.route("/api/opportunities", methods=["POST"])
def create_opportunity():
    data = request.get_json(silent=True)
    is_valid, error_msg = validate_opportunity_payload(data, is_update=False)
    if not is_valid:
        return jsonify({
            "error": "Bad Request",
            "message": error_msg
        }), 400

    status = data.get("status", "Open")
    if status not in ["Open", "Closed"]:
        status = "Open"

    query = """
        INSERT INTO opportunities 
        (title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        data["title"].strip(),
        data["description"].strip(),
        data["research_area"].strip(),
        data["faculty_name"].strip(),
        data["department"].strip(),
        data["required_skills"].strip(),
        int(data["available_positions"]),
        str(data["application_deadline"]).strip(),
        status
    )

    try:
        new_id = db.execute_query(query, params)
        fetched = db.execute_query("SELECT * FROM opportunities WHERE id = %s", (new_id,), fetch_one=True)
        return jsonify({
            "message": "Research opportunity created successfully.",
            "data": format_opportunity(fetched)
        }), 201
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500


# 2. Retrieve All Research Opportunities
@app.route("/api/opportunities", methods=["GET"])
def get_all_opportunities():
    try:
        rows = db.execute_query("SELECT * FROM opportunities ORDER BY id DESC", fetch_all=True)
        opportunities = [format_opportunity(row) for row in rows] if rows else []
        return jsonify({
            "count": len(opportunities),
            "data": opportunities
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500


# 3. Retrieve One Research Opportunity
@app.route("/api/opportunities/<int:opp_id>", methods=["GET"])
def get_opportunity_by_id(opp_id):
    try:
        opp = db.execute_query("SELECT * FROM opportunities WHERE id = %s", (opp_id,), fetch_one=True)
        if not opp:
            return jsonify({
                "error": "Not Found",
                "message": f"Research opportunity with ID {opp_id} was not found."
            }), 404
        return jsonify({
            "data": format_opportunity(opp)
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500


# 4. Update a Research Opportunity
@app.route("/api/opportunities/<int:opp_id>", methods=["PUT"])
def update_opportunity(opp_id):
    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            "error": "Bad Request",
            "message": "Request body must contain valid JSON data."
        }), 400

    # Check if resource exists
    existing = db.execute_query("SELECT * FROM opportunities WHERE id = %s", (opp_id,), fetch_one=True)
    if not existing:
        return jsonify({
            "error": "Not Found",
            "message": f"Research opportunity with ID {opp_id} was not found."
        }), 404

    is_valid, error_msg = validate_opportunity_payload(data, is_update=True)
    if not is_valid:
        return jsonify({
            "error": "Bad Request",
            "message": error_msg
        }), 400

    # Prepare merged values
    title = data.get("title", existing["title"]).strip() if isinstance(data.get("title"), str) else existing["title"]
    description = data.get("description", existing["description"]).strip() if isinstance(data.get("description"), str) else existing["description"]
    research_area = data.get("research_area", existing["research_area"]).strip() if isinstance(data.get("research_area"), str) else existing["research_area"]
    faculty_name = data.get("faculty_name", existing["faculty_name"]).strip() if isinstance(data.get("faculty_name"), str) else existing["faculty_name"]
    department = data.get("department", existing["department"]).strip() if isinstance(data.get("department"), str) else existing["department"]
    required_skills = data.get("required_skills", existing["required_skills"]).strip() if isinstance(data.get("required_skills"), str) else existing["required_skills"]
    available_positions = int(data.get("available_positions", existing["available_positions"]))
    application_deadline = str(data.get("application_deadline", existing["application_deadline"])).strip()
    status = data.get("status", existing["status"]).strip()

    query = """
        UPDATE opportunities 
        SET title = %s, description = %s, research_area = %s, faculty_name = %s,
            department = %s, required_skills = %s, available_positions = %s,
            application_deadline = %s, status = %s
        WHERE id = %s
    """
    params = (
        title, description, research_area, faculty_name,
        department, required_skills, available_positions,
        application_deadline, status, opp_id
    )

    try:
        db.execute_query(query, params)
        updated = db.execute_query("SELECT * FROM opportunities WHERE id = %s", (opp_id,), fetch_one=True)
        return jsonify({
            "message": f"Research opportunity #{opp_id} updated successfully.",
            "data": format_opportunity(updated)
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500


# 5. Delete a Research Opportunity
@app.route("/api/opportunities/<int:opp_id>", methods=["DELETE"])
def delete_opportunity(opp_id):
    try:
        existing = db.execute_query("SELECT * FROM opportunities WHERE id = %s", (opp_id,), fetch_one=True)
        if not existing:
            return jsonify({
                "error": "Not Found",
                "message": f"Research opportunity with ID {opp_id} was not found."
            }), 404

        db.execute_query("DELETE FROM opportunities WHERE id = %s", (opp_id,))
        return jsonify({
            "message": f"Research opportunity #{opp_id} deleted successfully."
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500


# Fallback 404 handler for invalid routes
@app.errorhandler(404)
def handle_404(e):
    if request.path.startswith("/api/"):
        return jsonify({
            "error": "Not Found",
            "message": "The requested API endpoint does not exist."
        }), 404
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"Starting Research Opportunity Portal API server on http://localhost:{port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
