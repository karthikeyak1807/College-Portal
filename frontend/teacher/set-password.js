const API_BASE_URL = "";

const passwordForm = document.getElementById("passwordForm");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const setPasswordBtn = document.getElementById("setPasswordBtn");
const message = document.getElementById("message");
const loading = document.getElementById("loading");


// ------------------------------------
// Get invitation details from URL
// ------------------------------------

const urlParams = new URLSearchParams(window.location.search);

const token = urlParams.get("token");
const teacherId = urlParams.get("teacher_id");


// ------------------------------------
// Show message
// ------------------------------------

function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = "block";
}


// ------------------------------------
// Check invitation link
// ------------------------------------

if (!token || !teacherId) {

    showMessage(
        "This password setup link is missing or invalid. Please contact the HOD.",
        "error"
    );

    setPasswordBtn.disabled = true;
}


// ------------------------------------
// Submit password
// ------------------------------------

passwordForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!token || !teacherId) {

        showMessage(
            "Invalid password setup link.",
            "error"
        );

        return;
    }


    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();


    // --------------------------------
    // Frontend validation
    // --------------------------------

    if (password.length < 8) {

        showMessage(
            "Password must contain at least 8 characters.",
            "error"
        );

        return;
    }


    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match.",
            "error"
        );

        return;
    }


    // --------------------------------
    // Disable button
    // --------------------------------

    setPasswordBtn.disabled = true;

    loading.style.display = "block";
    message.style.display = "none";


    try {

        const formData = new URLSearchParams();

        formData.append("teacher_id", teacherId);
        formData.append("token", token);
        formData.append("password", password);
        formData.append("confirm_password", confirmPassword);


        const response = await fetch(
            `${API_BASE_URL}/teachers/set-password`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: formData
            }
        );


        const data = await response.json();


        // --------------------------------
        // Backend error
        // --------------------------------

        if (!response.ok) {

            let errorMessage =
                "Unable to set password.";

            if (data.detail) {

                if (typeof data.detail === "string") {

                    errorMessage = data.detail;

                } else if (Array.isArray(data.detail)) {

                    errorMessage = data.detail
                        .map(error => error.msg)
                        .join(", ");
                }
            }

            showMessage(
                errorMessage,
                "error"
            );

            setPasswordBtn.disabled = false;

            return;
        }


        // --------------------------------
        // Backend success
        // --------------------------------

        showMessage(
            "Password created successfully! Redirecting to login...",
            "success"
        );


        passwordForm.reset();

        setPasswordBtn.disabled = true;


        // --------------------------------
        // Redirect to login
        // --------------------------------

        setTimeout(() => {

            window.location.href =
                "../login/login.html";

        }, 2500);


    } catch (error) {

        console.error(
            "Password setup error:",
            error
        );

        showMessage(
            "Could not connect to the server. Please try again.",
            "error"
        );

        setPasswordBtn.disabled = false;

    } finally {

        loading.style.display = "none";
    }

});