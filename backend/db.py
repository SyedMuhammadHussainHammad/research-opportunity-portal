import os
import sqlite3
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "research_portal")

class Database:
    def __init__(self):
        self.db_type = None
        self._init_db()

    def _init_db(self):
        """Attempts to connect to MySQL; falls back to SQLite if MySQL is unavailable."""
        try:
            # First try connecting to MySQL server to ensure DB exists
            temp_conn = pymysql.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD,
                connect_timeout=3
            )
            cursor = temp_conn.cursor()
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` DEFAULT CHARACTER SET utf8mb4;")
            temp_conn.close()

            # Now test full connection to the database
            conn = self.get_mysql_connection()
            with conn.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS opportunities (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        description TEXT NOT NULL,
                        research_area VARCHAR(150) NOT NULL,
                        faculty_name VARCHAR(150) NOT NULL,
                        department VARCHAR(150) NOT NULL,
                        required_skills TEXT NOT NULL,
                        available_positions INT NOT NULL,
                        application_deadline DATE NOT NULL,
                        status ENUM('Open', 'Closed') DEFAULT 'Open' NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)
            conn.close()
            self.db_type = "mysql"
            print(f"[Database] Successfully connected to MySQL database '{DB_NAME}' at {DB_HOST}:{DB_PORT}.")
        except Exception as e:
            print(f"[Database Warning] MySQL connection failed ({e}). Falling back to SQLite database.")
            self.db_type = "sqlite"
            self.sqlite_path = os.path.join(os.path.dirname(__file__), "..", "research_portal.db")
            conn = sqlite3.connect(self.sqlite_path)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS opportunities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    research_area TEXT NOT NULL,
                    faculty_name TEXT NOT NULL,
                    department TEXT NOT NULL,
                    required_skills TEXT NOT NULL,
                    available_positions INTEGER NOT NULL,
                    application_deadline TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'Open',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
            conn.close()
            print(f"[Database] SQLite database initialized at '{self.sqlite_path}'.")

    def get_mysql_connection(self):
        return pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=DictCursor,
            autocommit=True
        )

    def execute_query(self, query, params=(), fetch_one=False, fetch_all=False):
        if self.db_type == "mysql":
            conn = self.get_mysql_connection()
            try:
                with conn.cursor() as cursor:
                    cursor.execute(query, params)
                    if fetch_one:
                        return cursor.fetchone()
                    if fetch_all:
                        return cursor.fetchall()
                    return cursor.lastrowid
            finally:
                conn.close()
        else:
            conn = sqlite3.connect(self.sqlite_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            # Replace %s with ? for SQLite compatibility if needed
            sqlite_query = query.replace("%s", "?")
            cursor.execute(sqlite_query, params)
            result = None
            if fetch_one:
                row = cursor.fetchone()
                result = dict(row) if row else None
            elif fetch_all:
                rows = cursor.fetchall()
                result = [dict(r) for r in rows]
            else:
                conn.commit()
                result = cursor.lastrowid
            conn.close()
            return result

db = Database()
