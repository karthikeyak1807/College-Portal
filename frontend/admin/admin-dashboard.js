document.addEventListener("DOMContentLoaded", () => {
    const userId = sessionStorage.getItem("userId");
    const userName = sessionStorage.getItem("userName");

    const profileId = document.getElementById("adminProfileId");
    const profileName = document.getElementById("adminProfileName");
    const profileNameDetails = document.getElementById("adminProfileNameDetails");
    const profileAvatar = document.getElementById("adminProfileAvatar");

    if (userId && profileId) {
        profileId.textContent = userId;
    }

    if (userName) {
        if (profileName) {
            profileName.textContent = userName;
        }

        if (profileNameDetails) {
            profileNameDetails.textContent = userName;
        }

        if (profileAvatar) {
            const initials = userName
                .split(" ")
                .map(word => word.charAt(0))
                .join("")
                .substring(0, 2)
                .toUpperCase();

            profileAvatar.textContent = initials;
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {

    const navItems =
        document.querySelectorAll(".nav-item");

    const sections =
        document.querySelectorAll(".content-section");

    const pageTitle =
        document.getElementById("pageTitle");

    const pageSubtitle =
        document.getElementById("pageSubtitle");

    const sidebar =
        document.getElementById("sidebar");

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");


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


            const selectedSection =
                document.getElementById(sectionName);

            if (selectedSection) {
                selectedSection.classList.add("active");
            }


            if (sectionName === "dashboard") {

                pageTitle.textContent =
                    "Admin Dashboard";

                pageSubtitle.textContent =
                    "Master control of the college portal";

            }

            else if (sectionName === "upload") {

                pageTitle.textContent =
                    "Upload Material";

                pageSubtitle.textContent =
                    "Upload materials for students";

            }

            else if (sectionName === "materials") {

                pageTitle.textContent =
                    "All Materials";

                pageSubtitle.textContent =
                    "View materials uploaded by teachers";

            }

            else if (sectionName === "teachers") {

                pageTitle.textContent =
                    "Teachers";

                pageSubtitle.textContent =
                    "Manage registered teachers";

            }

            else if (sectionName === "studentRequests") {

    pageTitle.textContent =
        "Student Requests";

    pageSubtitle.textContent =
        "Review and manage student access requests";

}

else if (sectionName === "studentAccounts") {

    pageTitle.textContent =
        "Student Accounts";

    pageSubtitle.textContent =
        "View and manage registered students";

}

            else if (sectionName === "profile") {

                pageTitle.textContent =
                    "My Profile";

                pageSubtitle.textContent =
                    "Administrator information";

            }


            sidebar.classList.remove("open");

        });

    });

    /* =========================================================
       DASHBOARD STATISTICS
       ========================================================= */

    async function loadDashboardStats() {

        try {

            /* ================= MATERIALS ================= */

            const materialsResponse =
                await fetch(
                    "http://127.0.0.1:8000/materials"
                );

            const materialsData =
                await materialsResponse.json();


            /* ================= TEACHERS ================= */

            const teachersResponse =
                await fetch(
                    "http://127.0.0.1:8000/teachers"
                );

            const teachersData =
                await teachersResponse.json();


            /* ================= STUDENTS ================= */

            const studentsResponse =
                await fetch(
                    "http://127.0.0.1:8000/students"
                );

            const studentsData =
                await studentsResponse.json();


            /* ================= GET ARRAYS ================= */

            const materials =
                materialsData.materials || [];

            const teachers =
                teachersData.teachers || [];

            const students =
                studentsData.students || [];


            /* ================= TOTAL MATERIALS ================= */

            const totalMaterialsCount =
                document.getElementById(
                    "totalMaterialsCount"
                );

            if (totalMaterialsCount) {

                totalMaterialsCount.textContent =
                    materials.length;

            }


            /* ================= TOTAL TEACHERS ================= */

            const totalTeachersCount =
                document.getElementById(
                    "totalTeachersCount"
                );

            if (totalTeachersCount) {

                totalTeachersCount.textContent =
                    teachers.length;

            }


            /* ================= TOTAL STUDENTS ================= */

            const totalStudentsCount =
                document.getElementById(
                    "totalStudentsCount"
                );

            if (totalStudentsCount) {

                totalStudentsCount.textContent =
                    students.length;

            }


            /* ================= THIS MONTH ================= */

            const currentDate =
                new Date();

            const currentMonth =
                currentDate.getMonth();

            const currentYear =
                currentDate.getFullYear();


            const thisMonthMaterials =
                materials.filter(function (material) {

                    const dateValue =
                        material.upload_date ||
                        material.created_at;

                    if (!dateValue) {
                        return false;
                    }


                    const uploadDate =
                        new Date(dateValue);


                    if (
                        Number.isNaN(
                            uploadDate.getTime()
                        )
                    ) {
                        return false;
                    }


                    return (
                        uploadDate.getMonth() ===
                        currentMonth
                        &&
                        uploadDate.getFullYear() ===
                        currentYear
                    );

                });


            const thisMonthMaterialsCount =
                document.getElementById(
                    "thisMonthMaterialsCount"
                );


            if (thisMonthMaterialsCount) {

                thisMonthMaterialsCount.textContent =
                    thisMonthMaterials.length;

            }

        }

        catch (error) {

            console.error(
                "Dashboard statistics error:",
                error
            );

        }

    }


 
    /* ================= UPLOAD BUTTON ================= */

    const goUploadBtn =
        document.getElementById("goUploadBtn");

    if (goUploadBtn) {

        goUploadBtn.addEventListener(
            "click",
            function () {

                const uploadNav =
                    document.querySelector(
                        '[data-section="upload"]'
                    );

                if (uploadNav) {
                    uploadNav.click();
                }

            }
        );

    }



    /* ================= VIEW ALL ================= */

    const viewAllBtn =
        document.getElementById("viewAllBtn");

    if (viewAllBtn) {

        viewAllBtn.addEventListener(
            "click",
            function () {

                const materialsNav =
                    document.querySelector(
                        '[data-section="materials"]'
                    );

                if (materialsNav) {
                    materialsNav.click();
                }

            }
        );

    }



    /* ================= FILE UPLOAD ================= */

    const uploadBox =
        document.getElementById("uploadBox");

    const fileInput =
        document.getElementById("fileInput");

    const selectedFile =
        document.getElementById("selectedFile");


    if (uploadBox && fileInput) {

        uploadBox.addEventListener(
            "click",
            function () {

                fileInput.click();

            }
        );

    }


    if (fileInput && selectedFile) {

        fileInput.addEventListener(
            "change",
            function () {

                if (fileInput.files.length > 0) {

                    selectedFile.textContent =
                        "Selected file: " +
                        fileInput.files[0].name;

                }

            }
        );

    }



    /* ================= DRAG DROP ================= */

    if (uploadBox && fileInput && selectedFile) {

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

    }

    /* ================= UPLOAD FORM ================= */

const uploadForm =
    document.getElementById("uploadForm");

if (uploadForm) {

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
                ).value.trim();

            const file =
                fileInput.files[0];


            /* ================= VALIDATION ================= */

            if (!title) {

                alert(
                    "Please enter the material title."
                );

                return;
            }


            if (!subject) {

                alert(
                    "Please enter the subject."
                );

                return;
            }


            if (!file) {

                alert(
                    "Please select a file first."
                );

                return;
            }


            /* ================= GET HOD DETAILS ================= */

            const uploaderId =
                sessionStorage.getItem(
                    "userId"
                ) || "HOD001";

            const uploaderName =
                sessionStorage.getItem(
                    "userName"
                ) || "HOD";

            const uploaderRole =
                sessionStorage.getItem(
                    "userRole"
                ) || "admin";


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
                uploaderName
            );

            formData.append(
                "uploader_role",
                uploaderRole
            );

            formData.append(
                "file",
                file
            );


            /* ================= DISABLE BUTTON ================= */

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


            try {

                /* ================= SEND TO BACKEND ================= */

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


                /* ================= HANDLE ERROR ================= */

                if (
                    !response.ok ||
                    data.status !== "success"
                ) {

                    throw new Error(
                        data.message ||
                        "Material upload failed."
                    );

                }


                /* ================= SUCCESS ================= */

                alert(
                    "Material uploaded successfully! 🎉\n\n" +
                    "Title: " + title +
                    "\nSubject: " + subject +
                    "\nFile: " + file.name
                );


                /* ================= RESET FORM ================= */

                uploadForm.reset();

                if (selectedFile) {

                    selectedFile.textContent =
                        "";

                }


                /* ================= REFRESH DATA ================= */

                await loadMaterials();

                await loadRecentMaterials();

                await loadDashboardStats();


            }

            catch (error) {

                console.error(
                    "Material upload error:",
                    error
                );


                alert(
                    "Material upload failed.\n\n" +
                    error.message
                );

            }

            finally {

                /* ================= RESTORE BUTTON ================= */

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalButtonText;
                }

            }

        }
    );

}

        /* =========================================================
       MATERIAL MANAGEMENT
       ========================================================= */

    const materialsTableBody =
        document.getElementById("materialsTableBody");


    /* ================= LOAD ALL MATERIALS ================= */

    async function loadMaterials() {

        if (!materialsTableBody) {
            return;
        }


        materialsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;"
                >
                    Loading materials...
                </td>
            </tr>
        `;


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/materials"
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                data.status !== "success"
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load materials."
                );

            }


            const materials =
                data.materials || [];


            /* ================= NO MATERIALS ================= */

            if (materials.length === 0) {

                materialsTableBody.innerHTML = `
                    <tr>
                        <td
                            colspan="6"
                            style="text-align:center;"
                        >
                            No materials found.
                        </td>
                    </tr>
                `;

                return;

            }


            /* ================= DISPLAY MATERIALS ================= */

            materialsTableBody.innerHTML =
                materials.map(function (material) {

                    const fileName =
                        material.file_name ||
                        "Unknown file";


                    const fileExtension =
                        getFileExtension(
                            fileName
                        );


                    const fileType =
                        getFileType(
                            fileExtension
                        );


                    const fileIconClass =
                        getFileIconClass(
                            fileExtension
                        );


                    const uploadDate =
                        formatMaterialDate(
                            material.upload_date
                        );


                    const uploaderName =
                        material.uploader_name ||
                        "Unknown";


                    const initials =
                        getInitials(
                            uploaderName
                        );


                    return `
                        <tr>

                            <td>

                                <div class="table-material">

                                    <div class="file-icon ${fileIconClass}">
                                        ${fileType}
                                    </div>

                                    <div>

                                        <strong>
                                            ${escapeStudentHtml(
                                                material.title ||
                                                "Untitled Material"
                                            )}
                                        </strong>

                                        <span>
                                            ${escapeStudentHtml(
                                                fileName
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </td>


                            <td>
                                ${escapeStudentHtml(
                                    material.subject ||
                                    "—"
                                )}
                            </td>


                            <td>

                                <div class="uploader">

                                    <div class="small-avatar">
                                        ${escapeStudentHtml(
                                            initials
                                        )}
                                    </div>

                                    ${escapeStudentHtml(
                                        uploaderName
                                    )}

                                </div>

                            </td>


                            <td>

                                <span class="type-badge">
                                    ${escapeStudentHtml(
                                        fileType
                                    )}
                                </span>

                            </td>


                            <td>
                                ${escapeStudentHtml(
                                    uploadDate
                                )}
                            </td>


                            <td>

                                <div class="action-buttons">

                                    <button
                                        class="view-btn"
                                        data-material-action="view"
                                        data-material-id="${escapeStudentHtml(
                                            material.material_id
                                        )}"
                                        title="View"
                                    >
                                        👁
                                    </button>

                                    <button
                                        class="download-btn"
                                        data-material-action="download"
                                        data-material-id="${escapeStudentHtml(
                                            material.material_id
                                        )}"
                                        title="Download"
                                    >
                                        ⬇
                                    </button>

                                    <button
                                        class="delete-btn"
                                        data-material-action="delete"
                                        data-material-id="${escapeStudentHtml(
                                            material.material_id
                                        )}"
                                        data-uploader-id="${escapeStudentHtml(
                                            material.uploader_id ||
                                            ""
                                        )}"
                                        title="Delete"
                                    >
                                        🗑
                                    </button>

                                </div>

                            </td>

                        </tr>
                    `;

                }).join("");

        }

        catch (error) {

            console.error(
                "Load materials error:",
                error
            );


            materialsTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="text-align:center;"
                    >
                        Unable to load materials.
                    </td>
                </tr>
            `;

        }

    }


    /* ================= FILE EXTENSION ================= */

    function getFileExtension(fileName) {

        const parts =
            String(fileName)
                .split(".");

        if (parts.length < 2) {
            return "";
        }

        return parts
            .pop()
            .toLowerCase();

    }


    /* ================= FILE TYPE ================= */

    function getFileType(extension) {

        const types = {

            pdf: "PDF",

            doc: "DOC",
            docx: "DOC",

            xls: "XLS",
            xlsx: "XLS",

            ppt: "PPT",
            pptx: "PPT",

            jpg: "IMG",
            jpeg: "IMG",
            png: "IMG",

            txt: "TXT"

        };

        return types[extension] || "FILE";

    }


    /* ================= FILE ICON CLASS ================= */

    function getFileIconClass(extension) {

        if (extension === "pdf") {
            return "pdf";
        }

        if (
            extension === "ppt" ||
            extension === "pptx"
        ) {
            return "ppt";
        }

        if (
            extension === "doc" ||
            extension === "docx"
        ) {
            return "doc";
        }

        return "doc";

    }


    /* ================= INITIALS ================= */

    function getInitials(name) {

        const parts =
            String(name || "User")
                .trim()
                .split(/\s+/);

        if (parts.length >= 2) {

            return (
                parts[0].charAt(0) +
                parts[parts.length - 1].charAt(0)
            ).toUpperCase();

        }

        return name
            .substring(0, 2)
            .toUpperCase();

    }


    /* ================= DATE FORMAT ================= */

    function formatMaterialDate(dateValue) {

        if (!dateValue) {
            return "—";
        }


        const date =
            new Date(dateValue);


        if (Number.isNaN(date.getTime())) {
            return "—";
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* ================= INITIAL MATERIAL LOAD ================= */

    loadMaterials();

    /* ================= LOAD RECENT MATERIALS ================= */

async function loadRecentMaterials() {

    const recentMaterialsList =
        document.getElementById("recentMaterialsList");

    if (!recentMaterialsList) {
        return;
    }


    recentMaterialsList.innerHTML = `
        <div class="material-row">

            <div class="file-icon pdf">
                PDF
            </div>

            <div class="material-info">

                <strong>
                    Loading materials...
                </strong>

                <span>
                    Please wait...
                </span>

            </div>

            <span class="upload-date">
                —
            </span>

        </div>
    `;


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/materials"
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.status !== "success"
        ) {

            throw new Error(
                data.message ||
                "Unable to load recent materials."
            );

        }


        const materials =
            data.materials || [];


        /* ================= NO MATERIALS ================= */

        if (materials.length === 0) {

            recentMaterialsList.innerHTML = `
                <div class="material-row">

                    <div class="file-icon pdf">
                        —
                    </div>

                    <div class="material-info">

                        <strong>
                            No materials uploaded yet
                        </strong>

                        <span>
                            Uploaded materials will appear here.
                        </span>

                    </div>

                    <span class="upload-date">
                        —
                    </span>

                </div>
            `;

            return;

        }


        /* ================= SORT NEWEST FIRST ================= */

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


        /* ================= SHOW LATEST 3 ================= */

        const recentMaterials =
            materials.slice(0, 3);


        recentMaterialsList.innerHTML =
            recentMaterials.map(function (material) {

                const fileName =
                    material.file_name ||
                    "Unknown file";


                const fileExtension =
                    getFileExtension(
                        fileName
                    );


                const fileType =
                    getFileType(
                        fileExtension
                    );


                const fileIconClass =
                    getFileIconClass(
                        fileExtension
                    );


                const uploadDate =
                    formatMaterialDate(
                        material.upload_date ||
                        material.created_at
                    );


                return `
                    <div class="material-row">

                        <div class="file-icon ${fileIconClass}">
                            ${fileType}
                        </div>


                        <div class="material-info">

                            <strong>
                                ${escapeStudentHtml(
                                    material.title ||
                                    "Untitled Material"
                                )}
                            </strong>

                            <span>
                                ${escapeStudentHtml(
                                    material.subject ||
                                    fileName
                                )}
                            </span>

                        </div>


                        <span class="upload-date">
                            ${escapeStudentHtml(
                                uploadDate
                            )}
                        </span>

                    </div>
                `;

            }).join("");

    }

    catch (error) {

        console.error(
            "Recent materials error:",
            error
        );


        recentMaterialsList.innerHTML = `
            <div class="material-row">

                <div class="file-icon pdf">
                    ⚠️
                </div>

                <div class="material-info">

                    <strong>
                        Unable to load materials
                    </strong>

                    <span>
                        Please check the server connection.
                    </span>

                </div>

                <span class="upload-date">
                    —
                </span>

            </div>
        `;

    }

}


/* ================= INITIAL RECENT MATERIALS LOAD ================= */

loadRecentMaterials();

    /* ================= SEARCH ================= */

    const materialSearch =
        document.getElementById("materialSearch");


    if (materialSearch) {

        materialSearch.addEventListener(
            "input",
            function () {

                const value =
                    this.value.toLowerCase();

                const rows =
                    document.querySelectorAll(
                        "#materialsTableBody tr"
                    );


                rows.forEach(function (row) {

                    const text =
                        row.textContent.toLowerCase();


                    if (text.includes(value)) {

                        row.style.display = "";

                    } else {

                        row.style.display = "none";

                    }

                });

            }
        );

    }


    /* ================= MATERIAL ACTION BUTTONS ================= */

document.addEventListener(
    "click",
    async function (event) {

        /* =====================================================
           GET MATERIAL ACTION BUTTON
           ===================================================== */

        const button =
            event.target.closest(
                "[data-material-action]"
            );


        if (!button) {
            return;
        }


        const action =
            button.getAttribute(
                "data-material-action"
            );


        const materialId =
            button.getAttribute(
                "data-material-id"
            );


        /* =====================================================
           CHECK MATERIAL ID
           ===================================================== */

        if (!materialId) {

            alert(
                "Material ID not found."
            );

            return;
        }


        /* =====================================================
           VIEW MATERIAL
           ===================================================== */

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


        /* =====================================================
           DOWNLOAD MATERIAL
           ===================================================== */

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


        /* =====================================================
           DELETE MATERIAL
           ===================================================== */

        if (action === "delete") {

            const uploaderId =
                button.getAttribute(
                    "data-uploader-id"
                );


            if (!uploaderId) {

                alert(
                    "Uploader ID not found."
                );

                return;
            }


            /* ================= CONFIRM ================= */

            const confirmation =
                confirm(
                    "Are you sure you want to delete this material?\n\n" +
                    "This will permanently remove the material."
                );


            if (!confirmation) {
                return;
            }


            try {

                /* ================= DELETE REQUEST ================= */

                const response =
                    await fetch(
                        "http://127.0.0.1:8000/materials/" +
                        encodeURIComponent(materialId) +
                        "?uploader_id=" +
                        encodeURIComponent(uploaderId),
                        {
                            method: "DELETE"
                        }
                    );


                const data =
                    await response.json();


                /* ================= CHECK RESPONSE ================= */

                if (
                    !response.ok ||
                    data.status !== "success"
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to delete material."
                    );

                }


                /* ================= SUCCESS ================= */

                alert(
                    "Material deleted successfully! 🗑️"
                );


                /* ================= REFRESH MATERIALS ================= */

                await loadMaterials();


                /* ================= REFRESH RECENT MATERIALS ================= */

                await loadRecentMaterials();


                /* ================= REFRESH DASHBOARD STATS ================= */

                await loadDashboardStats();

            }

            catch (error) {

                console.error(
                    "Delete material error:",
                    error
                );


                alert(
                    "Unable to delete material.\n\n" +
                    error.message
                );

            }

        }

    }
);
    /* =========================================================
   STUDENT REQUEST MANAGEMENT
   ========================================================= */

const studentRequestsTableBody =
    document.getElementById("studentRequestsTableBody");

const pendingStudentCount =
    document.getElementById("pendingStudentCount");

const approveAllStudentsBtn =
    document.getElementById("approveAllStudentsBtn");

const refreshStudentRequestsBtn =
    document.getElementById("refreshStudentRequestsBtn");


/* ================= LOAD STUDENT REQUESTS ================= */

async function loadStudentRequests() {

    if (!studentRequestsTableBody) {
        return;
    }


    studentRequestsTableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;">
                Loading student requests...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/student-requests"
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.status !== "success"
        ) {

            throw new Error(
                data.message ||
                "Unable to load student requests."
            );

        }


        const requests =
            data.requests || [];


        /* Update pending count */

        if (pendingStudentCount) {

            pendingStudentCount.textContent =
                requests.length;

        }


        /* No requests */

        if (requests.length === 0) {

            studentRequestsTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="text-align:center;"
                    >
                        No pending student requests.
                    </td>
                </tr>
            `;

            return;

        }


        /* Display requests */

        studentRequestsTableBody.innerHTML =
            requests.map(function (student) {

                return `
                    <tr>

                        <td>
                            ${escapeStudentHtml(student.name)}
                        </td>

                        <td>
                            ${escapeStudentHtml(student.user_id)}
                        </td>

                        <td>
                            ${escapeStudentHtml(student.email)}
                        </td>

                        <td>
                            ${escapeStudentHtml(student.department)}
                        </td>

                        <td>
                            ${escapeStudentHtml(student.semester)}
                        </td>

                        <td>

                            <button
                                class="student-action-btn student-view-btn"
                                data-student-action="view-request"
                                data-student-id="${escapeStudentHtml(student.user_id)}"
                            >
                                View
                            </button>

                            <button
                                class="student-action-btn"
                                data-student-action="approve"
                                data-student-id="${escapeStudentHtml(student.user_id)}"
                            >
                                Approve
                            </button>

                            <button
                                class="student-action-btn student-delete-btn"
                                data-student-action="delete"
                                data-student-id="${escapeStudentHtml(student.user_id)}"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>
                `;

            }).join("");

    }

    catch (error) {

        console.error(
            "Student request error:",
            error
        );


        studentRequestsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;"
                >
                    Unable to load student requests.
                </td>
            </tr>
        `;

    }

}


/* ================= APPROVE ONE STUDENT ================= */

async function approveStudent(studentId) {

    if (
        !confirm(
            "Approve this student's access?"
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/students/" +
                encodeURIComponent(studentId) +
                "/approve",
                {
                    method: "PUT"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.status !== "success"
        ) {

            alert(
                data.message ||
                "Unable to approve student."
            );

            return;

        }


        alert(
            "Student approved successfully! 🎉"
        );


        await loadStudentRequests();

    }

    catch (error) {

        console.error(
            "Approve student error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );

    }

}

/* ================= DELETE STUDENT REQUEST ================= */

async function deleteStudentRequest(studentId) {

    if (
        !confirm(
            "Are you sure you want to delete this student request?"
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/students/" +
                encodeURIComponent(studentId),
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.status !== "success"
        ) {

            alert(
                data.message ||
                "Unable to delete student request."
            );

            return;

        }


        alert(
            "Student request deleted successfully!"
        );


        // Refresh the pending requests table
        await loadStudentRequests();


        // Also refresh student accounts
        if (
            typeof loadStudentAccounts ===
            "function"
        ) {

            await loadStudentAccounts();

        }

    }

    catch (error) {

        console.error(
            "Delete student request error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );

    }

}

/* ================= APPROVE ALL ================= */

async function approveAllStudents() {

    if (
        !confirm(
            "Are you sure you want to approve all pending students?"
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/students/approve-all",
                {
                    method: "PUT"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.status !== "success"
        ) {

            alert(
                data.message ||
                "Unable to approve students."
            );

            return;

        }


        alert(
            data.message ||
            "All pending students approved successfully!"
        );


        await loadStudentRequests();

    }

    catch (error) {

        console.error(
            "Approve all error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );

    }

}


/* ================= REFRESH ================= */

if (refreshStudentRequestsBtn) {

    refreshStudentRequestsBtn.addEventListener(
        "click",
        function () {

            loadStudentRequests();

        }
    );

}


/* ================= APPROVE ALL BUTTON ================= */

if (approveAllStudentsBtn) {

    approveAllStudentsBtn.addEventListener(
        "click",
        function () {

            approveAllStudents();

        }
    );

}


/* ================= REQUEST ACTIONS ================= */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "[data-student-action]"
            );


        if (!button) {
            return;
        }


        const action =
            button.getAttribute(
                "data-student-action"
            );


        const studentId =
            button.getAttribute(
                "data-student-id"
            );


        if (action === "approve") {

            approveStudent(
                studentId
            );

        }


        else if (action === "view-request") {

            viewStudentRequest(
                studentId
            );

        }


        else if (action === "delete") {

              deleteStudentRequest(studentId);

        }

    }
);


/* ================= VIEW REQUEST ================= */

async function viewStudentRequest(studentId) {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/students/" +
                encodeURIComponent(studentId)
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.status !== "success"
        ) {

            alert(
                data.message ||
                "Student not found."
            );

            return;

        }


        const student =
            data.student;


        alert(
            "Student Details\n\n" +
            "Name: " +
            student.name +
            "\nRegistration ID: " +
            student.user_id +
            "\nEmail: " +
            student.email +
            "\nDepartment: " +
            student.department +
            "\nSemester: " +
            student.semester +
            "\nStatus: " +
            student.approval_status
        );

    }

    catch (error) {

        console.error(
            "View student error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );

    }

}


/* ================= HTML ESCAPE ================= */

function escapeStudentHtml(value) {

    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ================= INITIAL LOAD ================= */

loadStudentRequests();

    /* =========================================================
       STUDENT ACCOUNTS MANAGEMENT
       ========================================================= */

    const studentAccountsTableBody =
        document.getElementById("studentAccountsTableBody");

    const registeredStudentCount =
        document.getElementById("registeredStudentCount");

    const studentSearch =
        document.getElementById("studentSearch");


    /* ================= LOAD STUDENT ACCOUNTS ================= */

    async function loadStudentAccounts() {

        if (!studentAccountsTableBody) {
            return;
        }


        studentAccountsTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    Loading student accounts...
                </td>
            </tr>
        `;


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/students"
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                data.status !== "success"
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load student accounts."
                );

            }


            const students =
                data.students || [];


            if (registeredStudentCount) {

                registeredStudentCount.textContent =
                    students.length;

            }


            if (students.length === 0) {

                studentAccountsTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center;">
                            No student accounts found.
                        </td>
                    </tr>
                `;

                return;

            }


            renderStudentAccounts(students);

        }

        catch (error) {

            console.error(
                "Student accounts error:",
                error
            );


            studentAccountsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;">
                        Unable to load student accounts.
                    </td>
                </tr>
            `;

        }

    }


    /* ================= RENDER STUDENT ACCOUNTS ================= */

    function renderStudentAccounts(students) {

        studentAccountsTableBody.innerHTML =
            students.map(function (student) {

                return `
                    <tr>

                        <td>
                            ${escapeStudentHtml(student.name)}
                        </td>

                        <td>
                            ${escapeStudentHtml(student.user_id)}
                        </td>

                        <td>
                            ${escapeStudentHtml(student.email)}
                        </td>

                        <td>
                            ${escapeStudentHtml(student.department)}
                        </td>

                        <td>
                            ${escapeStudentHtml(student.semester)}
                        </td>

                        <td>
                            ${escapeStudentHtml(student.approval_status)}
                        </td>

                        <td>

                            <button
                                class="student-action-btn"
                                data-account-action="view"
                                data-student-id="${escapeStudentHtml(student.user_id)}"
                            >
                                View
                            </button>

                            <button
                                class="student-action-btn student-delete-btn"
                                data-account-action="delete"
                                data-student-id="${escapeStudentHtml(student.user_id)}"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>
                `;

            }).join("");

    }


    /* ================= SEARCH STUDENTS ================= */

    if (studentSearch) {

        studentSearch.addEventListener(
            "input",
            function () {

                const searchValue =
                    this.value
                        .trim()
                        .toLowerCase();


                const rows =
                    document.querySelectorAll(
                        "#studentAccountsTableBody tr"
                    );


                rows.forEach(function (row) {

                    const rowText =
                        row.textContent.toLowerCase();


                    if (
                        rowText.includes(
                            searchValue
                        )
                    ) {

                        row.style.display = "";

                    }

                    else {

                        row.style.display = "none";

                    }

                });

            }
        );

    }


    /* ================= VIEW STUDENT ACCOUNT ================= */

    async function viewStudentAccount(studentId) {

        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/students/" +
                    encodeURIComponent(studentId)
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                data.status !== "success"
            ) {

                alert(
                    data.message ||
                    "Student not found."
                );

                return;

            }


            const student =
                data.student;


            alert(
                "Student Details\n\n" +

                "Name: " +
                student.name +

                "\nRegistration ID: " +
                student.user_id +

                "\nEmail: " +
                student.email +

                "\nDepartment: " +
                student.department +

                "\nSemester: " +
                student.semester +

                "\nStatus: " +
                student.approval_status
            );

        }

        catch (error) {

            console.error(
                "View student account error:",
                error
            );


            alert(
                "Unable to connect to the server."
            );

        }

    }


    /* ================= DELETE STUDENT ACCOUNT ================= */

    async function deleteStudentAccount(studentId) {

        const confirmation =
            confirm(
                "Are you sure you want to delete student " +
                studentId +
                "?\n\nThis will permanently remove the student account."
            );


        if (!confirmation) {
            return;
        }


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/students/" +
                    encodeURIComponent(studentId),
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                data.status !== "success"
            ) {

                alert(
                    data.message ||
                    "Unable to delete student."
                );

                return;

            }


            alert(
                "Student account deleted successfully! 🗑"
            );


            await loadStudentAccounts();

            await loadStudentRequests();

        }

        catch (error) {

            console.error(
                "Delete student error:",
                error
            );


            alert(
                "Unable to connect to the server."
            );

        }

    }


    /* ================= STUDENT ACCOUNT ACTIONS ================= */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-account-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.getAttribute(
                    "data-account-action"
                );


            const studentId =
                button.getAttribute(
                    "data-student-id"
                );


            if (action === "view") {

                viewStudentAccount(
                    studentId
                );

            }


            else if (action === "delete") {

                deleteStudentAccount(
                    studentId
                );

            }

        }
    );


    /* ================= INITIAL STUDENT ACCOUNT LOAD ================= */

    loadStudentAccounts();

    /* ================= TEACHER MANAGEMENT ================= */

    const showCreateTeacherBtn =
        document.getElementById(
            "showCreateTeacherBtn"
        );

    const createTeacherFormContainer =
        document.getElementById(
            "createTeacherFormContainer"
        );

    const createTeacherForm =
        document.getElementById(
            "createTeacherForm"
        );

    const cancelTeacherBtn =
        document.getElementById(
            "cancelTeacherBtn"
        );

    const teacherPhotoUpload =
        document.getElementById(
            "teacherPhotoUpload"
        );

    const teacherPhoto =
        document.getElementById(
            "teacherPhoto"
        );

    const teacherPhotoName =
        document.getElementById(
            "teacherPhotoName"
        );

    const teacherFormMessage =
        document.getElementById(
            "teacherFormMessage"
        );



    /* SHOW CREATE TEACHER FORM */

    if (
        showCreateTeacherBtn &&
        createTeacherFormContainer &&
        createTeacherForm
    ) {

        showCreateTeacherBtn.addEventListener(
            "click",
            function () {

                createTeacherFormContainer.classList.add(
                    "show"
                );

                createTeacherForm.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    }



    /* TEACHER PHOTO */

    if (
        teacherPhotoUpload &&
        teacherPhoto
    ) {

        teacherPhotoUpload.addEventListener(
            "click",
            function () {

                teacherPhoto.click();

            }
        );


        teacherPhoto.addEventListener(
            "change",
            function () {

                if (
                    teacherPhoto.files.length > 0 &&
                    teacherPhotoName
                ) {

                    teacherPhotoName.textContent =
                        "Selected photo: " +
                        teacherPhoto.files[0].name;

                }

            }
        );

    }



    /* CANCEL */

    if (
        cancelTeacherBtn &&
        createTeacherForm
    ) {

        cancelTeacherBtn.addEventListener(
            "click",
            function () {

                createTeacherForm.reset();

                if (teacherPhotoName) {
                    teacherPhotoName.textContent = "";
                }

                if (teacherFormMessage) {
                    teacherFormMessage.textContent = "";
                }

                if (createTeacherFormContainer) {
                    createTeacherFormContainer.classList.remove(
                        "show"
                    );
                }

            }
        );

    }



    /* ================= CREATE TEACHER ================= */

    if (createTeacherForm) {

        createTeacherForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const teacherId =
                    document.getElementById(
                        "teacherId"
                    ).value.trim();

                const teacherName =
                    document.getElementById(
                        "teacherName"
                    ).value.trim();

                const teacherEmail =
                    document.getElementById(
                        "teacherEmail"
                    ).value.trim();

                const department =
                    document.getElementById(
                        "teacherDepartment"
                    ).value;

                const subject =
                    document.getElementById(
                        "teacherSubject"
                    ).value.trim();

                const designation =
                    document.getElementById(
                        "teacherDesignation"
                    ).value;

                const password =
                    document.getElementById(
                        "teacherPassword"
                    ).value;

                const confirmPassword =
                    document.getElementById(
                        "teacherConfirmPassword"
                    ).value;



                /* PASSWORD CHECK */

                if (password !== confirmPassword) {

                    teacherFormMessage.textContent =
                        "Passwords do not match.";

                    teacherFormMessage.style.color =
                        "#dc2626";

                    return;

                }



                /* BASIC VALIDATION */

                if (
                    !teacherId ||
                    !teacherName ||
                    !teacherEmail ||
                    !department ||
                    !subject ||
                    !designation ||
                    !password
                ) {

                    teacherFormMessage.textContent =
                        "Please fill in all required fields.";

                    teacherFormMessage.style.color =
                        "#dc2626";

                    return;

                }



                teacherFormMessage.textContent =
                    "Creating teacher account...";

                teacherFormMessage.style.color =
                    "#2563eb";



              try {

    const formData = new FormData();

    formData.append(
        "user_id",
        teacherId
    );

    formData.append(
        "name",
        teacherName
    );

    formData.append(
        "email",
        teacherEmail
    );

    formData.append(
        "department",
        department
    );

    formData.append(
        "subject",
        subject
    );

    formData.append(
        "designation",
        designation
    );

    formData.append(
        "password",
        password
    );


    /* ================= PROFILE PHOTO ================= */

    if (
        teacherPhoto &&
        teacherPhoto.files.length > 0
    ) {

        formData.append(
            "photo",
            teacherPhoto.files[0]
        );

    }


    /* ================= SEND TO BACKEND ================= */

    const response =
        await fetch(
            "http://127.0.0.1:8000/teachers",
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
            "Unable to create teacher account.";

        if (data.detail) {

            if (Array.isArray(data.detail)) {

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


        teacherFormMessage.textContent =
            errorMessage;

        teacherFormMessage.style.color =
            "#dc2626";

        return;
    }


    /* ================= APPLICATION ERROR ================= */

    if (data.status === "error") {

        teacherFormMessage.textContent =
            data.message ||
            "Unable to create teacher account.";

        teacherFormMessage.style.color =
            "#dc2626";

        return;
    }


    /* ================= SUCCESS ================= */

    teacherFormMessage.textContent =
        "Teacher account created successfully!";

    teacherFormMessage.style.color =
        "#16a34a";


    alert(
        "Teacher account created successfully! 🎉\n\n" +
        "Teacher ID: " +
        teacherId +
        "\nName: " +
        teacherName +
        "\nDepartment: " +
        department +
        "\nSubject: " +
        subject
    );


    createTeacherForm.reset();


    if (teacherPhotoName) {

        teacherPhotoName.textContent = "";

    }

}
catch (error) {

    console.error(
        "Teacher creation error:",
        error
    );


    teacherFormMessage.textContent =
        "Unable to connect to the server.";

    teacherFormMessage.style.color =
        "#dc2626";

}

            }
        );

    }

    /* =========================================================
     
        /* =========================================================
       REGISTERED TEACHERS MANAGEMENT
       ========================================================= */

    const teacherGrid =
        document.getElementById("teacherGrid");


    /* ================= LOAD REGISTERED TEACHERS ================= */

    async function loadRegisteredTeachers() {

        if (!teacherGrid) {
            return;
        }


        /* SHOW LOADING */

        teacherGrid.innerHTML = `
            <div class="teacher-card">

                <div class="teacher-card-avatar">
                    👨‍🏫
                </div>

                <h3>
                    Loading teachers...
                </h3>

                <p>
                    Please wait
                </p>

                <span>
                    Loading registered teachers...
                </span>

            </div>
        `;


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/teachers"
                );


            const data =
                await response.json();


            /* CHECK BACKEND RESPONSE */

            if (
                !response.ok ||
                data.status !== "success"
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load teachers."
                );

            }


            const teachers =
                data.teachers || [];


            /* NO TEACHERS */

            if (teachers.length === 0) {

                teacherGrid.innerHTML = `
                    <div class="teacher-card">

                        <div class="teacher-card-avatar">
                            👨‍🏫
                        </div>

                        <h3>
                            No Teachers Found
                        </h3>

                        <p>
                            No teacher accounts are registered yet.
                        </p>

                        <span>
                            Create a teacher account to see it here.
                        </span>

                    </div>
                `;

                return;

            }


            /* ================= CREATE TEACHER CARDS ================= */

            teacherGrid.innerHTML =
                teachers.map(function (teacher) {

                    /* CREATE INITIALS */

                    const name =
                        teacher.name || "Teacher";

                    const nameParts =
                        name.trim().split(/\s+/);

                    let initials = "";

                    if (nameParts.length >= 2) {

                        initials =
                            nameParts[0].charAt(0) +
                            nameParts[nameParts.length - 1].charAt(0);

                    }

                    else {

                        initials =
                            name.substring(0, 2);

                    }


                    initials =
                        initials.toUpperCase();


                    /* PROFILE PHOTO */

                    let avatarHTML = `
                        <div class="teacher-card-avatar">
                            ${escapeStudentHtml(initials)}
                        </div>
                    `;


                    if (teacher.profile_photo) {

                        avatarHTML = `
                            <div class="teacher-card-avatar">
                                <img
                                    src="http://127.0.0.1:8000/uploads/${encodeURIComponent(
                                        teacher.profile_photo
                                    )}"
                                    alt="${escapeStudentHtml(name)}"
                                    style="
                                        width:100%;
                                        height:100%;
                                        object-fit:cover;
                                        border-radius:inherit;
                                    "
                                >
                            </div>
                        `;

                    }


                    return `
    <div class="teacher-card">

        ${avatarHTML}

        <h3>
            ${escapeStudentHtml(
                teacher.name
            )}
        </h3>

        <p>
            ${escapeStudentHtml(
                teacher.designation ||
                "Teacher"
            )}
        </p>

        <span>
            ${escapeStudentHtml(
                teacher.department ||
                ""
            )}
            •
            ${escapeStudentHtml(
                teacher.subject ||
                ""
            )}
        </span>

        <div class="teacher-material-count">
            👤 ID:
            ${escapeStudentHtml(
                teacher.user_id
            )}
        </div>

        <div class="teacher-card-actions">

            <button
                type="button"
                class="teacher-delete-btn"
                data-teacher-id="${escapeStudentHtml(
                    teacher.user_id
                )}"
                data-teacher-name="${escapeStudentHtml(
                    teacher.name
                )}"
            >
                🗑️ Delete Teacher
            </button>

        </div>

    </div>
`;
                    

                }).join("");


        }

        catch (error) {

            console.error(
                "Registered teachers error:",
                error
            );


            teacherGrid.innerHTML = `
                <div class="teacher-card">

                    <div class="teacher-card-avatar">
                        ⚠️
                    </div>

                    <h3>
                        Unable to Load Teachers
                    </h3>

                    <p>
                        Server connection problem
                    </p>

                    <span>
                        Please check that the FastAPI server is running.
                    </span>

                </div>
            `;

        }

    }

        /* ================= DELETE TEACHER ================= */

    if (teacherGrid) {

        teacherGrid.addEventListener(
            "click",
            async function (event) {

                const deleteButton =
                    event.target.closest(
                        ".teacher-delete-btn"
                    );

                if (!deleteButton) {
                    return;
                }

                const teacherId =
                    deleteButton.getAttribute(
                        "data-teacher-id"
                    );

                const teacherName =
                    deleteButton.getAttribute(
                        "data-teacher-name"
                    );

                if (!teacherId) {
                    return;
                }

                const confirmation =
                    confirm(
                        "Delete Teacher Account?\n\n" +
                        "Teacher: " + teacherName +
                        "\nTeacher ID: " + teacherId +
                        "\n\n" +
                        "This will permanently remove the teacher's login account.\n" +
                        "Existing uploaded materials will remain available."
                    );

                if (!confirmation) {
                    return;
                }

                try {

                    deleteButton.disabled = true;

                    deleteButton.textContent =
                        "Deleting...";

                    const response =
                        await fetch(
                            "http://127.0.0.1:8000/teachers/" +
                            encodeURIComponent(teacherId),
                            {
                                method: "DELETE"
                            }
                        );

                    const data =
                        await response.json();

                    if (
                        !response.ok ||
                        data.status !== "success"
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to delete teacher."
                        );

                    }

                    alert(
                        "Teacher account deleted successfully! ✅"
                    );

                    /* Refresh teacher cards */

                    await loadRegisteredTeachers();

                    /* Refresh dashboard statistics */

                    await loadDashboardStats();

                }

                catch (error) {

                    console.error(
                        "Delete teacher error:",
                        error
                    );

                    alert(
                        "Unable to delete teacher.\n\n" +
                        error.message
                    );

                    deleteButton.disabled = false;

                    deleteButton.textContent =
                        "🗑️ Delete Teacher";

                }

            }
        );

    }



    /* ================= INITIAL TEACHER LOAD ================= */

    loadRegisteredTeachers();

 /* ================= INITIAL DASHBOARD STATS ================= */

    loadDashboardStats();

    /* ================= MOBILE MENU ================= */

    if (mobileMenuBtn) {

        mobileMenuBtn.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle("open");

            }
        );

    }



    /* ================= LOGOUT ================= */

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function () {

                const confirmation =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (confirmation) {
            sessionStorage.clear();

                    window.location.href =
                       "../login/login.html";

                }

            }
        );

    }

    // ============================================================
// SUBJECT SEARCH FROM MONGODB
// ============================================================

const subjectSearch =
    document.getElementById("subjectSearch");

const subjectHidden =
    document.getElementById("subject");

const subjectSuggestions =
    document.getElementById("subjectSuggestions");

let subjectSearchTimer = null;


if (subjectSearch) {

    subjectSearch.addEventListener(
        "input",
        function () {

            const searchText =
                subjectSearch.value.trim();

            subjectHidden.value = "";

            clearTimeout(
                subjectSearchTimer
            );


            if (!searchText) {

                subjectSuggestions.innerHTML = "";

                subjectSuggestions.style.display =
                    "none";

                return;
            }


            subjectSearchTimer =
                setTimeout(
                    () => searchSubjects(searchText),
                    250
                );

        }
    );

}


async function searchSubjects(searchText) {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/subjects?search=" +
                encodeURIComponent(searchText)
            );


        const data =
            await response.json();


        if (data.status !== "success") {

            throw new Error(
                data.message ||
                "Unable to load subjects."
            );

        }


        displaySubjectSuggestions(
            data.subjects
        );

    }

    catch (error) {

        console.error(
            "Subject search error:",
            error
        );


        subjectSuggestions.innerHTML = `
            <div class="subject-no-results">
                Unable to load subjects.
            </div>
        `;

        subjectSuggestions.style.display =
            "block";

    }

}


function displaySubjectSuggestions(subjects) {

    if (
        !subjects ||
        subjects.length === 0
    ) {

        subjectSuggestions.innerHTML = `
            <div class="subject-no-results">
                No matching subjects found.
            </div>
        `;

        subjectSuggestions.style.display =
            "block";

        return;
    }


    subjectSuggestions.innerHTML =
        subjects
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


    subjectSuggestions.style.display =
        "block";

}


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
                suggestion.getAttribute(
                    "data-name"
                );


            subjectSearch.value =
                subjectName;


            subjectHidden.value =
                subjectName;


            const subjectSemester =
                suggestion.getAttribute(
                    "data-semester"
                );


            const semesterSelect =
                document.getElementById(
                    "semester"
                );


            if (
                semesterSelect &&
                subjectSemester
            ) {

                const semesterNumber =
                    parseInt(
                        subjectSemester
                    );


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
                    semesterLabels[
                        semesterNumber
                    ] || "";

            }


            subjectSuggestions.innerHTML =
                "";

            subjectSuggestions.style.display =
                "none";

        }
    );

}

});

// here
