import argparse
import getpass
import os
import re
import secrets
import sys
from datetime import datetime
from pathlib import Path

import bcrypt
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError


def collect_hod_details(non_interactive: bool) -> tuple[str, str, str, str, str] | None:
    if non_interactive:
        user_id = os.getenv(
            "INITIAL_HOD_ID",
            f"HOD{secrets.randbelow(90_000_000) + 10_000_000}",
        ).strip().upper()
        name = os.getenv(
            "INITIAL_HOD_NAME",
            f"Initial HOD {secrets.token_hex(2).upper()}",
        ).strip()
        email = os.getenv(
            "INITIAL_HOD_EMAIL",
            f"hod-{secrets.token_hex(6)}@example.invalid",
        ).strip().lower()
        department = os.getenv(
            "INITIAL_HOD_DEPARTMENT",
            "Administration",
        ).strip()
        password = os.getenv(
            "INITIAL_HOD_PASSWORD",
            secrets.token_urlsafe(24),
        )
    else:
        user_id = input("HOD ID [HOD01]: ").strip().upper() or "HOD01"
        name = input("HOD name: ").strip()
        email = input("HOD email: ").strip().lower()
        department = input("Department: ").strip()
        password = getpass.getpass("Password (at least 8 characters): ")
        confirm_password = getpass.getpass("Confirm password: ")

        if password != confirm_password:
            print("Passwords do not match.")
            return None

    if not re.fullmatch(r"HOD\d{2,}", user_id):
        print("HOD ID must use the format HOD01, HOD02, etc.")
        return None
    if (
        not name
        or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email)
        or not department
    ):
        print("A name, valid email address, and department are required.")
        return None
    if len(password) < 8:
        print("Password must contain at least 8 characters.")
        return None
    if len(password.encode("utf-8")) > 72:
        print("Password must be no more than 72 bytes when encoded as UTF-8.")
        return None

    return user_id, name, email, department, password


def main() -> int:
    load_dotenv(Path(__file__).resolve().with_name(".env"))

    parser = argparse.ArgumentParser(description="Seed the initial primary HOD account.")
    parser.add_argument(
        "--non-interactive",
        action="store_true",
        help="Generate random HOD credentials, optionally overridden by INITIAL_HOD_* settings.",
    )
    args = parser.parse_args()

    mongo_url = os.getenv("MONGO_URL", "").strip()
    if not mongo_url.startswith(("mongodb://", "mongodb+srv://")):
        print("Set MONGO_URL to a valid MongoDB connection URI before running this script.")
        return 1

    try:
        with MongoClient(mongo_url, serverSelectionTimeoutMS=10000) as client:
            client.admin.command("ping")
            users = client["college_portal"]["users"]

            if users.find_one({"role": "admin"}, {"_id": 1}):
                print("An admin/HOD account already exists; skipping initial HOD seed.")
                return 0

            details = collect_hod_details(args.non_interactive)
            if details is None:
                return 1
            user_id, name, email, department, password = details

            if users.find_one({"user_id": user_id}, {"_id": 1}):
                print(f"HOD ID {user_id} is already used by another account; no changes were made.")
                return 1
            if users.find_one({"email": email}, {"_id": 1}):
                print(f"An account with email {email} already exists; no changes were made.")
                return 1

            hod = {
                "user_id": user_id,
                "name": name,
                "email": email,
                "department": department,
                "role": "admin",
                "password_hash": bcrypt.hashpw(
                    password.encode("utf-8"),
                    bcrypt.gensalt(),
                ).decode("utf-8"),
                "password_set": True,
                "approval_status": "approved",
                "is_primary_hod": True,
                "hod_invite_used": True,
                "created_at": datetime.now(),
            }
            users.insert_one(hod)
    except PyMongoError as error:
        print(
            "MongoDB operation failed "
            f"({type(error).__name__}). Check the connection URI, Atlas network access, "
            "and database user permissions."
        )
        return 1

    print("Created primary HOD account. Save these login details now:")
    print(f"HOD ID: {user_id}")
    print(f"Email: {email}")
    print(f"Name: {name}")
    print(f"Department: {department}")
    print(f"Password: {password}")
    print("This password is only shown once in the startup logs.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
