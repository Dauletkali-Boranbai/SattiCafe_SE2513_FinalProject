const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const timeBtn = document.getElementById("timeBtn");
const timeResult = document.getElementById("timeResult");

const OPEN_HOUR = 10;  
const CLOSE_HOUR = 24;  

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
        const phonePattern = /^\+?[0-9\s\-()]{7,18}$/;

        if (name === "" || phone === "" || visitTime === "") {
            showStatus("Please fill in all required fields (Name, Phone, Time).", "error");
            SattiUI.toast("Please fill in all required fields.", "error");
            playSound("error");
            return;
        }

        if (!phonePattern.test(phone)) {
            showStatus("Please enter a valid phone number.", "error");
            SattiUI.toast("Invalid phone number format.", "error");
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