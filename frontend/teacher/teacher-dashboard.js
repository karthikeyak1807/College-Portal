document.addEventListener("DOMContentLoaded", function () {

    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".content-section");

    const pageTitle = document.getElementById("pageTitle");
    const pageSubtitle = document.getElementById("pageSubtitle");

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const sidebar =
        document.getElementById("sidebar");


    /* ================= NAVIGATION ================= */

    navItems.forEach(function (item) {

        item.addEventListener("click", function () {

            const sectionName =
                item.getAttribute("data-section");

            navItems.forEach(function (nav) {
                nav.classList.remove("active");
            });

            item.classList.add("active");

            sections.forEach(function (section) {
                section.classList.remove("active");
            });

            document
                .getElementById(sectionName)
                .classList.add("active");


            /* Page Titles */

            if (sectionName === "dashboard") {

                pageTitle.textContent =
                    "Teacher Dashboard";

                pageSubtitle.textContent =
                    "Manage your teaching materials and profile";

            }

            else if (sectionName === "upload") {

                pageTitle.textContent =
                    "Upload Material";

                pageSubtitle.textContent =
                    "Share useful learning resources with students";

            }

            else if (sectionName === "materials") {

                pageTitle.textContent =
                    "My Materials";

                pageSubtitle.textContent =
                    "View and manage your uploaded materials";

            }

            else if (sectionName === "profile") {

                pageTitle.textContent =
                    "My Profile";

                pageSubtitle.textContent =
                    "View your professional information";

            }


            /* Close mobile menu */

            sidebar.classList.remove("open");

        });

    });


    /* ================= UPLOAD NAVIGATION ================= */

    const goUploadBtn =
        document.getElementById("goUploadBtn");

    const uploadFromMaterials =
        document.getElementById("uploadFromMaterials");

    function openUploadSection() {

        document
            .querySelector('[data-section="upload"]')
            .click();

    }

    goUploadBtn.addEventListener(
        "click",
        openUploadSection
    );

    uploadFromMaterials.addEventListener(
        "click",
        openUploadSection
    );


    /* ================= VIEW ALL ================= */

    const viewMaterialsBtn =
        document.getElementById("viewMaterialsBtn");

    viewMaterialsBtn.addEventListener(
        "click",
        function () {

            document
                .querySelector('[data-section="materials"]')
                .click();

        }
    );


    /* ================= FILE UPLOAD ================= */

    const uploadBox =
        document.getElementById("uploadBox");

    const fileInput =
        document.getElementById("fileInput");

    const selectedFile =
        document.getElementById("selectedFile");


    uploadBox.addEventListener(
        "click",
        function () {

            fileInput.click();

        }
    );


    fileInput.addEventListener(
        "change",
        function () {

            if (fileInput.files.length > 0) {

                const file =
                    fileInput.files[0];

                selectedFile.textContent =
                    "Selected file: " + file.name;

            }

        }
    );


    /* ================= DRAG & DROP ================= */

    uploadBox.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadBox.classList.add("dragover");

        }
    );


    uploadBox.addEventListener(
        "dragleave",
        function () {

            uploadBox.classList.remove("dragover");

        }
    );


    uploadBox.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            uploadBox.classList.remove("dragover");

            const files =
                event.dataTransfer.files;

            if (files.length > 0) {

                fileInput.files = files;

                selectedFile.textContent =
                    "Selected file: " +
                    files[0].name;

            }

        }
    );


   /* ================= FORM SUBMIT ================= */

const uploadForm =
    document.getElementById("uploadForm");


uploadForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        /* ================= GET FORM VALUES ================= */

        const title =
            document.getElementById(
                "materialTitle"
            ).value.trim();


        const subject =
            document.getElementById(
                "subject"
            ).value;


        const file =
            fileInput.files[0];


        /* ================= VALIDATION ================= */

        if (!title) {

            alert(
                "Please enter a material title."
            );

            return;
        }


        if (!subject) {

            alert(
                "Please select a subject."
            );

            return;
        }


        if (!file) {

            alert(
                "Please select a file first."
            );

            return;
        }


        /* ================= GET TEACHER DETAILS ================= */

        const uploaderId =
            sessionStorage.getItem(
                "userId"
            );


        const uploaderName =
            sessionStorage.getItem(
                "userName"
            );


        const uploaderRole =
            sessionStorage.getItem(
                "userRole"
            );


        if (!uploaderId) {

            alert(
                "Teacher session not found. Please login again."
            );

            return;
        }


        /* ================= CREATE FORM DATA ================= */

        const formData =
            new FormData();


        formData.append(
            "title",
            title
        );


        formData.append(
            "subject",
            subject
        );

        const semester =
          document.getElementById("semester").value;

        formData.append(
            "semester",
            semester
        );


        formData.append(
            "uploader_id",
            uploaderId
        );


        formData.append(
            "uploader_name",
            uploaderName || "Teacher"
        );


        formData.append(
            "uploader_role",
            uploaderRole || "teacher"
        );


        formData.append(
            "file",
            file
        );


        /* ================= SHOW LOADING ================= */

        const submitButton =
            uploadForm.querySelector(
                'button[type="submit"]'
            );


        const originalButtonText =
            submitButton
                ? submitButton.textContent
                : "";


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Uploading...";
        }


        /* ================= SEND TO BACKEND ================= */

        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/materials/upload",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            /* ================= BACKEND ERROR ================= */

            if (!response.ok) {

                let errorMessage =
                    "Material upload failed.";

                if (data.detail) {

                    if (
                        Array.isArray(
                            data.detail
                        )
                    ) {

                        errorMessage =
                            data.detail
                                .map(function (error) {
                                    return error.msg;
                                })
                                .join("\n");

                    } else {

                        errorMessage =
                            data.detail;

                    }

                }
                else if (data.message) {

                    errorMessage =
                        data.message;
                }


                alert(
                    "❌ " + errorMessage
                );

                return;
            }


            /* ================= APPLICATION ERROR ================= */

            if (
                data.status === "error"
            ) {

                alert(
                    "❌ " +
                    (
                        data.message ||
                        "Material upload failed."
                    )
                );

                return;
            }


            /* ================= SUCCESS ================= */

            alert(
                "Material uploaded successfully! 🎉\n\n" +
                "Title: " +
                title +
                "\nSubject: " +
                subject +
                "\nFile: " +
                file.name
            );


            /* ================= CLEAR FORM ================= */

            uploadForm.reset();

            selectedFile.textContent = "";


        }
        catch (error) {

            console.error(
                "Material upload error:",
                error
            );


            alert(
                "❌ Unable to connect to the backend.\n\n" +
                "Please make sure the FastAPI server is running."
            );

        }
        finally {

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    originalButtonText;
            }

        }

    }
);

/* ================= LOAD REAL MATERIALS ================= */

async function loadTeacherMaterials() {

    const tableBody =
        document.getElementById("materialsTableBody");

    if (!tableBody) {
        return;
    }

    const teacherId =
        sessionStorage.getItem("userId");

    if (!teacherId) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Teacher session not found.
                </td>
            </tr>
        `;

        return;
    }

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/materials?uploader_id=" +
                encodeURIComponent(teacherId)
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            data.status !== "success"
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        Unable to load materials.
                    </td>
                </tr>
            `;

            return;
        }

        if (
            !data.materials ||
            data.materials.length === 0
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No materials uploaded yet.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML = "";

        data.materials.forEach(function (material) {

            const row =
                document.createElement("tr");

            const uploadDate =
                material.upload_date
                    ? new Date(
                        material.upload_date
                    ).toLocaleDateString()
                    : "-";

            const fileType =
                material.file_type
                    ? material.file_type
                        .replace(".", "")
                        .toUpperCase()
                    : "FILE";

           row.innerHTML = `
    <td>
        <strong>
            ${material.title}
        </strong>
        <br>
        <small>
            ${material.file_name}
        </small>
    </td>

    <td>
        ${material.subject}
    </td>

    <td>
        ${fileType}
    </td>

    <td>
        ${uploadDate}
    </td>

    <td>
                    <button
                        class="view-btn"
                        data-material-id="${material.material_id}"
                    >
                        View
                    </button>

                    <button
                        class="download-btn"
                        data-material-id="${material.material_id}"
                    >
                        Download
                    </button>

                    <button
                        class="delete-btn"
                        data-material-id="${material.material_id}"
                    >
                        Delete
                    </button>

                </td>
            `;

            tableBody.appendChild(row);

        });

    }

    catch (error) {

        console.error(
            "Load materials error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to connect to the backend.
                </td>
            </tr>
        `;

    }
}

    /* ================= SEARCH MATERIALS ================= */

    const materialSearch =
        document.getElementById("materialSearch");

    const tableBody =
        document.getElementById("materialsTableBody");


    materialSearch.addEventListener(
        "input",
        function () {

            const searchValue =
                materialSearch.value.toLowerCase();

            const rows =
                tableBody.querySelectorAll("tr");


            rows.forEach(function (row) {

                const text =
                    row.textContent.toLowerCase();

                if (text.includes(searchValue)) {

                    row.style.display = "";

                } else {

                    row.style.display = "none";

                }

            });

        }
    );



    /* ================= MATERIAL ACTION BUTTONS ================= */

document.addEventListener(
    "click",
    async function (event) {

        const button =
            event.target.closest(
                "button[data-material-id]"
            );

        if (!button) {
            return;
        }

        const materialId =
            button.getAttribute(
                "data-material-id"
            );

        const action =
            button.classList.contains("view-btn")
                ? "view"
                : button.classList.contains("download-btn")
                    ? "download"
                    : button.classList.contains("delete-btn")
                        ? "delete"
                        : null;


        if (!action || !materialId) {
            return;
        }


        /* ================= VIEW ================= */

        if (action === "view") {

            const viewUrl =
                "http://127.0.0.1:8000/materials/" +
                encodeURIComponent(materialId) +
                "/view";

            window.open(
                viewUrl,
                "_blank"
            );

            return;
        }


        /* ================= DOWNLOAD ================= */

        if (action === "download") {

            const downloadUrl =
                "http://127.0.0.1:8000/materials/" +
                encodeURIComponent(materialId) +
                "/download";

            window.open(
                downloadUrl,
                "_blank"
            );

            return;
        }


        /* ================= DELETE ================= */

        if (action === "delete") {

    const confirmation = confirm(
        "Are you sure you want to delete this material?"
    );

    if (!confirmation) {
        return;
    }

    const teacherId =
        sessionStorage.getItem("userId");

    if (!teacherId) {
        alert("Teacher session not found. Please login again.");
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/materials/" +
            encodeURIComponent(materialId) +
            "?uploader_id=" +
            encodeURIComponent(teacherId),
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {

            alert(
                "❌ " +
                (
                    data.message ||
                    "Unable to delete material."
                )
            );

            return;
        }

        alert(
            "Material deleted successfully! 🗑️"
        );

        // Reload materials from MongoDB
        loadTeacherMaterials();

    }
    catch (error) {

        console.error(
            "Delete material error:",
            error
        );

        alert(
            "❌ Unable to connect to the backend."
        );
    }

    return;
}

    }
);

    /* ================= MOBILE MENU ================= */

    mobileMenuBtn.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle("open");

        }
    );


    /* ================= LOGOUT ================= */

    const logoutBtn =
        document.getElementById("logoutBtn");

    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmation =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (confirmation) {

                window.location.href =
                  "../login/login.html";

            }

        }
    );

/* ================= LOAD TEACHER PROFILE ================= */

async function loadTeacherProfile() {

    const teacherId =
        sessionStorage.getItem("userId");

    if (!teacherId) {

        alert(
            "Teacher session not found. Please login again."
        );

        window.location.href =
            "../login/login.html";

        return;
    }

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/teachers"
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            data.status !== "success"
        ) {

            throw new Error(
                data.message ||
                "Unable to load teacher information."
            );

        }

        const teachers =
            data.teachers || [];

        const teacher =
            teachers.find(function (item) {

                return item.user_id === teacherId;

            });


        if (!teacher) {

            alert(
                "Teacher information not found."
            );

            return;
        }


        /* ================= TEACHER DETAILS ================= */

        const teacherName =
            teacher.name || "Teacher";

        const teacherDesignation =
            teacher.designation || "Teacher";

        const teacherDepartment =
            teacher.department || "—";

        const teacherEmail =
            teacher.email || "—";

        const teacherSubject =
            teacher.subject || "—";


        /* ================= CREATE INITIALS ================= */

        const nameParts =
            teacherName.trim().split(/\s+/);

        let initials = "T";

        if (nameParts.length >= 2) {

            initials =
                nameParts[0].charAt(0) +
                nameParts[nameParts.length - 1].charAt(0);

        }
        else if (nameParts.length === 1) {

            initials =
                nameParts[0].substring(0, 2);

        }

        initials =
            initials.toUpperCase();


       /* ================= HEADER PROFILE ================= */

const headerTeacherAvatar =
    document.getElementById(
        "headerTeacherAvatar"
    );

const headerTeacherPhoto =
    document.getElementById(
        "headerTeacherPhoto"
    );

const headerTeacherInitials =
    document.getElementById(
        "headerTeacherInitials"
    );

const headerTeacherName =
    document.getElementById(
        "headerTeacherName"
    );

const headerTeacherDesignation =
    document.getElementById(
        "headerTeacherDesignation"
    );


/* ================= TEACHER PHOTO ================= */

if (
    headerTeacherPhoto &&
    teacher.profile_photo
) {

    headerTeacherPhoto.src =
        "http://127.0.0.1:8000/uploads/" +
        encodeURIComponent(
            teacher.profile_photo
        );

    headerTeacherPhoto.style.display =
        "block";


    if (headerTeacherInitials) {

        headerTeacherInitials.style.display =
            "none";

    }

}
else {

    /* No photo → show initials */

    if (headerTeacherPhoto) {

        headerTeacherPhoto.style.display =
            "none";

    }

    if (headerTeacherInitials) {

        headerTeacherInitials.textContent =
            initials;

        headerTeacherInitials.style.display =
            "flex";

    }

}


/* ================= TEACHER NAME ================= */

if (headerTeacherName) {

    headerTeacherName.textContent =
        teacherName;

}


/* ================= TEACHER DESIGNATION ================= */

if (headerTeacherDesignation) {

    headerTeacherDesignation.textContent =
        teacherDesignation;

}

        /* ================= WELCOME MESSAGE ================= */

        const welcomeTeacherName =
            document.getElementById(
                "welcomeTeacherName"
            );

        if (welcomeTeacherName) {

            const firstName =
                teacherName.split(/\s+/)[0];

            welcomeTeacherName.textContent =
                firstName;

        }


        /* ================= PROFILE CARD ================= */

        const profileLargeAvatar =
            document.getElementById(
                "profileLargeAvatar"
            );
            const profileTeacherPhoto =
    document.getElementById(
        "profileTeacherPhoto"
    );

const profileAvatarInitials =
    document.getElementById(
        "profileAvatarInitials"
    );

        const profileTeacherName =
            document.getElementById(
                "profileTeacherName"
            );

        const profileTeacherDesignation =
            document.getElementById(
                "profileTeacherDesignation"
            );


     if (profileTeacherPhoto && teacher.profile_photo) {

    profileTeacherPhoto.src =
        "http://127.0.0.1:8000/uploads/" +
        encodeURIComponent(
            teacher.profile_photo
        );

    profileTeacherPhoto.style.display =
        "block";

    if (profileAvatarInitials) {

        profileAvatarInitials.style.display =
            "none";

    }

}
else {

    if (profileTeacherPhoto) {

        profileTeacherPhoto.style.display =
            "none";

    }

    if (profileAvatarInitials) {

        profileAvatarInitials.textContent =
            initials;

        profileAvatarInitials.style.display =
            "block";

    }

}

        if (profileTeacherName) {

            profileTeacherName.textContent =
                teacherName;

        }

        if (profileTeacherDesignation) {

            profileTeacherDesignation.textContent =
                teacherDesignation;

        }


        /* ================= PROFILE DETAILS ================= */

        const profileTeacherId =
            document.getElementById(
                "profileTeacherId"
            );

        const profileTeacherDepartment =
            document.getElementById(
                "profileTeacherDepartment"
            );

        const profileTeacherDesignationDetail =
            document.getElementById(
                "profileTeacherDesignationDetail"
            );

        const profileTeacherEmail =
            document.getElementById(
                "profileTeacherEmail"
            );

        const profileTeacherSubject =
            document.getElementById(
                "profileTeacherSubject"
            );

        const profileTeacherStatus =
            document.getElementById(
                "profileTeacherStatus"
            );


        if (profileTeacherId) {

            profileTeacherId.textContent =
                teacher.user_id || "—";

        }

        if (profileTeacherDepartment) {

            profileTeacherDepartment.textContent =
                teacherDepartment;

        }

        if (profileTeacherDesignationDetail) {

            profileTeacherDesignationDetail.textContent =
                teacherDesignation;

        }

        if (profileTeacherEmail) {

            profileTeacherEmail.textContent =
                teacherEmail;

        }

        if (profileTeacherSubject) {

            profileTeacherSubject.textContent =
                teacherSubject;

        }

        if (profileTeacherStatus) {

            profileTeacherStatus.textContent =
                teacher.approval_status === "approved"
                    ? "Active"
                    : (
                        teacher.approval_status ||
                        "Active"
                    );

        }

    }
    catch (error) {

        console.error(
            "Teacher profile loading error:",
            error
        );

        alert(
            "Unable to load teacher information."
        );

    }

}


/* ================= LOAD TEACHER DASHBOARD DATA ================= */

async function loadTeacherDashboardData() {

    const teacherId =
        sessionStorage.getItem("userId");

    if (!teacherId) {
        return;
    }

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/materials?uploader_id=" +
                encodeURIComponent(teacherId)
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            data.status !== "success"
        ) {

            throw new Error(
                data.message ||
                "Unable to load dashboard materials."
            );

        }

        const materials =
            data.materials || [];


        /* ================= TOTAL MATERIALS ================= */

        const totalMaterials =
            document.getElementById(
                "totalMaterials"
            );

        if (totalMaterials) {

            totalMaterials.textContent =
                materials.length;

        }


        /* ================= MATERIALS THIS MONTH ================= */

        const now =
            new Date();

        const currentMonth =
            now.getMonth();

        const currentYear =
            now.getFullYear();


        const monthlyMaterials =
            materials.filter(function (material) {

                const dateValue =
                    material.upload_date ||
                    material.created_at;

                if (!dateValue) {
                    return false;
                }

                const date =
                    new Date(dateValue);

                return (
                    date.getMonth() === currentMonth &&
                    date.getFullYear() === currentYear
                );

            });


        const monthlyMaterialsElement =
            document.getElementById(
                "monthlyMaterials"
            );

        if (monthlyMaterialsElement) {

            monthlyMaterialsElement.textContent =
                monthlyMaterials.length;

        }


        /* ================= SUBJECT COUNT ================= */

        const subjects =
            new Set();

        materials.forEach(function (material) {

            if (material.subject) {

                subjects.add(
                    material.subject
                );

            }

        });


        const subjectCount =
            document.getElementById(
                "subjectCount"
            );

        if (subjectCount) {

            subjectCount.textContent =
                subjects.size;

        }


        /* ================= RECENT MATERIALS ================= */

        const recentMaterialsList =
            document.getElementById(
                "recentMaterialsList"
            );

        if (!recentMaterialsList) {
            return;
        }


        if (materials.length === 0) {

            recentMaterialsList.innerHTML = `
                <div class="material-row">

                    <div class="file-icon">
                        —
                    </div>

                    <div class="material-info">

                        <strong>
                            No materials uploaded yet
                        </strong>

                        <span>
                            Your uploaded materials will appear here.
                        </span>

                    </div>

                    <span class="upload-date">
                        —
                    </span>

                </div>
            `;

            return;
        }


        /* Sort newest first */

        materials.sort(function (a, b) {

            const dateA =
                new Date(
                    a.upload_date ||
                    a.created_at ||
                    0
                );

            const dateB =
                new Date(
                    b.upload_date ||
                    b.created_at ||
                    0
                );

            return dateB - dateA;

        });


        const recentMaterials =
            materials.slice(0, 3);


        recentMaterialsList.innerHTML =
            recentMaterials.map(function (material) {

                const fileName =
                    material.file_name ||
                    "Unknown file";

                const extension =
                    fileName.includes(".")
                        ? fileName
                            .split(".")
                            .pop()
                            .toUpperCase()
                        : "FILE";


                let iconClass =
                    "pdf";


                if (
                    extension === "PPT" ||
                    extension === "PPTX"
                ) {

                    iconClass = "ppt";

                }
                else if (
                    extension === "DOC" ||
                    extension === "DOCX"
                ) {

                    iconClass = "doc";

                }
                else if (
                    extension === "XLS" ||
                    extension === "XLSX"
                ) {

                    iconClass = "xls";

                }


                const uploadDate =
                    material.upload_date
                        ? new Date(
                            material.upload_date
                        ).toLocaleDateString()
                        : "—";


                return `
                    <div class="material-row">

                        <div class="file-icon ${iconClass}">
                            ${extension}
                        </div>

                        <div class="material-info">

                            <strong>
                                ${material.title || "Untitled Material"}
                            </strong>

                            <span>
                                ${material.subject || fileName}
                                • ${extension}
                            </span>

                        </div>

                        <span class="upload-date">
                            ${uploadDate}
                        </span>

                    </div>
                `;

            }).join("");

    }
    catch (error) {

        console.error(
            "Teacher dashboard loading error:",
            error
        );

    }

}


/* ================= INITIAL DATA LOAD ================= */

loadTeacherProfile();

loadTeacherDashboardData();

loadTeacherMaterials();

});

   
// ============================================================
// SUBJECT SEARCH FROM MONGODB
// ============================================================

const subjectSearch = document.getElementById("subjectSearch");
const subjectHidden = document.getElementById("subject");
const subjectSuggestions =
    document.getElementById("subjectSuggestions");

let subjectSearchTimer = null;


// Search subjects while typing
if (subjectSearch) {

    subjectSearch.addEventListener("input", function () {

        const searchText = subjectSearch.value.trim();

        // Clear previously selected subject
        subjectHidden.value = "";

        clearTimeout(subjectSearchTimer);

        if (!searchText) {
            subjectSuggestions.innerHTML = "";
            subjectSuggestions.style.display = "none";
            return;
        }

        subjectSearchTimer = setTimeout(
            () => searchSubjects(searchText),
            250
        );
    });
}


// Fetch subjects from MongoDB through FastAPI
async function searchSubjects(searchText) {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/subjects?search=" +
            encodeURIComponent(searchText)
        );

        const data = await response.json();

        if (data.status !== "success") {
            throw new Error(
                data.message || "Unable to load subjects."
            );
        }

        displaySubjectSuggestions(data.subjects);

    } catch (error) {

        console.error("Subject search error:", error);

        subjectSuggestions.innerHTML = `
            <div class="subject-no-results">
                Unable to load subjects.
            </div>
        `;

        subjectSuggestions.style.display = "block";
    }
}


// Display matching subjects
function displaySubjectSuggestions(subjects) {

    if (!subjects || subjects.length === 0) {

        subjectSuggestions.innerHTML = `
            <div class="subject-no-results">
                No matching subjects found.
            </div>
        `;

        subjectSuggestions.style.display = "block";

        return;
    }


    subjectSuggestions.innerHTML = subjects
        .map(subject => {

            return `
                <div
                    class="subject-suggestion"
                    data-code="${subject.course_code || ""}"
                    data-name="${subject.subject_name}"
                    data-department="${subject.department}"
                    data-semester="${subject.semester}"
                >

                    <strong>
                        ${subject.subject_name}
                    </strong>

                    <span>
                        ${subject.course_code || "No Code"}
                        • Semester ${subject.semester}
                    </span>

                </div>
            `;

        })
        .join("");


    subjectSuggestions.style.display = "block";
}


// Select a subject from the suggestions
if (subjectSuggestions) {

    subjectSuggestions.addEventListener(
        "click",
        function (event) {

            const suggestion =
                event.target.closest(
                    ".subject-suggestion"
                );

            if (!suggestion) return;


            const subjectName =
                suggestion.getAttribute("data-name");

            subjectSearch.value = subjectName;

            subjectHidden.value = subjectName;

            const subjectSemester =
    suggestion.getAttribute("data-semester");

    const semesterSelect =
        document.getElementById("semester");

    if (semesterSelect && subjectSemester) {

        const semesterNumber =
            parseInt(subjectSemester);

        const semesterLabels = {
            1: "1st Semester",
            2: "2nd Semester",
            3: "3rd Semester",
            4: "4th Semester",
            5: "5th Semester",
            6: "6th Semester",
            7: "7th Semester",
            8: "8th Semester"
        };

        semesterSelect.value =
            semesterLabels[semesterNumber] || "";
    }

            subjectSuggestions.innerHTML = "";

            subjectSuggestions.style.display = "none";
        }
    );
}