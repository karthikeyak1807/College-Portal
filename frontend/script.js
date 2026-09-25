/*function openPortal(portal) {

    if (portal === "admin") {

        window.location.href =
            "admin/admin-login.html";

    }

    else if (portal === "teacher") {

        window.location.href =
            "teacher/teacher-login.html";

    }

    else if (portal === "student") {

        window.location.href =
            "student/student-login.html";

    }

}*/

function openPortal() {
    window.location.href = "login/login.html";
}

// =========================================
// LOAD LIVE COLLEGE STATISTICS
// =========================================

async function loadPortalStats() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/portal-stats"
        );

        const data = await response.json();

        if (data.status !== "success") {
            return;
        }

        document.getElementById("teacherCount").textContent =
            data.teachers;

        document.getElementById("studentCount").textContent =
            data.students;

        document.getElementById("materialCount").textContent =
            data.materials;

        document.getElementById("storageCount").textContent =
            `${data.storage_mb} MB`;

    } catch (error) {

        console.error(
            "Unable to load portal statistics:",
            error
        );

    }
}


// Load statistics when page opens
document.addEventListener(
    "DOMContentLoaded",
    loadPortalStats
);