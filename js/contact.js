const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const timeBtn = document.getElementById("timeBtn");
const timeResult = document.getElementById("timeResult");

const OPEN_HOUR = 10;  
const CLOSE_HOUR = 24;  


// Phone: optional "+", digits, spaces, dashes and brackets; 10-15 digits in total
const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;

function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return PHONE_PATTERN.test(phone) && digits.length >= 10 && digits.length <= 15;
}

// Show / clear an error message under a form field (field id + "Error")
function setFieldError(fieldId, message) {
    const box = document.getElementById(fieldId + "Error");
    if (box) {
        box.textContent = message;
    }
}

function clearFieldErrors() {
    ["name", "phone", "visit-time"].forEach(function (id) {
        setFieldError(id, "");
    });
}

function showStatus(text, type) {
    formStatus.textContent = text;
    formStatus.className = "form-status " + type;
}

function sendReservation(data, onSuccess, onError) {
    fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Server answered " + response.status);
            }
            return response.json();
        })
        .then(onSuccess)
        .catch(onError);
}

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const visitTime = document.getElementById("visit-time").value.trim();

        // Clear old errors, then validate every field and show a message under it
        clearFieldErrors();
        let isValid = true;

        if (name === "") {
            setFieldError("name", "Please enter your name.");
            isValid = false;
        } else if (name.length < 2) {
            setFieldError("name", "Name must contain at least 2 characters.");
            isValid = false;
        }

        if (phone === "") {
            setFieldError("phone", "Please enter your phone number.");
            isValid = false;
        } else if (!isValidPhone(phone)) {
            setFieldError("phone", "Enter a valid phone, e.g. +7 777 123 45 67 (10-15 digits).");
            isValid = false;
        }

        if (visitTime === "") {
            setFieldError("visit-time", "Please write your preferred time, e.g. today 19:00.");
            isValid = false;
        }

        if (!isValid) {
            showStatus("Please correct the errors above.", "error");
            SattiUI.toast("Please correct the errors in the form", "error");
            playSound("error");
            return;
        }

        const data = Object.fromEntries(new FormData(contactForm).entries());

        SattiUI.setLoading($(submitBtn), true);   
        showStatus("Sending your request...", "info");

        sendReservation(
            data,
            function onSuccess(result) {
                showStatus(
                    "Thank you, " + data.name + "! Your request for " + data["visit-time"] +
                    " was sent (request #" + result.id + "). We will call you soon.",
                    "success"
                );
                contactForm.reset();
                playSound("success");
                SattiUI.setLoading($(submitBtn), false);
                SattiUI.toast("Form submitted successfully! We will call you soon.", "success");
            },
            function onError(error) {
                showStatus("Sorry, the request failed (" + error.message + "). Please try again.", "error");
                playSound("error");
                SattiUI.setLoading($(submitBtn), false);
                SattiUI.toast("The request failed. Please try again.", "error");
            }
        );
    });

    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            contactForm.querySelectorAll("input, textarea").forEach(function (field) {
                field.value = "";
            });
            clearFieldErrors();
            showStatus("The form was cleared.", "info");
            SattiUI.toast("The form was cleared", "info");
            playSound("click");
        });
    }
}

if (timeBtn) {
    timeBtn.addEventListener("click", function () {
        const now = new Date();
        const yourTime = now.toLocaleTimeString();

        const astanaHour = Number(
            new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Almaty" }).format(now)
        );
        const astanaTime = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Almaty" });
        const isOpen = astanaHour >= OPEN_HOUR && astanaHour < CLOSE_HOUR;

        timeResult.textContent =
            "Your time: " + yourTime + " | Astana time: " + astanaTime + " — " +
            (isOpen ? "we are open now!" : "we are closed now (open 10:00–24:00).");
        timeResult.className = "time-result " + (isOpen ? "open" : "closed");
        playSound("click");
    });
}