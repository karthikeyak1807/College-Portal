from fastapi import FastAPI, Form, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import shutil
from datetime import datetime
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import bcrypt
import re
import secrets
import hashlib
from datetime import timedelta
import smtplib

from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")

def send_teacher_invitation_email(
    teacher_email,
    teacher_name,
    teacher_id,
    setup_link
):
    if not EMAIL_ADDRESS or not EMAIL_APP_PASSWORD:
        raise RuntimeError("Email configuration is missing.")

    message = EmailMessage()

    message["Subject"] = "College Portal - Set Your Password"
    message["From"] = EMAIL_ADDRESS
    message["To"] = teacher_email

    message.set_content(
        f"""Dear {teacher_name},

Your Teacher account has been created in the College Portal.

Teacher ID: {teacher_id}

Please use the secure link below to create your password:

{setup_link}

This link will expire in 24 hours and can only be used once.

After setting your password, you can log in through the normal College Portal login page.

If you did not expect this email, please contact the HOD.

Regards,
College Portal"""
    )

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls()
        smtp.login(EMAIL_ADDRESS, EMAIL_APP_PASSWORD)
        smtp.send_message(message)

def send_hod_invitation_email(
    hod_email,
    hod_name,
    hod_id,
    setup_link
):
    if not EMAIL_ADDRESS or not EMAIL_APP_PASSWORD:
        raise RuntimeError("Email configuration is missing.")

    message = EmailMessage()

    message["Subject"] = "College Portal - HOD Account Invitation"
    message["From"] = EMAIL_ADDRESS
    message["To"] = hod_email

    message.set_content(
        f"""Dear {hod_name},

Your HOD account has been created in the College Portal.

HOD ID: {hod_id}

Please use the secure link below to create your password:

{setup_link}

This link will expire in 24 hours and can only be used once.

After setting your password, you can log in through the normal College Portal login page.

If you did not expect this email, please contact the Primary HOD.

Regards,
College Portal"""
    )

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls()
        smtp.login(
            EMAIL_ADDRESS,
            EMAIL_APP_PASSWORD
        )
        smtp.send_message(message)

app = FastAPI(
    title="College Academic Portal API"
)


# ==============================
# CORS
# ==============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# MONGODB
# ==============================

MONGO_URL = os.getenv(
    "MONGO_URL",
    "mongodb://127.0.0.1:27017"
)

client = MongoClient(MONGO_URL)

db = client["college_portal"]

users_collection = db["users"]
materials_collection = db["materials"]
subjects_collection = db["subjects"]

# ==============================
# UPLOAD DIRECTORY
# ==============================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "uploads"
)

FRONTEND_DIR = os.path.join(
    BASE_DIR,
    "frontend"
)

ASSETS_DIR = os.path.join(
    BASE_DIR,
    "assets"
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)

app.mount(
    "/assets",
    StaticFiles(directory=ASSETS_DIR),
    name="assets"
)

# ==============================
# HOME
# ==============================

@app.get("/")
def home():
    return FileResponse(
        os.path.join(FRONTEND_DIR, "index.html")
    )


# ==============================
# HEALTH
# ==============================

@app.get("/health")
def health():
    return {
        "status": "ok"
    }


# ==============================
# DATABASE TEST
# ==============================

@app.get("/db-test")
def db_test():

    try:
        client.admin.command("ping")

        return {
            "status": "success",
            "message": "MongoDB connected successfully!"
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }

    # ==============================
# PUBLIC PORTAL STATISTICS
# ==============================

@app.get("/portal-stats")
def portal_stats():

    try:

        # Count teachers
        total_teachers = users_collection.count_documents({
            "role": "teacher"
        })

        # Count students
        total_students = users_collection.count_documents({
            "role": "student"
        })

        # Count uploaded materials
        total_materials = materials_collection.count_documents({})

        # Calculate actual material storage
        total_storage_bytes = 0

        materials = materials_collection.find(
            {},
            {
                "file_path": 1
            }
        )

        for material in materials:

            file_path = material.get("file_path")

            if file_path and os.path.isfile(file_path):

                total_storage_bytes += os.path.getsize(
                    file_path
                )

        # Convert bytes to MB
        total_storage_mb = round(
            total_storage_bytes / (1024 * 1024),
            2
        )

        return {

            "status": "success",

            "teachers": total_teachers,

            "students": total_students,

            "materials": total_materials,

            "storage_bytes": total_storage_bytes,

            "storage_mb": total_storage_mb

        }

    except Exception as error:

        print(
            "Portal statistics error:",
            error
        )

        return {

            "status": "error",

            "message": "Unable to load portal statistics."

        }


# ==============================
# LOGIN
# ==============================

@app.post("/login")
def login(
    user_id: str = Form(...),
    password: str = Form(...)
):

    # ==============================
    # FIND USER
    # ==============================

    user = users_collection.find_one({
        "user_id": user_id
    })


    # ==============================
    # USER NOT FOUND
    # ==============================

    if not user:

        return {
            "status": "error",
            "message": "Invalid ID or password."
        }


    # ==============================
    # TEACHER PASSWORD SETUP CHECK
    # ==============================

    if (
        user.get("role") in ["teacher", "admin"]
        and not user.get("password_hash")
    ):
        return {
            "status": "password_setup_required",
            "role": user.get("role"),
            "user_id": user.get("user_id"),
            "name": user.get("name", ""),
            "message": "Please set your password using the invitation link sent to your email."
        }

    # ==============================
    # CHECK PASSWORD
    # ==============================

    try:

        password_valid = bcrypt.checkpw(

            password.encode("utf-8"),

            user["password_hash"].encode("utf-8")

        )

    except Exception:

        return {

            "status":
                "error",

            "message":
                "Invalid ID or password."
        }


    # ==============================
    # INVALID PASSWORD
    # ==============================

    if not password_valid:

        return {

            "status":
                "error",

            "message":
                "Invalid ID or password."
        }


    # ==============================
    # STUDENT
    # ==============================

    if user["role"] == "student":

        approval_status = user.get(
            "approval_status",
            "pending"
        )


        # Student approved

        if approval_status == "approved":

            return {

                "status":
                    "success",

                "role":
                    "student",

                "user_id":
                    user["user_id"],

                "name":
                    user.get("name", ""),

                "approval_status":
                    "approved"
            }


        # Student not approved

        return {

            "status":
                "pending",

            "role":
                "student",

            "user_id":
                user["user_id"],

            "name":
                user.get("name", ""),

            "approval_status":
                approval_status,

            "message":
                "Your access request is waiting for HOD approval."
        }


    # ==============================
    # TEACHER
    # ==============================

    if user["role"] == "teacher":

        return {

            "status":
                "success",

            "role":
                "teacher",

            "user_id":
                user["user_id"],

            "name":
                user.get("name", "")
        }


    # ==============================
    # ADMIN / HOD
    # ==============================

    if user["role"] == "admin":

        return {

            "status":
                "success",

            "role":
                "admin",

            "user_id":
                user["user_id"],

            "name":
                user.get("name", "")
        }


    # ==============================
    # UNKNOWN ROLE
    # ==============================

    return {

        "status":
            "error",

        "message":
            "Unknown user role."
    }

# ==============================
# TEACHER PASSWORD SETUP
# ==============================

@app.post("/teachers/set-password")
def set_teacher_password(
    token: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...)
):

    # ==============================
    # BASIC PASSWORD VALIDATION
    # ==============================

    if len(password) < 8:

        return {
            "status": "error",
            "message": "Password must contain at least 8 characters."
        }


    if password != confirm_password:

        return {
            "status": "error",
            "message": "Passwords do not match."
        }


    # ==============================
    # HASH RECEIVED TOKEN
    # ==============================

    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


    # ==============================
    # FIND TEACHER USING TOKEN
    # ==============================

    teacher = users_collection.find_one({

        "role": "teacher",

        "teacher_invite_token_hash": token_hash,

        "teacher_invite_used": False

    })


    # ==============================
    # INVALID TOKEN
    # ==============================

    if not teacher:

        return {
            "status": "error",
            "message": "This password setup link is invalid or has already been used."
        }


    # ==============================
    # CHECK TOKEN EXPIRATION
    # ==============================

    expires_at = teacher.get(
        "teacher_invite_expires_at"
    )


    if not expires_at:

        return {
            "status": "error",
            "message": "This password setup link is invalid."
        }


    if datetime.now() > expires_at:

        return {
            "status": "error",
            "message": "This password setup link has expired. Please contact the HOD for a new invitation."
        }


    # ==============================
    # HASH PASSWORD
    # ==============================

    hashed_password = bcrypt.hashpw(

        password.encode("utf-8"),

        bcrypt.gensalt()

    ).decode("utf-8")


    # ==============================
    # UPDATE TEACHER ACCOUNT
    # ==============================

    users_collection.update_one(

        {
            "_id": teacher["_id"]
        },

        {
            "$set": {

                "password_hash":
                    hashed_password,

                "password_set":
                    True,

                "password_setup_completed_at":
                    datetime.now(),

                "teacher_invite_used":
                    True

            },

            "$unset": {

                "teacher_invite_token_hash":
                    "",

                "teacher_invite_expires_at":
                    ""

            }

        }

    )


    # ==============================
    # SUCCESS
    # ==============================

    return {

        "status": "success",

        "message":
            "Password created successfully! You can now login to the College Portal.",

        "user_id":
            teacher.get("user_id"),

        "name":
            teacher.get("name", "")

    }

@app.post("/hods/set-password")
def set_hod_password(
    hod_id: str = Form(...),
    token: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...)
):
    hod_id = hod_id.strip().upper()

    # ==============================
    # FIND HOD
    # ==============================

    hod = users_collection.find_one({
        "user_id": hod_id,
        "role": "admin"
    })

    if not hod:
        return {
            "status": "error",
            "message": "HOD account not found."
        }

    # ==============================
    # CHECK PASSWORD ALREADY SET
    # ==============================

    if hod.get("password_hash"):
        return {
            "status": "error",
            "message": "Password has already been set for this HOD account."
        }

    # ==============================
    # CHECK INVITATION USED
    # ==============================

    if hod.get("hod_invite_used"):
        return {
            "status": "error",
            "message": "This invitation link has already been used."
        }

    # ==============================
    # CHECK TOKEN
    # ==============================

    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    if token_hash != hod.get("hod_invite_token_hash"):
        return {
            "status": "error",
            "message": "Invalid invitation link."
        }

    # ==============================
    # CHECK TOKEN EXPIRY
    # ==============================

    expires_at = hod.get("hod_invite_expires_at")

    if not expires_at or expires_at <= datetime.now():
        return {
            "status": "error",
            "message": "This invitation link has expired."
        }

    # ==============================
    # VALIDATE PASSWORD
    # ==============================

    if len(password) < 6:
        return {
            "status": "error",
            "message": "Password must contain at least 6 characters."
        }

    if password != confirm_password:
        return {
            "status": "error",
            "message": "Passwords do not match."
        }

    # ==============================
    # HASH PASSWORD
    # ==============================

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # ==============================
    # SAVE PASSWORD
    # ==============================

    users_collection.update_one(
        {
            "user_id": hod_id,
            "role": "admin"
        },
        {
            "$set": {
                "password_hash": hashed_password,
                "password_set": True,
                "hod_invite_used": True
            },
            "$unset": {
                "hod_invite_token_hash": "",
                "hod_invite_expires_at": ""
            }
        }
    )

    return {
        "status": "success",
        "message": "HOD password created successfully. You can now log in.",
        "user_id": hod_id
    }

# ==============================
# CREATE INITIAL HOD
# ==============================

@app.post("/setup-hod")
def setup_hod():

    hod_id = "HOD01"
    hod_password = "HOD@1"

    existing_hod = users_collection.find_one({
        "user_id": hod_id
    })

    if existing_hod:

        return {
            "status": "exists",
            "message": "HOD account already exists."
        }

    hashed_password = bcrypt.hashpw(
        hod_password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    hod = {
        "user_id": hod_id,
        "name": "HOD",
        "email": "hod@college.edu",
        "role": "admin",
        "password_hash": hashed_password,
        "approval_status": "approved"
    }

    users_collection.insert_one(hod)

    return {
        "status": "success",
        "message": "HOD account created successfully!",
        "user_id": hod_id
    }

# ==============================
# MULTIPLE HOD MANAGEMENT
# ==============================

@app.post("/hods")
def create_hod(
    user_id: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    department: str = Form(...)
):
    user_id = user_id.strip().upper()
    name = name.strip()
    email = email.strip().lower()
    department = department.strip()

    # ==============================
    # VALIDATION
    # ==============================

    if not user_id or not name or not email  or not department:
        return {
            "status": "error",
            "message": "HOD ID, name and email are required."
        }

    if not re.fullmatch(r"HOD\d{2,}", user_id):
        return {
            "status": "error",
            "message": "HOD ID must be in the format HOD02, HOD03, etc."
        }

    # ==============================
    # CHECK DUPLICATES
    # ==============================

    existing_hod = users_collection.find_one({
        "user_id": user_id
    })

    if existing_hod:
        return {
            "status": "error",
            "message": "This HOD ID already exists."
        }

    existing_email = users_collection.find_one({
        "email": email
    })

    if existing_email:
        return {
            "status": "error",
            "message": "This email is already registered."
        }

    # ==============================
    # CREATE SECURE SETUP TOKEN
    # ==============================

    setup_token = secrets.token_urlsafe(32)

    setup_token_hash = hashlib.sha256(
        setup_token.encode("utf-8")
    ).hexdigest()

    setup_token_expires_at = (
        datetime.now() + timedelta(hours=24)
    )

    # ==============================
    # CREATE HOD ACCOUNT
    # ==============================

    hod = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "department": department,
        "role": "admin",

        # HOD creates password later
        "password_hash": None,
        "password_set": False,

        "approval_status": "approved",

        # Only the original/main HOD has this as True
        "is_primary_hod": False,

        # Invitation security
        "hod_invite_token_hash": setup_token_hash,
        "hod_invite_expires_at": setup_token_expires_at,
        "hod_invite_used": False,

        "created_at": datetime.now()
    }

    users_collection.insert_one(hod)

    # ==============================
    # CREATE SETUP LINK
    # ==============================

    setup_link = (
        f"{os.getenv('FRONTEND_BASE_URL')}"
        f"/admin/hod-set-password.html"
        f"?token={setup_token}"
        f"&hod_id={user_id}"
    )

    # ==============================
    # SEND INVITATION EMAIL
    # ==============================

    try:

        send_hod_invitation_email(
            email,
            name,
            user_id,
            setup_link
        )

    except Exception as error:

        # Remove account if email could not be sent
        users_collection.delete_one({
            "user_id": user_id,
            "role": "admin"
        })

        print(
            "HOD invitation email error:",
            error
        )

        return {
            "status": "error",
            "message": "HOD account could not be created because the invitation email failed to send."
        }

    return {
        "status": "success",
        "message": "HOD account created successfully. Invitation email sent.",
        "user_id": user_id,
        "name": name,
        "email": email,
        "department": department
    }

# ==============================
# GET ALL HODS
# ==============================

@app.get("/hods")
def get_hods():

    hods = list(
        users_collection.find(
            {"role": "admin"},
            {
                "_id": 0,
                "password_hash": 0
            }
        ).sort("user_id", 1)
    )

    return {
        "status": "success",
        "hods": hods
    }


# ==============================
# DELETE HOD
# ==============================

@app.delete("/hods/{hod_id}")
def delete_hod(hod_id: str):

    hod_id = hod_id.strip().upper()

   # Protect the primary HOD
    primary_hod = users_collection.find_one({
        "user_id": hod_id,
        "role": "admin",
        "is_primary_hod": True
    })

    if primary_hod:
        return {
            "status": "error",
            "message": "The primary HOD cannot be deleted."
        }

    result = users_collection.delete_one({
        "user_id": hod_id,
        "role": "admin"
    })

    if result.deleted_count == 0:
        return {
            "status": "error",
            "message": "HOD account not found."
        }

    return {
        "status": "success",
        "message": "HOD account deleted successfully.",
        "user_id": hod_id
    }

# ==============================
# CREATE TEACHER
# ==============================

@app.post("/teachers")
def create_teacher(
    user_id: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    department: str = Form(...),
    subject: str = Form(...),
    designation: str = Form(...)
):
    existing_teacher = users_collection.find_one({"user_id": user_id})

    if existing_teacher:
        return {
            "status": "error",
            "message": "Teacher ID already exists."
        }

    existing_email = users_collection.find_one({
        "email": email,
        "role": "teacher"
    })

    if existing_email:
        return {
            "status": "error",
            "message": "A teacher account with this email already exists."
        }

    # Generate a secure one-time password setup token
    setup_token = secrets.token_urlsafe(32)

    # Store only the hash of the token in MongoDB
    setup_token_hash = hashlib.sha256(
        setup_token.encode("utf-8")
    ).hexdigest()

    # Token expires after 24 hours
    setup_token_expires_at = datetime.now() + timedelta(hours=24)

    teacher = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "role": "teacher",
        "department": department,
        "subject": subject,
        "designation": designation,

        # Password will be created by the teacher
        "password_hash": None,
        "password_set": False,

        "approval_status": "approved",

        # One-time invitation token
        "teacher_invite_token_hash": setup_token_hash,
        "teacher_invite_expires_at": setup_token_expires_at,
        "teacher_invite_used": False,

        # Teacher will upload their own profile photo
        "profile_photo": None,
        "profile_photo_path": None,

        "created_at": datetime.now()
    }

    # Create teacher account
    result = users_collection.insert_one(teacher)

    # Create the password setup link
    frontend_base_url = os.getenv(
        "FRONTEND_BASE_URL",
        "http://127.0.0.1:5500"
    ).rstrip("/")

    setup_link = (
        f"{frontend_base_url}"
        f"/teacher/set-password.html"
        f"?token={setup_token}"
        f"&teacher_id={user_id}"
    )

    # Send invitation email
    try:
        send_teacher_invitation_email(
            teacher_email=email,
            teacher_name=name,
            teacher_id=user_id,
            setup_link=setup_link
        )

    except Exception as error:
        # Remove the teacher if the email could not be sent
        users_collection.delete_one({
            "_id": result.inserted_id
        })

        print("Teacher invitation email error:", error)

        return {
            "status": "error",
            "message": (
                "Teacher account could not be created because "
                "the invitation email could not be sent. "
                "Please try again."
            )
        }

    return {
        "status": "success",
        "message": (
            "Teacher account created successfully. "
            "Invitation email sent."
        ),
        "user_id": user_id,
        "name": name,
        "email": email
    }
# ==============================
# TEACHER PROFILE PHOTO UPLOAD
# ==============================

@app.post("/teachers/profile-photo")
async def upload_teacher_profile_photo(
    teacher_id: str = Form(...),
    file: UploadFile = File(...)
):

    try:

        # ==============================
        # FIND TEACHER
        # ==============================

        teacher = users_collection.find_one({
            "user_id": teacher_id,
            "role": "teacher"
        })

        if not teacher:
            return {
                "status": "error",
                "message": "Teacher account not found."
            }


        # ==============================
        # CHECK FILE
        # ==============================

        if not file.filename:
            return {
                "status": "error",
                "message": "No profile photo selected."
            }


        # ==============================
        # ALLOWED IMAGE TYPES
        # ==============================

        allowed_extensions = {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        }

        file_extension = os.path.splitext(
            file.filename
        )[1].lower()


        if file_extension not in allowed_extensions:
            return {
                "status": "error",
                "message": (
                    "Only JPG, JPEG, PNG and WEBP "
                    "images are allowed."
                )
            }


        # ==============================
        # CHECK FILE SIZE
        # ==============================

        file_content = await file.read()

        max_size = 2 * 1024 * 1024  # 2 MB

        if len(file_content) > max_size:
            return {
                "status": "error",
                "message": "Profile photo must be under 2 MB."
            }


        # ==============================
        # CREATE UNIQUE FILE NAME
        # ==============================

        timestamp = datetime.now().strftime(
            "%Y%m%d%H%M%S%f"
        )

        safe_filename = (
            "teacher_"
            + teacher_id
            + "_"
            + timestamp
            + file_extension
        )


        file_path = os.path.join(
            UPLOAD_DIR,
            safe_filename
        )


        # ==============================
        # DELETE OLD PROFILE PHOTO
        # ==============================

        old_photo_path = teacher.get(
            "profile_photo_path"
        )

        if old_photo_path and os.path.exists(
            old_photo_path
        ):
            try:
                os.remove(old_photo_path)
            except Exception:
                pass


        # ==============================
        # SAVE NEW PHOTO
        # ==============================

        with open(file_path, "wb") as buffer:
            buffer.write(file_content)


        # ==============================
        # UPDATE MONGODB
        # ==============================

        users_collection.update_one(
            {
                "_id": teacher["_id"]
            },
            {
                "$set": {
                    "profile_photo": safe_filename,
                    "profile_photo_path": file_path,
                    "profile_photo_updated_at": datetime.now()
                }
            }
        )


        # ==============================
        # SUCCESS
        # ==============================

        return {
            "status": "success",
            "message": "Profile photo updated successfully!",
            "profile_photo": safe_filename,
            "profile_photo_url": (
                "/uploads/" + safe_filename
            )
        }


    except Exception as error:

        print(
            "Teacher profile photo upload error:",
            error
        )

        return {
            "status": "error",
            "message": "Failed to upload profile photo."
        }

# ==============================
# DELETE TEACHER ACCOUNT
# ==============================

@app.delete("/teachers/{teacher_id}")
def delete_teacher(teacher_id: str):

    # Find and delete only a teacher account
    result = users_collection.delete_one(
        {
            "user_id": teacher_id,
            "role": "teacher"
        }
    )

    if result.deleted_count == 0:

        return {
            "status": "error",
            "message": "Teacher account not found."
        }

    return {
        "status": "success",
        "message": "Teacher account deleted successfully!",
        "user_id": teacher_id
    }



# ==============================
# GET ALL TEACHERS
# ==============================

@app.get("/teachers")
def get_all_teachers():

    teachers = list(
        users_collection.find(
            {
                "role": "teacher"
            },
            {
                "_id": 0,
                "password_hash": 0
            }
        )
    )

    return {
        "status": "success",
        "count": len(teachers),
        "teachers": teachers
    }


# ==============================
# STUDENT MODEL
# ==============================

class StudentCreate(BaseModel):

    user_id: str
    name: str
    email: str
    department: str
    semester: str
    password: str


# ==============================
# CREATE STUDENT
# ==============================

@app.post("/students")
def create_student(data: StudentCreate):

       # Validate Student ID format
    if not re.fullmatch(r"2[0-9]H71A[A-Za-z0-9]{4}", data.user_id):
        return {
            "status": "error",
            "message": "Invalid Student ID. ID must contain exactly 10 characters and follow the format 2XH71AXXXX."
        }

    existing_student = users_collection.find_one({
        "user_id": data.user_id
    })

    if existing_student:

        return {
            "status": "error",
            "message": "Student ID already exists."
        }


    hashed_password = bcrypt.hashpw(
        data.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


    student = {

        "user_id": data.user_id,

        "name": data.name,

        "email": data.email,

        "role": "student",

        "department": data.department,

        "semester": data.semester,

        "password_hash": hashed_password,

        "approval_status": "pending"
    }

    


    users_collection.insert_one(student)


    return {

        "status": "success",

        "message": "Student account created successfully! Waiting for HOD approval.",

        "user_id": data.user_id,

        "approval_status": "pending"

    }

# ==============================
# GET PENDING STUDENT REQUESTS
# ==============================

@app.get("/student-requests")
def get_student_requests():

    requests = list(
        users_collection.find(
            {
                "role": "student",
                "approval_status": "pending"
            },
            {
                "_id": 0,
                "password_hash": 0
            }
        )
    )

    return {
        "status": "success",
        "count": len(requests),
        "requests": requests
    }

# ============================================================
# GET ALL STUDENTS
# ============================================================

@app.get("/students")
def get_all_students():

    students = list(
        users_collection.find(
            {
                "role": "student",
                 "approval_status": "approved"
            },
            {
                "_id": 0,
                "password_hash": 0
            }
        )
    )

    return {
        "status": "success",
        "count": len(students),
        "students": students
    }


# ============================================================
# APPROVE ALL PENDING STUDENTS
# ============================================================

@app.put("/students/approve-all")
def approve_all_students():

    result = users_collection.update_many(
        {
            "role": "student",
            "approval_status": "pending"
        },
        {
            "$set": {
                "approval_status": "approved"
            }
        }
    )

    return {
        "status": "success",
        "message": "All pending students approved successfully!",
        "approved_count": result.modified_count
    }


# ============================================================
# DELETE STUDENT ACCOUNT
# ============================================================

@app.delete("/students/{student_id}")
def delete_student(student_id: str):

    result = users_collection.delete_one(
        {
            "user_id": student_id,
            "role": "student"
        }
    )

    if result.deleted_count == 0:
        return {
            "status": "error",
            "message": "Student account not found."
        }

    return {
        "status": "success",
        "message": "Student account deleted successfully!",
        "user_id": student_id
    }

# ==============================
# APPROVE STUDENT
# ==============================

@app.put("/students/{student_id}/approve")
def approve_student(student_id: str):

    result = users_collection.update_one(
        {
            "user_id": student_id,
            "role": "student",
            "approval_status": "pending"
        },
        {
            "$set": {
                "approval_status": "approved"
            }
        }
    )

    if result.matched_count == 0:

        return {
            "status": "error",
            "message": "Student request not found or already processed."
        }

    return {
        "status": "success",
        "message": "Student approved successfully!",
        "user_id": student_id,
        "approval_status": "approved"
    }

@app.get("/students/{student_id}")
def get_student(student_id: str):

    student = users_collection.find_one(
        {
            "user_id": student_id,
            "role": "student"
        },
        {
            "_id": 0,
            "password_hash": 0
        }
    )

    if not student:
        return {
            "status": "error",
            "message": "Student not found."
        }

    return {
        "status": "success",
        "student": student
    }

    


# ============================================================
# SUBJECTS
# ============================================================

@app.get("/subjects")
def get_subjects(
    department: str = None,
    semester: int = None,
    search: str = None
):
    try:
        query = {}

        if department:
            query["department"] = department

        if semester:
            query["semester"] = semester

        if search:
            query["$or"] = [
                {
                    "subject_name": {
                        "$regex": search,
                        "$options": "i"
                    }
                },
                {
                    "course_code": {
                        "$regex": search,
                        "$options": "i"
                    }
                }
            ]

        subjects = list(
            subjects_collection.find(
                query,
                {"_id": 0}
            ).sort([
                ("semester", 1),
                ("subject_name", 1)
            ])
        )

        return {
            "status": "success",
            "subjects": subjects
        }

    except Exception as error:
        print("Subject loading error:", error)

        return {
            "status": "error",
            "message": "Unable to load subjects."
        }




    # ================= GET MATERIALS =================

@app.get("/materials")
async def get_materials(uploader_id: str = None):

    try:
        query = {}

        # If uploader_id is provided,
        # return only materials uploaded by that user
        if uploader_id:
            query["uploader_id"] = uploader_id

        materials = list(
            materials_collection
            .find(query)
            .sort("upload_date", -1)
        )

        result = []

        for material in materials:

            material["material_id"] = str(
                material["_id"]
            )

            del material["_id"]

            if isinstance(
                material.get("upload_date"),
                datetime
            ):
                material["upload_date"] = (
                    material["upload_date"]
                    .isoformat()
                )

            result.append(material)

        return {
            "status": "success",
            "count": len(result),
            "materials": result
        }

    except Exception as error:

        print(
            "Get materials error:",
            error
        )

        return {
            "status": "error",
            "message": "Failed to fetch materials."
        }

# ================= STUDENT REACH TRACKING =================

def track_student_reach(material_id, student_id):
    """
    Record a student as reached for a material.
    The same student is counted only once per material.
    """

    if not student_id:
        return

    student = users_collection.find_one(
        {
            "user_id": student_id,
            "role": "student",
            "approval_status": "approved"
        },
        {
            "_id": 1
        }
    )

    # Only approved students are counted
    if not student:
        return

    materials_collection.update_one(
        {
            "_id": material_id
        },
        {
            "$addToSet": {
                "reached_student_ids": student_id
            }
        }
    )

    # ================= VIEW MATERIAL =================

from fastapi.responses import FileResponse

@app.get("/materials/{material_id}/view")
async def view_material(
    material_id: str,
    student_id: str = None
):

    try:
        from bson import ObjectId

        material = materials_collection.find_one(
            {"_id": ObjectId(material_id)}
        )

        if not material:
            return {
                "status": "error",
                "message": "Material not found."
            }

        file_path = material.get("file_path")

        # Check the stored path first
        if file_path and os.path.exists(file_path):
            actual_file_path = file_path

        else:
            # Fallback using the stored filename
            stored_file_name = material.get("stored_file_name")

            if stored_file_name:
                fallback_path = os.path.join(
                    UPLOAD_DIR,
                    stored_file_name
                )

                if os.path.exists(fallback_path):
                    actual_file_path = fallback_path
                else:
                    actual_file_path = None
            else:
                actual_file_path = None

        if not actual_file_path:
            return {
                "status": "error",
                "message": "File not found on server."
            }

        # Track student reach
        track_student_reach(
            material["_id"],
            student_id
        )

        return FileResponse(
            path=actual_file_path,
            filename=material["file_name"],
            content_disposition_type="inline"
        )

    except Exception as error:

        print(
            "View material error:",
            error
        )

        return {
            "status": "error",
            "message": "Unable to view material."
        }


# ================= DOWNLOAD MATERIAL =================
@app.get("/materials/{material_id}/download")
async def download_material(
    material_id: str,
    student_id: str = None
):

    try:
        from bson import ObjectId

        material = materials_collection.find_one(
            {"_id": ObjectId(material_id)}
        )

        if not material:
            return {
                "status": "error",
                "message": "Material not found."
            }

        file_path = material.get("file_path")

        # Check the stored path first
        if file_path and os.path.exists(file_path):
            actual_file_path = file_path

        else:
            # Fallback using the stored filename
            stored_file_name = material.get("stored_file_name")

            if stored_file_name:
                fallback_path = os.path.join(
                    UPLOAD_DIR,
                    stored_file_name
                )

                if os.path.exists(fallback_path):
                    actual_file_path = fallback_path
                else:
                    actual_file_path = None
            else:
                actual_file_path = None

        if not actual_file_path:
            return {
                "status": "error",
                "message": "File not found on server."
            }

        # Track student reach
        track_student_reach(
            material["_id"],
            student_id
        )

        return FileResponse(
            path=actual_file_path,
            filename=material["file_name"],
            content_disposition_type="attachment"
        )

    except Exception as error:

        print(
            "Download material error:",
            error
        )

        return {
            "status": "error",
            "message": "Unable to download material."
        }

# ================= TEACHER STUDENTS REACHED =================

@app.get("/teachers/{teacher_id}/students-reached")
def get_students_reached(teacher_id: str):

    try:

        materials = materials_collection.find(
            {
                "uploader_id": teacher_id
            },
            {
                "reached_student_ids": 1
            }
        )

        unique_students = set()

        for material in materials:

            student_ids = material.get(
                "reached_student_ids",
                []
            )

            for student_id in student_ids:
                unique_students.add(student_id)

        return {
            "status": "success",
            "teacher_id": teacher_id,
            "students_reached": len(unique_students)
        }

    except Exception as error:

        print(
            "Students reached error:",
            error
        )

        return {
            "status": "error",
            "message": "Unable to calculate students reached."
        }

# ================= DELETE MATERIAL =================

@app.delete("/materials/{material_id}")
async def delete_material(
    material_id: str,
    uploader_id: str
):

    try:

        from bson import ObjectId

        # Find the material
        material = materials_collection.find_one(
            {
                "_id": ObjectId(material_id)
            }
        )

        if not material:

            return {
                "status": "error",
                "message": "Material not found."
            }


        # ================= SECURITY CHECK =================
        # A teacher can delete only their own material

        if material.get("uploader_id") != uploader_id:

            return {
                "status": "error",
                "message": "You can only delete your own materials."
            }


        # ================= DELETE PHYSICAL FILE =================

        file_path = material.get("file_path")

        if file_path and os.path.exists(file_path):

            os.remove(file_path)


        # ================= DELETE MONGODB RECORD =================

        result = materials_collection.delete_one(
                {
                    "_id": ObjectId(material_id)
                }
            )


        if result.deleted_count == 0:

            return {
                "status": "error",
                "message": "Material could not be deleted."
            }


        return {
            "status": "success",
            "message": "Material deleted successfully!",
            "material_id": material_id
        }


    except Exception as error:

        print(
            "Delete material error:",
            error
        )

        return {
            "status": "error",
            "message": "Unable to delete material."
        }

@app.post("/materials/upload")
async def upload_material(
    title: str = Form(...),
    subject: str = Form(...),
    semester: str = Form(...),
    uploader_id: str = Form(...),
    uploader_name: str = Form(...),
    uploader_role: str = Form(...),
    file: UploadFile = File(...)
):

    try:

                # ==============================
        # VALIDATE SUBJECT
        # ==============================

        selected_subject = subjects_collection.find_one({
            "subject_name": subject,
            "semester": int(
                semester.replace(
                    "st Semester",
                    ""
                ).replace(
                    "nd Semester",
                    ""
                ).replace(
                    "rd Semester",
                    ""
                ).replace(
                    "th Semester",
                    ""
                ).strip()
            )
        })

        if not selected_subject:

            return {
                "status": "error",
                "message": "Invalid subject or semester. Please select a subject from the official subject list."
            }

        # ================= FILE NAME =================

        original_filename = file.filename

        if not original_filename:
            return {
                "status": "error",
                "message": "No file selected."
            }


        # ================= ALLOWED FILE TYPES =================

        allowed_extensions = {
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".ppt",
            ".pptx",
            ".jpg",
            ".jpeg",
            ".png",
            ".txt"
        }

        # ================= FILE SIZE LIMIT =================

        file_content = await file.read()

        max_file_size = 10 * 1024 * 1024  # 10 MB

        if len(file_content) > max_file_size:

            return {
                "status": "error",
                "message": "File size must be 10 MB or less."
            }

    
        file_extension = os.path.splitext(
            original_filename
        )[1].lower()


        if file_extension not in allowed_extensions:

            return {
                "status": "error",
                "message": "This file type is not supported."
            }


        # ================= CREATE UNIQUE FILE NAME =================

        timestamp = datetime.now().strftime(
            "%Y%m%d%H%M%S%f"
        )

        safe_filename = (
            timestamp +
            "_" +
            original_filename.replace(" ", "_")
        )


        file_path = os.path.join(
            UPLOAD_DIR,
            safe_filename
        )


        # ================= SAVE FILE =================
# ================= SAVE FILE =================

        with open(file_path, "wb") as buffer:
            buffer.write(file_content)


        # ================= SAVE METADATA =================

        material = {

            "title": title,

            "subject": subject,

            "file_name": original_filename,

            "stored_file_name": safe_filename,

            "file_type": file_extension,

            "file_path": file_path,

            "uploader_id": uploader_id,

            "uploader_name": uploader_name,

            "uploader_role": uploader_role,

            "upload_date": datetime.now(),

            "reached_student_ids": []
            

        }


        result = materials_collection.insert_one(
            material
        )


        # ================= SUCCESS =================

        return {

            "status": "success",

            "message": "Material uploaded successfully!",

            "material_id": str(result.inserted_id),

            "file_name": original_filename,

            "title": title,

            "subject": subject,

            "uploader_id": uploader_id

        }


    except Exception as error:

        print(
            "Material upload error:",
            error
        )

        return {

            "status": "error",

            "message": "Failed to upload material."

        }


app.mount(
    "/",
    StaticFiles(directory=FRONTEND_DIR, html=True),
    name="frontend"
)