const form =
    document.getElementById("teacherLoginForm");

const password =
    document.getElementById("teacherPassword");

const togglePassword =
    document.getElementById("togglePassword");

const message =
    document.getElementById("loginMessage");


togglePassword.addEventListener(
    "click",
    function () {

        if (password.type === "password") {

            password.type = "text";

            togglePassword.textContent = "🙈";

        } else {

            password.type = "password";

            togglePassword.textContent = "👁";

        }

    }
);


form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const teacherId =
            document.getElementById("teacherId").value.trim();

        const teacherPassword =
            password.value.trim();


        if (
            teacherId === "" ||
            teacherPassword === ""
        ) {

            message.textContent =
                "Please enter your Teacher ID and password.";

            return;

        }


        message.textContent =
            "Login successful! Redirecting...";

setTimeout(function () {

    window.location.href =
        "teacher-dashboard.html";

}, 700);
    }
);