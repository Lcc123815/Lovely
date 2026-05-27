from contextlib import asynccontextmanager
from datetime import datetime
import base64
import hashlib
import hmac
import json
import os
from pathlib import Path
import secrets
import time
from typing import Any

import pymysql
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pymysql.cursors import DictCursor
from pydantic import BaseModel

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "L123456")
DB_NAME = os.getenv("DB_NAME", "campus_cats")
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-development")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_SECONDS = 60 * 60 * 24
BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
UPLOAD_DIR = BASE_DIR / "uploads"
FRONTEND_DIST_DIR = PROJECT_DIR / "frontend" / "dist"

TABLES: dict[str, dict[str, Any]] = {
    "users": {
        "columns": """
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(100) NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at VARCHAR(20) NOT NULL
        """,
        "fields": ["username", "password_hash"],
    },
    "cats": {
        "columns": """
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            gender VARCHAR(20),
            age VARCHAR(50),
            color VARCHAR(100),
            breed VARCHAR(100),
            campus_area VARCHAR(100),
            health_status VARCHAR(50),
            sterilized VARCHAR(20),
            adoption_status VARCHAR(50),
            photo TEXT,
            personality TEXT,
            description TEXT,
            created_at VARCHAR(20) NOT NULL
        """,
        "fields": ["name", "gender", "age", "color", "breed", "campus_area", "health_status", "sterilized", "adoption_status", "photo", "personality", "description"],
    },
    "health_records": {
        "columns": """
            id INT PRIMARY KEY AUTO_INCREMENT,
            cat_id INT,
            cat_name VARCHAR(100),
            record_type VARCHAR(50) NOT NULL,
            record_date VARCHAR(20),
            symptom TEXT,
            treatment TEXT,
            hospital VARCHAR(200),
            cost DECIMAL(10,2) DEFAULT 0,
            status VARCHAR(50),
            remark TEXT,
            created_at VARCHAR(20) NOT NULL
        """,
        "fields": ["cat_id", "cat_name", "record_type", "record_date", "symptom", "treatment", "hospital", "cost", "status", "remark"],
    },
    "adoptions": {
        "columns": """
            id INT PRIMARY KEY AUTO_INCREMENT,
            cat_id INT,
            cat_name VARCHAR(100),
            applicant_name VARCHAR(100) NOT NULL,
            student_no VARCHAR(50),
            phone VARCHAR(50),
            college VARCHAR(100),
            reason TEXT,
            experience TEXT,
            status VARCHAR(50),
            apply_time VARCHAR(20),
            review_remark TEXT,
            created_at VARCHAR(20) NOT NULL
        """,
        "fields": ["cat_id", "cat_name", "applicant_name", "student_no", "phone", "college", "reason", "experience", "status", "apply_time", "review_remark"],
    },
    "posts": {
        "columns": """
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(200) NOT NULL,
            content TEXT,
            publisher VARCHAR(100),
            category VARCHAR(50),
            images TEXT,
            likes INT DEFAULT 0,
            status VARCHAR(20),
            created_at VARCHAR(20) NOT NULL
        """,
        "fields": ["title", "content", "publisher", "category", "images", "likes", "status"],
    },
    "supplies": {
        "columns": """
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            category VARCHAR(50),
            quantity DECIMAL(10,2) DEFAULT 0,
            unit VARCHAR(20),
            source VARCHAR(100),
            storage_location VARCHAR(100),
            status VARCHAR(20),
            remark TEXT,
            created_at VARCHAR(20) NOT NULL
        """,
        "fields": ["name", "category", "quantity", "unit", "source", "storage_location", "status", "remark"],
    },
    "donations": {
        "columns": """
            id INT PRIMARY KEY AUTO_INCREMENT,
            donor_name VARCHAR(100) NOT NULL,
            donation_type VARCHAR(20),
            amount DECIMAL(10,2) DEFAULT 0,
            material_name VARCHAR(100),
            quantity DECIMAL(10,2) DEFAULT 0,
            donation_date VARCHAR(20),
            contact VARCHAR(100),
            remark TEXT,
            created_at VARCHAR(20) NOT NULL
        """,
        "fields": ["donor_name", "donation_type", "amount", "material_name", "quantity", "donation_date", "contact", "remark"],
    },
    "comments": {
        "columns": """
            id INT PRIMARY KEY AUTO_INCREMENT,
            post_id INT NOT NULL,
            author_name VARCHAR(100) NOT NULL,
            content TEXT NOT NULL,
            status VARCHAR(20),
            created_at VARCHAR(20) NOT NULL
        """,
        "fields": ["post_id", "author_name", "content", "status"],
    },
}

SEED_DATA: dict[str, list[dict[str, Any]]] = {
    "users": [
        {"username": "admin", "password_hash": ""},
    ],
    "cats": [
        {"name": "橘子", "gender": "公", "age": "2岁", "color": "橘色", "breed": "中华田园猫", "campus_area": "图书馆", "health_status": "健康", "sterilized": "是", "adoption_status": "待领养", "photo": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba", "personality": "亲人活泼", "description": "经常在图书馆门口晒太阳"},
        {"name": "奶茶", "gender": "母", "age": "1岁", "color": "奶牛色", "breed": "中华田园猫", "campus_area": "食堂", "health_status": "观察中", "sterilized": "否", "adoption_status": "暂不开放", "photo": "https://images.unsplash.com/photo-1574158622682-e40e69881006", "personality": "胆小温顺", "description": "最近食欲一般，需要持续观察"},
    ],
    "health_records": [
        {"cat_id": 1, "cat_name": "橘子", "record_type": "体检", "record_date": "2026-05-01", "symptom": "常规检查", "treatment": "状态良好", "hospital": "校园动物诊疗点", "cost": 30, "status": "已完成", "remark": "建议按期驱虫"},
    ],
    "adoptions": [
        {"cat_id": 1, "cat_name": "橘子", "applicant_name": "李同学", "student_no": "20260001", "phone": "13800000000", "college": "信息学院", "reason": "有稳定宿舍外住所，喜欢猫咪", "experience": "曾照顾家中猫咪", "status": "待审核", "apply_time": "2026-05-20", "review_remark": ""},
    ],
    "posts": [
        {"title": "图书馆橘猫今日状态良好", "content": "橘子今天在图书馆附近活动，状态正常。", "publisher": "校园猫咪守护队", "category": "日常动态", "images": "", "likes": 18, "status": "显示"},
    ],
    "supplies": [
        {"name": "成猫猫粮", "category": "猫粮", "quantity": 12, "unit": "kg", "source": "社团采购", "storage_location": "活动室A柜", "status": "充足", "remark": "优先用于图书馆区域"},
    ],
    "donations": [
        {"donor_name": "王老师", "donation_type": "资金", "amount": 200, "material_name": "", "quantity": 0, "donation_date": "2026-05-15", "contact": "", "remark": "用于购买猫粮"},
    ],
}

class ItemPayload(BaseModel):
    data: dict[str, Any]


class AuthPayload(BaseModel):
    username: str
    password: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="校园萌宠守护系统 API", lifespan=lifespan)
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


def now_text():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def hash_password(password: str):
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120000)
    return f"pbkdf2_sha256${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def verify_password(password: str, stored_hash: str):
    try:
        algorithm, salt_text, digest_text = stored_hash.split("$", 2)
        if algorithm != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(salt_text.encode())
        expected = base64.b64decode(digest_text.encode())
        current = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120000)
        return hmac.compare_digest(current, expected)
    except ValueError:
        return False


def encode_base64_url(data: bytes):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def create_token(user: dict[str, Any]):
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    payload = {
        "sub": str(user["id"]),
        "username": user["username"],
        "exp": int(time.time()) + JWT_EXPIRE_SECONDS,
    }
    header_text = encode_base64_url(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_text = encode_base64_url(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_text}.{payload_text}".encode("utf-8")
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{header_text}.{payload_text}.{encode_base64_url(signature)}"


def connect(database: str | None = None):
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=database or DB_NAME,
        charset="utf8mb4",
        cursorclass=DictCursor,
        autocommit=False,
        connect_timeout=5,
        read_timeout=5,
        write_timeout=5,
    )
    return conn


def ensure_database():
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        charset="utf8mb4",
        cursorclass=DictCursor,
        autocommit=True,
        connect_timeout=5,
        read_timeout=5,
        write_timeout=5,
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
    finally:
        conn.close()


def init_db():
    ensure_database()
    with connect() as conn:
        with conn.cursor() as cursor:
            for table, config in TABLES.items():
                cursor.execute(f"CREATE TABLE IF NOT EXISTS `{table}` ({config['columns']}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4")
            conn.commit()
            for table, rows in SEED_DATA.items():
                cursor.execute(f"SELECT COUNT(*) AS total FROM `{table}`")
                total = cursor.fetchone()["total"]
                if total == 0:
                    for row in rows:
                        seed_row = dict(row)
                        if table == "users" and not seed_row.get("password_hash"):
                            seed_row["password_hash"] = hash_password("123456")
                        create_item(conn, table, seed_row)
            conn.commit()


def row_to_dict(row):
    return dict(row) if row else None


def create_item(conn, table: str, data: dict[str, Any]):
    fields = TABLES[table]["fields"]
    payload = {field: data.get(field) for field in fields}
    payload["created_at"] = now_text()
    columns = list(payload.keys())
    placeholders = ", ".join(["%s"] * len(columns))
    with conn.cursor() as cursor:
        cursor.execute(
            f"INSERT INTO `{table}` ({', '.join(f'`{column}`' for column in columns)}) VALUES ({placeholders})",
            [payload[column] for column in columns],
        )


def build_filters(table: str, params: dict[str, Any]):
    fields = TABLES[table]["fields"]
    clauses = []
    values = []
    keyword = params.pop("keyword", None)
    for key, value in params.items():
        if key in fields and value not in (None, ""):
            clauses.append(f"`{key}` = %s")
            values.append(value)
    if keyword:
        like_fields = [field for field in ["name", "title", "cat_name", "applicant_name", "donor_name"] if field in fields]
        if like_fields:
            clauses.append("(" + " OR ".join([f"`{field}` LIKE %s" for field in like_fields]) + ")")
            values.extend([f"%{keyword}%"] * len(like_fields))
    where = " WHERE " + " AND ".join(clauses) if clauses else ""
    return where, values


def list_items(table: str, params: dict[str, Any]):
    with connect() as conn:
        with conn.cursor() as cursor:
            where, values = build_filters(table, params)
            cursor.execute(f"SELECT * FROM `{table}`{where} ORDER BY id DESC", values)
            return [row_to_dict(row) for row in cursor.fetchall()]


def get_item(table: str, item_id: int):
    with connect() as conn:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT * FROM `{table}` WHERE id = %s", [item_id])
            item = row_to_dict(cursor.fetchone())
            if not item:
                raise HTTPException(status_code=404, detail="数据不存在")
            return item


def insert_item(table: str, data: dict[str, Any]):
    with connect() as conn:
        fields = TABLES[table]["fields"]
        payload = {field: data.get(field) for field in fields}
        payload["created_at"] = now_text()
        columns = list(payload.keys())
        placeholders = ", ".join(["%s"] * len(columns))
        with conn.cursor() as cursor:
            cursor.execute(
                f"INSERT INTO `{table}` ({', '.join(f'`{column}`' for column in columns)}) VALUES ({placeholders})",
                [payload[column] for column in columns],
            )
            conn.commit()
            return get_item(table, cursor.lastrowid)


def update_item(table: str, item_id: int, data: dict[str, Any]):
    fields = [field for field in TABLES[table]["fields"] if field in data]
    if not fields:
        return get_item(table, item_id)
    with connect() as conn:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT id FROM `{table}` WHERE id = %s", [item_id])
            exists = cursor.fetchone()
            if not exists:
                raise HTTPException(status_code=404, detail="数据不存在")
            assignments = ", ".join([f"`{field}` = %s" for field in fields])
            cursor.execute(
                f"UPDATE `{table}` SET {assignments} WHERE id = %s",
                [data[field] for field in fields] + [item_id],
            )
            conn.commit()
            return get_item(table, item_id)


def delete_item(table: str, item_id: int):
    with connect() as conn:
        with conn.cursor() as cursor:
            cursor.execute(f"DELETE FROM `{table}` WHERE id = %s", [item_id])
            conn.commit()
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="数据不存在")
            return {"success": True}


@app.post("/api/auth/register")
def register(payload: AuthPayload):
    username = payload.username.strip()
    password = payload.password.strip()
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="用户名至少需要 3 个字符")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="密码至少需要 6 个字符")
    with connect() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM `users` WHERE username = %s", [username])
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="用户名已存在")
            password_hash = hash_password(password)
            cursor.execute(
                "INSERT INTO `users` (`username`, `password_hash`, `created_at`) VALUES (%s, %s, %s)",
                [username, password_hash, now_text()],
            )
            conn.commit()
            user = {"id": cursor.lastrowid, "username": username}
    return {"token": create_token(user), "user": user}


@app.post("/api/auth/login")
def login(payload: AuthPayload):
    username = payload.username.strip()
    password = payload.password.strip()
    with connect() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, username, password_hash FROM `users` WHERE username = %s", [username])
            user = cursor.fetchone()
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    user_info = {"id": user["id"], "username": user["username"]}
    return {"token": create_token(user_info), "user": user_info}


@app.get("/api/dashboard/stats")
def dashboard_stats():
    with connect() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total FROM `cats`")
            cats_total = cursor.fetchone()["total"]
            cursor.execute("SELECT COUNT(*) AS total FROM `cats` WHERE adoption_status = '待领养'")
            adoptable_total = cursor.fetchone()["total"]
            cursor.execute("SELECT COUNT(*) AS total FROM `cats` WHERE health_status != '健康'")
            health_warning_total = cursor.fetchone()["total"]
            cursor.execute("SELECT COUNT(*) AS total FROM `posts`")
            posts_total = cursor.fetchone()["total"]
            cursor.execute("SELECT COALESCE(SUM(quantity), 0) AS total FROM `supplies`")
            supplies_total = cursor.fetchone()["total"]
            cursor.execute("SELECT COALESCE(SUM(amount), 0) AS total FROM `donations`")
            donation_amount = cursor.fetchone()["total"]
    return {
        "cats_total": cats_total,
        "adoptable_total": adoptable_total,
        "health_warning_total": health_warning_total,
        "posts_total": posts_total,
        "supplies_total": supplies_total,
        "donation_amount": donation_amount,
    }


def register_routes(path: str, table: str):
    @app.get(f"/api/{path}")
    def list_route(
        keyword: str | None = None,
        status: str | None = None,
        category: str | None = None,
        health_status: str | None = None,
        adoption_status: str | None = None,
        record_type: str | None = None,
        donation_type: str | None = None,
    ):
        params = {
            "keyword": keyword,
            "status": status,
            "category": category,
            "health_status": health_status,
            "adoption_status": adoption_status,
            "record_type": record_type,
            "donation_type": donation_type,
        }
        return list_items(table, params)

    @app.get(f"/api/{path}/{{item_id}}")
    def get_route(item_id: int):
        return get_item(table, item_id)

    @app.post(f"/api/{path}")
    def create_route(payload: ItemPayload):
        return insert_item(table, payload.data)

    @app.put(f"/api/{path}/{{item_id}}")
    def update_route(item_id: int, payload: ItemPayload):
        return update_item(table, item_id, payload.data)

    @app.delete(f"/api/{path}/{{item_id}}")
    def delete_route(item_id: int):
        return delete_item(table, item_id)


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
        raise HTTPException(status_code=400, detail="仅支持图片文件")
    filename = f"{int(time.time() * 1000)}_{secrets.token_hex(8)}{suffix}"
    target = UPLOAD_DIR / filename
    content = await file.read()
    target.write_bytes(content)
    return {"url": f"http://127.0.0.1:8001/uploads/{filename}"}


@app.get("/api/portal/stats")
def portal_stats():
    return dashboard_stats()


@app.get("/api/portal/cats")
def portal_cats(keyword: str | None = None, health_status: str | None = None, adoption_status: str | None = None):
    return list_items("cats", {"keyword": keyword, "health_status": health_status, "adoption_status": adoption_status})


@app.get("/api/portal/cats/{cat_id}")
def portal_cat_detail(cat_id: int):
    cat = get_item("cats", cat_id)
    with connect() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM `health_records` WHERE cat_id = %s ORDER BY id DESC", [cat_id])
            cat["health_records"] = [row_to_dict(row) for row in cursor.fetchall()]
    return cat


@app.get("/api/portal/posts")
def portal_posts(category: str | None = None):
    params = {"status": "显示", "category": category}
    return list_items("posts", params)


@app.get("/api/portal/posts/{post_id}")
def portal_post_detail(post_id: int):
    return get_item("posts", post_id)


@app.post("/api/portal/posts")
def portal_create_post(payload: ItemPayload):
    data = dict(payload.data)
    data["status"] = "显示"
    data["likes"] = 0
    return insert_item("posts", data)


@app.post("/api/portal/posts/{post_id}/like")
def portal_like_post(post_id: int):
    with connect() as conn:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE `posts` SET likes = COALESCE(likes, 0) + 1 WHERE id = %s", [post_id])
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="动态不存在")
            conn.commit()
    return get_item("posts", post_id)


@app.get("/api/portal/posts/{post_id}/comments")
def portal_comments(post_id: int):
    with connect() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM `comments` WHERE post_id = %s AND status = '显示' ORDER BY id DESC", [post_id])
            return [row_to_dict(row) for row in cursor.fetchall()]


@app.post("/api/portal/posts/{post_id}/comments")
def portal_create_comment(post_id: int, payload: ItemPayload):
    get_item("posts", post_id)
    data = dict(payload.data)
    data["post_id"] = post_id
    data["status"] = "显示"
    return insert_item("comments", data)


@app.get("/api/portal/supplies")
def portal_supplies(category: str | None = None):
    return list_items("supplies", {"category": category})


@app.post("/api/portal/adoptions")
def portal_create_adoption(payload: ItemPayload):
    data = dict(payload.data)
    data["status"] = "待审核"
    if not data.get("apply_time"):
        data["apply_time"] = datetime.now().strftime("%Y-%m-%d")
    return insert_item("adoptions", data)


@app.post("/api/portal/donations")
def portal_create_donation(payload: ItemPayload):
    data = dict(payload.data)
    if not data.get("donation_date"):
        data["donation_date"] = datetime.now().strftime("%Y-%m-%d")
    return insert_item("donations", data)


register_routes("cats", "cats")
register_routes("health-records", "health_records")
register_routes("adoptions", "adoptions")
register_routes("posts", "posts")
register_routes("supplies", "supplies")
register_routes("donations", "donations")

if FRONTEND_DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST_DIR / "assets"), name="frontend-assets")


@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    index_file = FRONTEND_DIST_DIR / "index.html"
    target_file = FRONTEND_DIST_DIR / full_path
    if target_file.exists() and target_file.is_file():
        return FileResponse(target_file)
    if index_file.exists():
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="前端页面未打包，请先在 frontend 目录执行 npm run build")
