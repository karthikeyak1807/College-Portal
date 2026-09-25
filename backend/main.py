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

MONGO_URL = "mongodb://127.0.0.1:27017"

client = MongoClient(MONGO_URL)

db = client["college_portal"]

users_collection = db["users"]
materials_collection = db["materials"]
subjects_collection = db["subjects"]

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)

# ==============================
# HOME
# ==============================

@app.get("/")
def home():
    return {
        "message": "College Portal Backend is running!"
    }


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
def login( user_id: str = Form(...),
    password: str = Form(...)
):

    # Find user in MongoDB
    user = users_collection.find_one({
        "user_id": user_id
    })

    # User doesn't exist
    if not user:
        return {
            "status": "error",
            "message": "Invalid ID or password."
        }

    # Check password
    password_valid = bcrypt.checkpw(
        password.encode("utf-8"),
        user["password_hash"].encode("utf-8")
    )

    if not password_valid:
        return {
            "status": "error",
            "message": "Invalid ID or password."
        }

    # ==============================
    # STUDENT APPROVAL CHECK
    # ==============================

    if user["role"] == "student":

        approval_status = user.get(
            "approval_status",
            "pending"
        )

        # Student approved
        if approval_status == "approved":

            return {
                "status": "success",
                "role": "student",
                "user_id": user["user_id"],
                "name": user.get("name", ""),
                "approval_status": "approved"
            }

        # Student not approved
        return {
            "status": "pending",
            "role": "student",
            "user_id": user["user_id"],
            "name": user.get("name", ""),
            "approval_status": approval_status,
            "message": "Your access request is waiting for HOD approval."
        }

    # ==============================
    # TEACHER
    # ==============================

    if user["role"] == "teacher":

        return {
            "status": "success",
            "role": "teacher",
            "user_id": user["user_id"],
            "name": user.get("name", "")
        }

    # ==============================
    # ADMIN / HOD
    # ==============================

    if user["role"] == "admin":

        return {
            "status": "success",
            "role": "admin",
            "user_id": user["user_id"],
            "name": user.get("name", "")
        }

    return {
        "status": "error",
        "message": "Unknown user role."
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
# CREATE TEACHER
# ==============================

@app.post("/teachers")
async def create_teacher(
    user_id: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    department: str = Form(...),
    subject: str = Form(...),
    designation: str = Form(...),
    password: str = Form(...),
    photo: UploadFile | None = File(None)
):

    # ==============================
    # CHECK DUPLICATE TEACHER ID
    # ==============================

    existing_teacher = users_collection.find_one({
        "user_id": user_id
    })

    if existing_teacher:

        return {
            "status": "error",
            "message": "Teacher ID already exists."
        }


    # ==============================
    # HASH PASSWORD
    # ==============================

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


    # ==============================
    # PROFILE PHOTO
    # ==============================

    photo_filename = None
    photo_path = None

    if photo and photo.filename:

        allowed_photo_extensions = {
            ".jpg",
            ".jpeg",
            ".png"
        }

        photo_extension = os.path.splitext(
            photo.filename
        )[1].lower()


        if photo_extension not in allowed_photo_extensions:

            return {
                "status": "error",
                "message": "Profile photo must be JPG, JPEG or PNG."
            }


        timestamp = datetime.now().strftime(
            "%Y%m%d%H%M%S%f"
        )


        photo_filename = (
            timestamp +
            "_teacher_" +
            photo.filename.replace(" ", "_")
        )


        photo_path = os.path.join(
            UPLOAD_DIR,
            photo_filename
        )


        with open(photo_path, "wb") as buffer:

            shutil.copyfileobj(
                photo.file,
                buffer
            )


    # ==============================
    # CREATE TEACHER DOCUMENT
    # ==============================

    teacher = {

        "user_id": user_id,

        "name": name,

        "email": email,

        "role": "teacher",

        "department": department,

        "subject": subject,

        "designation": designation,

        "password_hash": hashed_password,

        "approval_status": "approved",

        "profile_photo": photo_filename,

        "profile_photo_path": photo_path,

        "created_at": datetime.now()
    }


    # ==============================
    # SAVE TO MONGODB
    # ==============================

    users_collection.insert_one(teacher)


    # ==============================
    # SUCCESS
    # ==============================

    return {

        "status": "success",

        "message":
            "Teacher account created successfully!",

        "user_id":
            user_id,

        "name":
            name,

        "profile_photo":
            photo_filename
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

    # ================= VIEW MATERIAL =================

from fastapi.responses import FileResponse


@app.get("/materials/{material_id}/view")
async def view_material(material_id: str):

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

        if not file_path or not os.path.exists(file_path):
            return {
                "status": "error",
                "message": "File not found on server."
            }

        return FileResponse(
            path=file_path,
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
async def download_material(material_id: str):

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

        if not file_path or not os.path.exists(file_path):
            return {
                "status": "error",
                "message": "File not found on server."
            }

        return FileResponse(
            path=file_path,
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

        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


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

            "upload_date": datetime.now()

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