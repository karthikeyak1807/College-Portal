
// ======================================
// STUDENT ACCESS CHECK
// ======================================

const loggedInUserId =
    sessionStorage.getItem("userId");

const loggedInUserRole =
    sessionStorage.getItem("userRole");


// Student must be logged in

if (!loggedInUserId || loggedInUserRole !== "student") {

    alert("Please login as a student to access the Student Portal.");

    window.location.href =
        "../login/login.html";

}


// ======================================
// NAVIGATION
// ======================================

const navItems =
    document.querySelectorAll(".nav-item");

const sections =
    document.querySelectorAll(".content-section");

const pageTitle =
    document.getElementById("pageTitle");


navItems.forEach(function (item) {

    item.addEventListener("click", function () {

        const sectionId =
            item.getAttribute("data-section");


        // Remove active state

        navItems.forEach(function (nav) {

            nav.classList.remove("active");

        });


        // Add active state

        item.classList.add("active");


        // Hide all sections

        sections.forEach(function (section) {

            section.classList.remove(
                "active-section"
            );

        });


        // Show selected section

        const selectedSection =
            document.getElementById(sectionId);


        if (selectedSection) {

            selectedSection.classList.add(
                "active-section"
            );

        }


        // Change page title

        const titleMap = {

            dashboard: "Dashboard",

            materials: "Study Materials",

            profile: "My Profile"

        };


        pageTitle.textContent =
            titleMap[sectionId];

        if (sectionId === "materials") {
    loadStudentMaterials();
}

        // Close mobile sidebar

        document
            .getElementById("sidebar")
            .classList.remove("open");

    });

});



// ======================================
// VIEW ALL BUTTON
// ======================================

const viewAllButton =
    document.querySelector(".view-all-button");


if (viewAllButton) {

    viewAllButton.addEventListener(
        "click",
        function () {

            const materialsNav =
                document.querySelector(
                    '[data-section="materials"]'
                );

            materialsNav.click();

        }
    );

}



// ======================================
// MOBILE MENU
// ======================================

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");


menuButton.addEventListener(
    "click",
    function () {

        sidebar.classList.toggle("open");

    }
);



// ======================================
// MATERIAL SEARCH
// ======================================

const searchInput =
    document.getElementById("materialSearch");


searchInput.addEventListener(
    "input",
    function () {

        const searchText =
            searchInput.value.toLowerCase();


        const teacherCards =
            document.querySelectorAll(
                ".teacher-material-card"
            );


        teacherCards.forEach(
            function (card) {

                const cardText =
                    card.textContent.toLowerCase();


                if (
                    cardText.includes(searchText)
                ) {

                    card.style.display =
                        "block";

                } else {

                    card.style.display =
                        "none";

                }

            }
        );

    }
);


// ======================================
// MATERIAL VIEW / DOWNLOAD
// ======================================

document.addEventListener("click", function (event) {

    const button = event.target.closest(
        "button[data-material-action]"
    );

    if (!button) {
        return;
    }

    const materialId =
        button.getAttribute("data-material-id");

    const action =
        button.getAttribute("data-material-action");

    if (!materialId || !action) {
        return;
    }


    // ==============================
    // VIEW MATERIAL
    // ==============================

    if (action === "view") {

        const viewUrl =
            "http://127.0.0.1:8000/materials/" +
            encodeURIComponent(materialId) +
            "/view";

        window.open(viewUrl, "_blank");

        return;
    }


    // ==============================
    // DOWNLOAD MATERIAL
    // ==============================

    if (action === "download") {

        const downloadUrl =
            "http://127.0.0.1:8000/materials/" +
            encodeURIComponent(materialId) +
            "/download";

        const link = document.createElement("a");

        link.href = downloadUrl;

        link.download = "";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        return;
    }

});



// ======================================
// LOGOUT
// ======================================

const logoutButton =
    document.getElementById("logoutButton");


logoutButton.addEventListener(
    "click",
    function () {

        const confirmLogout =
            confirm(
                "Are you sure you want to logout?"
            );


        if (confirmLogout) {

            window.location.href = "../login/login.html";

        }

    }
);
// ======================================
// LOAD STUDENT PROFILE FROM BACKEND
// ======================================

async function loadStudentProfile() {

    const userId = sessionStorage.getItem("userId");

    if (!userId) {
        console.error("Student ID not found in session.");
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/students/" +
            encodeURIComponent(userId)
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            console.error(
                "Unable to load student profile:",
                data.message
            );
            return;
        }

        const student = data.student;

        console.log("Student profile loaded:", student);


        // --------------------------------------
        // UPDATE NAME
        // --------------------------------------

        const nameElements =
            document.querySelectorAll(
                ".student-name, #studentName"
            );

        nameElements.forEach(function (element) {
            element.textContent = student.name;
        });


        // --------------------------------------
        // UPDATE EMAIL
        // --------------------------------------

        const emailElements =
            document.querySelectorAll(
                ".student-email, #studentEmail"
            );

        emailElements.forEach(function (element) {
            element.textContent = student.email;
        });


        // --------------------------------------
        // UPDATE STUDENT ID
        // --------------------------------------

        const idElements =
            document.querySelectorAll(
                ".student-id, #studentId"
            );

        idElements.forEach(function (element) {
            element.textContent = student.user_id;
        });


        // --------------------------------------
        // UPDATE DEPARTMENT
        // --------------------------------------

        const departmentElements =
            document.querySelectorAll(
                ".student-department, #studentDepartment"
            );

        departmentElements.forEach(function (element) {
            element.textContent = student.department;
        });


        // --------------------------------------
        // UPDATE SEMESTER
        // --------------------------------------

        const semesterElements =
            document.querySelectorAll(
                ".student-semester, #studentSemester"
            );

        semesterElements.forEach(function (element) {
            element.textContent =
                student.semester + " Semester";
        });


    } catch (error) {

        console.error(
            "Error loading student profile:",
            error
        );

    }
}


// Load profile when dashboard opens
loadStudentProfile();
// ======================================
// LOAD STUDENT PROFILE FROM BACKEND
// ======================================

async function loadStudentProfile() {

    const userId = sessionStorage.getItem("userId");

    if (!userId) {
        console.error("Student ID not found in session.");
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/students/" +
            encodeURIComponent(userId)
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            console.error(
                "Unable to load student profile:",
                data.message
            );
            return;
        }

        const student = data.student;

        console.log("Student profile loaded:", student);


        // ==================================
        // TOP RIGHT MINI PROFILE
        // ==================================

        const miniName =
            document.getElementById("studentMiniName");

        const miniInfo =
            document.getElementById("studentMiniInfo");

        if (miniName) {
            miniName.textContent = student.name;
        }

        if (miniInfo) {
            miniInfo.textContent =
                student.department +
                " • " +
                student.semester +
                " Semester";
        }


        // ==================================
        // WELCOME MESSAGE
        // ==================================

        const welcomeName =
            document.getElementById("studentWelcomeName");

        if (welcomeName) {
            welcomeName.textContent = student.name;
        }


        // ==================================
        // PROFILE
        // ==================================

        const profileName =
            document.getElementById("profileName");

        const profileCourse =
            document.getElementById("profileCourse");

        const registrationId =
            document.getElementById("studentRegistrationId");

        const branch =
            document.getElementById("studentBranch");

        const semester =
            document.getElementById("studentSemester");

        const email =
            document.getElementById("studentEmail");


        if (profileName) {
            profileName.textContent = student.name;
        }

        if (profileCourse) {
            profileCourse.textContent =
                "Student • " + student.department;
        }

        if (registrationId) {
            registrationId.textContent =
                student.user_id;
        }

        if (branch) {
            branch.textContent =
                student.department;
        }

        if (semester) {
            semester.textContent =
                student.semester + " Semester";
        }

        if (email) {
            email.textContent =
                student.email;
        }

    }
    catch (error) {

        console.error(
            "Error loading student profile:",
            error
        );

    }
}


// Load student profile when dashboard opens
loadStudentProfile();

// ======================================
// LOAD REAL STUDY MATERIALS
// ======================================

async function loadStudentMaterials() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/materials"
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {

            console.error(
                "Unable to load materials:",
                data.message
            );

            return;
        }

        const materials = data.materials || [];

        console.log(
            "Student materials loaded:",
            materials
        );

        renderStudentMaterials(materials);

    } catch (error) {

        console.error(
            "Error loading student materials:",
            error
        );
    }
}


// ======================================
// RENDER STUDY MATERIALS
// ======================================

function renderStudentMaterials(materials) {

    const materialsSection =
        document.getElementById("materials");

    if (!materialsSection) {
        return;
    }


    // Find existing teacher material cards
    const oldCards =
        materialsSection.querySelectorAll(
            ".teacher-material-card"
        );


    // Remove the old demo cards
    oldCards.forEach(function (card) {
        card.remove();
    });


    // Create a container for real materials

    let materialsContainer =
        document.getElementById(
            "realStudentMaterials"
        );


    if (!materialsContainer) {

        materialsContainer =
            document.createElement("div");

        materialsContainer.id =
            "realStudentMaterials";


       const searchBox =
    materialsSection.querySelector(
        ".search-box"
    );


if (searchBox) {

    searchBox.insertAdjacentElement(
        "afterend",
        materialsContainer
    );

} else {

    const heading =
        materialsSection.querySelector(
            ".section-heading"
        );

    if (heading) {

        heading.insertAdjacentElement(
            "afterend",
            materialsContainer
        );
    }
}
    }


    // Clear old real materials

    materialsContainer.innerHTML = "";


    // No materials

    if (materials.length === 0) {

        materialsContainer.innerHTML = `

            <div class="teacher-material-card">

                <div class="teacher-header">

                    <div class="teacher-avatar">
                        📚
                    </div>

                    <div>

                        <h3>
                            No Materials Available
                        </h3>

                        <p>
                            No academic materials have been uploaded yet.
                        </p>

                    </div>

                    <span class="material-count">
                        0 Materials
                    </span>

                </div>

            </div>

        `;

        return;
    }


    // ==================================
    // GROUP MATERIALS BY UPLOADER
    // ==================================

    const groupedMaterials = {};


    materials.forEach(function (material) {

        const uploaderId =
            material.uploader_id ||
            "college-staff";


        if (!groupedMaterials[uploaderId]) {

            groupedMaterials[uploaderId] = {

                name:
                    material.uploader_name ||
                    "College Staff",

                materials: []

            };

        }


        groupedMaterials[uploaderId]
            .materials
            .push(material);

    });


    // ==================================
    // CREATE TEACHER CARDS
    // ==================================

    Object.values(groupedMaterials)
        .forEach(function (group) {

        const teacherCard =
            document.createElement("div");

        teacherCard.className =
            "teacher-material-card";


        const initials =
            getInitials(group.name);


        teacherCard.innerHTML = `

            <div class="teacher-header">

                <div class="teacher-avatar">
                    ${initials}
                </div>

                <div>

                    <h3>
                        ${escapeHtml(group.name)}
                    </h3>

                    <p>
                        Academic Faculty
                    </p>

                </div>

                <span class="material-count">
                    ${group.materials.length}
                    Materials
                </span>

            </div>


            <div class="files-grid"></div>

        `;


        const filesGrid =
            teacherCard.querySelector(
                ".files-grid"
            );


        // ==================================
        // CREATE FILE CARDS
        // ==================================

        group.materials.forEach(
            function (material) {

            const fileType =
                getFileType(material);


            const fileClass =
                getFileClass(material);


            const fileCard =
                document.createElement("div");

            fileCard.className =
                "file-card";


            fileCard.innerHTML = `

                <div class="large-file-icon ${fileClass}">
                    ${fileType}
                </div>

                <h4>
                    ${escapeHtml(
                        material.title ||
                        material.file_name
                    )}
                </h4>

                <p>
                    ${escapeHtml(
                        material.subject ||
                        "General"
                    )}
                </p>


                <div class="material-actions">

                    <button
                        type="button"
                        class="student-view-button"
                        data-material-action="view"
                        data-material-id="${material.material_id}"
                    >
                        View
                    </button>


                    <button
                        type="button"
                        class="student-download-button"
                        data-material-action="download"
                        data-material-id="${material.material_id}"
                    >
                        Download
                    </button>

                </div>

            `;


            filesGrid.appendChild(
                fileCard
            );

        });


        materialsContainer.appendChild(
            teacherCard
        );

    });

}


// ======================================
// FILE TYPE
// ======================================

function getFileType(material) {

    if (
        !material ||
        !material.file_type
    ) {

        return "FILE";
    }


    return material.file_type
        .replace(".", "")
        .toUpperCase();
}


// ======================================
// FILE CSS CLASS
// ======================================

function getFileClass(material) {

    const type =
        getFileType(material)
            .toLowerCase();


    if (type === "pdf") {
        return "pdf";
    }


    if (
        type === "doc" ||
        type === "docx"
    ) {

        return "doc";
    }


    if (
        type === "xls" ||
        type === "xlsx"
    ) {

        return "xls";
    }


    if (
        type === "ppt" ||
        type === "pptx"
    ) {

        return "ppt";
    }


    return "doc";
}


// ======================================
// GET INITIALS
// ======================================

function getInitials(name) {

    const words =
        String(name || "College Staff")
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


// ======================================
// ESCAPE HTML
// ======================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================
// LOAD MATERIALS WHEN PAGE OPENS
// ======================================

loadStudentMaterials();



// ======================================
// LOAD DASHBOARD STATISTICS
// ======================================

async function loadDashboardData() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/materials"
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {

            console.error(
                "Unable to load dashboard data:",
                data.message
            );

            return;
        }

        const materials = data.materials || [];

        // ==================================
        // MATERIAL COUNT
        // ==================================

        const materialCount =
            document.getElementById("materialCount");

        if (materialCount) {

            materialCount.textContent =
                materials.length;

        }


        // ==================================
        // TEACHER COUNT
        // ==================================

        const teacherCount =
            document.getElementById("teacherCount");

        if (teacherCount) {

            const uniqueTeachers =
                new Set(
                    materials
                        .map(function(material) {
                            return material.uploader_id;
                        })
                        .filter(Boolean)
                );

            teacherCount.textContent =
                uniqueTeachers.size;

        }


        // ==================================
        // RECENT MATERIALS
        // ==================================

        renderRecentMaterials(materials);

    }
    catch (error) {

        console.error(
            "Error loading dashboard data:",
            error
        );

    }

}



// ======================================
// RENDER RECENT MATERIALS
// ======================================

function renderRecentMaterials(materials) {

    const container =
        document.getElementById(
            "recentMaterialsList"
        );

    if (!container) {
        return;
    }


    // Clear existing content

    container.innerHTML = "";


    // ==================================
    // NO MATERIALS
    // ==================================

    if (materials.length === 0) {

        container.innerHTML = `

            <div class="material-row">

                <div class="material-info">

                    <strong>
                        No materials available
                    </strong>

                    <span>
                        Teachers have not uploaded any materials yet.
                    </span>

                </div>

            </div>

        `;

        return;
    }


    // ==================================
    // SORT BY UPLOAD DATE
    // ==================================

    const recentMaterials =
        [...materials]
            .sort(function(a, b) {

                return new Date(b.upload_date)
                    - new Date(a.upload_date);

            })
            .slice(0, 3);


    // ==================================
    // CREATE RECENT MATERIAL ROWS
    // ==================================

    recentMaterials.forEach(
        function(material) {

            const fileType =
                getFileType(material);


            const row =
                document.createElement("div");

            row.className =
                "material-row";


            row.innerHTML = `

                <div class="file-icon ${getFileClass(material)}">
                    ${fileType}
                </div>


                <div class="material-info">

                    <strong>
                        ${escapeHtml(
                            material.title ||
                            material.file_name
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            material.uploader_name ||
                            "College Staff"
                        )}
                        •
                        ${escapeHtml(
                            material.subject ||
                            "General"
                        )}
                    </span>

                </div>


                <span class="material-date">
                    ${formatMaterialDate(
                        material.upload_date
                    )}
                </span>


                <button
                    type="button"
                    class="download-button"
                    data-material-action="download"
                    data-material-id="${material.material_id}"
                    title="Download material"
                >
                    ↓
                </button>

            `;


            container.appendChild(row);

        }
    );

}



// ======================================
// FORMAT MATERIAL DATE
// ======================================

function formatMaterialDate(dateValue) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return "";
    }


    const now =
        new Date();


    const difference =
        now - date;


    const oneDay =
        24 * 60 * 60 * 1000;


    if (difference < oneDay) {
        return "Today";
    }


    if (difference < 2 * oneDay) {
        return "Yesterday";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}



// ======================================
// LOAD DASHBOARD DATA WHEN PAGE OPENS
// ======================================

loadDashboardData();