const form =
    document.getElementById("adminLoginForm");

const password =
    document.getElementById("adminPassword");

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

        const adminId =
            document.getElementById("adminId").value.trim();

        const adminPassword =
            password.value.trim();


        if (
            adminId === "" ||
            adminPassword === ""
        ) {

            message.textContent =
                "Please enter your ID and password.";

            return;

        }


        /*
            FRONTEND DEMO ONLY

            Real authentication will be
            connected to the backend later.
        */

        message.textContent =
            "Login successful! Redirecting...";

setTimeout(function () {

    window.location.href =
        "admin-dashboard.html";

}, 700);
    }
);