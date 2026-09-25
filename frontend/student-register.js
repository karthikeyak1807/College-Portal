document.addEventListener("DOMContentLoaded", function () {

    const registrationForm =
        document.getElementById("studentRegistrationForm");

    const registrationMessage =
        document.getElementById("registrationMessage");


    if (!registrationForm) {
        return;
    }


    registrationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* ================= GET FORM VALUES ================= */

            const studentId =
                document.getElementById("studentId")
                    .value
                    .trim();

            const studentName =
                document.getElementById("studentName")
                    .value
                    .trim();

            const studentEmail =
                document.getElementById("studentEmail")
                    .value
                    .trim();

            const department =
                document.getElementById("studentDepartment")
                    .value;

            const semester =
                document.getElementById("studentSemester")
                    .value;

            const password =
                document.getElementById("studentPassword")
                    .value;

            const confirmPassword =
                document.getElementById("studentConfirmPassword")
                    .value;


            /* ================= VALIDATION ================= */

            if (
                !studentId ||
                !studentName ||
                !studentEmail ||
                !department ||
                !semester ||
                !password ||
                !confirmPassword
            ) {

                registrationMessage.textContent =
                    "Please fill in all fields.";

                registrationMessage.style.color =
                    "#dc2626";

                return;

            }


            if (password !== confirmPassword) {

                registrationMessage.textContent =
                    "Passwords do not match.";

                registrationMessage.style.color =
                    "#dc2626";

                return;

            }

            const studentIdPattern = /^2[0-9]H71A[A-Za-z0-9]{4}$/;

if (!studentIdPattern.test(studentId)) {

    registrationMessage.textContent =
        "Invalid Student ID. It must contain exactly 10 characters and follow the format 2XH71AXXXX.";

    registrationMessage.style.color =
        "#dc2626";

    return;
}

            if (password.length < 6) {

                registrationMessage.textContent =
                    "Password must contain at least 6 characters.";

                registrationMessage.style.color =
                    "#dc2626";

                return;

            }


            /* ================= SHOW LOADING ================= */

            registrationMessage.textContent =
                "Submitting registration request...";

            registrationMessage.style.color =
                "#2563eb";


            /* ================= SEND TO BACKEND ================= */

            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:8000/students",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                user_id:
                                    studentId,

                                name:
                                    studentName,

                                email:
                                    studentEmail,

                                department:
                                    department,

                                semester:
                                    semester,

                                password:
                                    password

                            })

                        }
                    );


                const data =
                    await response.json();


                /* ================= BACKEND ERROR ================= */

                if (!response.ok) {

                    registrationMessage.textContent =
                        data.detail ||
                        data.message ||
                        "Registration failed.";

                    registrationMessage.style.color =
                        "#dc2626";

                    return;

                }


                /* ================= APPLICATION ERROR ================= */

                if (data.status === "error") {

                    registrationMessage.textContent =
                        data.message ||
                        "Registration failed.";

                    registrationMessage.style.color =
                        "#dc2626";

                    return;

                }


                /* ================= SUCCESS ================= */

                registrationMessage.textContent =
                    "Registration submitted successfully! Your account is waiting for HOD approval.";

                registrationMessage.style.color =
                    "#16a34a";


                alert(
                    "Registration submitted successfully! 🎉\n\n" +
                    "Registration ID: " +
                    studentId +
                    "\n\n" +
                    "Your account is now waiting for HOD approval."
                );


                /* Clear form */

                registrationForm.reset();

            }

            catch (error) {

                console.error(
                    "Student registration error:",
                    error
                );


                registrationMessage.textContent =
                    "Unable to connect to the server. Please make sure the backend is running.";

                registrationMessage.style.color =
                    "#dc2626";

            }

        }
    );

});