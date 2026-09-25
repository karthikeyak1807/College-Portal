const form =
    document.getElementById("studentLoginForm");

const password =
    document.getElementById("studentPassword");

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

        const studentId =
            document.getElementById("studentId").value.trim();

        const studentPassword =
            password.value.trim();


        if (
            studentId === "" ||
            studentPassword === ""
        ) {

            message.textContent =
                "Please enter your Registration ID and password.";

            return;

        }


        message.textContent =
            "Login successful! Redirecting...";

        setTimeout(function () {

    window.location.href =
        "student-dashboard.html";

}, 700);

    }
);