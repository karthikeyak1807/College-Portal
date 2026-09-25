const form = document.getElementById("loginForm");

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const loginMessage =
    document.getElementById("loginMessage");

const forgotPassword =
    document.getElementById("forgotPassword");


// ==============================
// SHOW / HIDE PASSWORD
// ==============================

togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.textContent = "🙈";

    } else {

        passwordInput.type = "password";

        togglePassword.textContent = "👁";
    }

});


// ==============================
// LOGIN
// ==============================

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const userId =
        document.getElementById("userId").value.trim();

    const password =
        passwordInput.value;


    if (userId === "" || password === "") {

        loginMessage.textContent =
            "Please enter your ID and password.";

        return;
    }


    loginMessage.textContent =
        "Logging in...";


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/login",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body:
                    new URLSearchParams({
                        user_id: userId,
                        password: password
                    })
            }
        );


        const data = await response.json();


        // ==============================
        // LOGIN FAILED
        // ==============================

        if (data.status === "error") {

            loginMessage.textContent =
                data.message;

            return;
        }


        // ==============================
        // STUDENT WAITING FOR APPROVAL
        // ==============================

        if (data.status === "pending") {

            loginMessage.textContent =
                data.message;

            return;
        }


        // ==============================
        // LOGIN SUCCESSFUL
        // ==============================

        if (data.status === "success") {

            loginMessage.textContent =
                "Login successful! Redirecting...";


            // Save logged-in user information
            sessionStorage.setItem(
                "userId",
                data.user_id
            );

            sessionStorage.setItem(
                "userName",
                data.name
            );

            sessionStorage.setItem(
                "userRole",
                data.role
            );


            setTimeout(function () {

                if (data.role === "admin") {

                    window.location.href =
                        "../admin/admin-dashboard.html";

                }

                else if (data.role === "teacher") {

                    window.location.href =
                        "../teacher/teacher-dashboard.html";

                }

                else if (data.role === "student") {

                    window.location.href =
                        "../student/student-dashboard.html";
                }

            }, 700);

        }

    }

    catch (error) {

        console.error(
            "Login error:",
            error
        );

        loginMessage.textContent =
            "Unable to connect to the server. Make sure FastAPI is running.";
    }

});


// ==============================
// FORGOT PASSWORD
// ==============================

forgotPassword.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        loginMessage.textContent =
            "Please contact the HOD/Admin to reset your password.";

    }
);