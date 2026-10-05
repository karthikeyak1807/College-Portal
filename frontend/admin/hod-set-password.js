const API_BASE_URL = "";

const passwordForm = document.getElementById("passwordForm");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const passwordToggle =
    document.getElementById("passwordToggle");

const confirmPasswordToggle =
    document.getElementById("confirmPasswordToggle");

const setPasswordBtn =
    document.getElementById("setPasswordBtn");

const message =
    document.getElementById("message");

const loading =
    document.getElementById("loading");


// ------------------------------------
// Password visibility toggle
// ------------------------------------

function setupPasswordToggle(input, button) {

    button.addEventListener("click", function () {

        if (input.type === "password") {

            input.type = "text";

            button.textContent = "🙈";

            button.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            input.type = "password";

            button.textContent = "👁";

            button.setAttribute(
                "aria-label",
                "Show password"
            );
        }

    });

}


setupPasswordToggle(
    passwordInput,
    passwordToggle
);

setupPasswordToggle(
    confirmPasswordInput,
    confirmPasswordToggle
);


// ------------------------------------
// Show message
// ------------------------------------

function showMessage(text, type) {

    message.textContent = text;

    message.className =
        `message ${type}`;

    message.style.display = "block";
}


// ------------------------------------
// Get invitation details from URL
// ------------------------------------

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const token =
    urlParams.get("token");

const hodId =
    urlParams.get("hod_id");


// ------------------------------------
// Check invitation link
// ------------------------------------

if (!token || !hodId) {

    showMessage(
        "This password setup link is missing or invalid. Please contact the Primary HOD.",
        "error"
    );

    setPasswordBtn.disabled = true;
}


// ------------------------------------
// Submit password
// ------------------------------------

passwordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!token || !hodId) {

            showMessage(
                "Invalid password setup link.",
                "error"
            );

            return;
        }


        const password =
            passwordInput.value.trim();

        const confirmPassword =
            confirmPasswordInput.value.trim();


        // --------------------------------
        // Frontend validation
        // --------------------------------

        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
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

            // --------------------------------
            // Create form data
            // --------------------------------

            const formData =
                new URLSearchParams();

            formData.append(
                "hod_id",
                hodId
            );

            formData.append(
                "token",
                token
            );

            formData.append(
                "password",
                password
            );

            formData.append(
                "confirm_password",
                confirmPassword
            );


            // --------------------------------
            // Send to backend
            // --------------------------------

            const response =
                await fetch(
                    `${API_BASE_URL}/hods/set-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded"
                        },

                        body: formData
                    }
                );


            const data =
                await response.json();


            // --------------------------------
            // Backend error
            // --------------------------------

            if (!response.ok) {

                let errorMessage =
                    "Unable to set password.";

                if (data.detail) {

                    if (
                        typeof data.detail ===
                        "string"
                    ) {

                        errorMessage =
                            data.detail;

                    } else if (
                        Array.isArray(data.detail)
                    ) {

                        errorMessage =
                            data.detail
                                .map(
                                    error =>
                                        error.msg
                                )
                                .join(", ");
                    }
                }

                showMessage(
                    errorMessage,
                    "error"
                );

                setPasswordBtn.disabled =
                    false;

                return;
            }


            // --------------------------------
            // Handle API response
            // --------------------------------

            if (data.status !== "success") {

                showMessage(
                    data.message ||
                    "Unable to set password.",
                    "error"
                );

                setPasswordBtn.disabled =
                    false;

                return;
            }


            // --------------------------------
            // Success
            // --------------------------------

            showMessage(
                "Password created successfully! Redirecting to login...",
                "success"
            );


            passwordForm.reset();

            setPasswordBtn.disabled =
                true;


            // --------------------------------
            // Redirect to common login
            // --------------------------------

            setTimeout(() => {

                window.location.href =
                    "../login/login.html";

            }, 2500);


        } catch (error) {

            console.error(
                "HOD password setup error:",
                error
            );

            showMessage(
                "Could not connect to the server. Please try again.",
                "error"
            );

            setPasswordBtn.disabled =
                false;

        } finally {

            loading.style.display =
                "none";
        }

    }
);