const greetingText = document.getElementById("greetingText");
const greetingForm = document.getElementById("greetingForm");
const greetingName = document.getElementById("greetingName");

function getDayPart(hour) {
    if (hour >= 5 && hour < 12) {
        return "morning";
    }
    if (hour >= 12 && hour < 18) {
        return "afternoon";
    }
    if (hour >= 18 && hour < 23) {
        return "evening";
    }
    return "night";
}

function buildGreeting(dayPart, name) {
    const who = name ? ", " + name : "";

    switch (dayPart) {
        case "morning":
            return "Good morning" + who + "! Start your day with a fresh coffee.";
        case "afternoon":
            return "Good afternoon" + who + "! Time for a tasty lunch.";
        case "evening":
            return "Good evening" + who + "! Try our BOZA with dinner.";
        default:
            return "Hello" + who + "! We are open until midnight.";
    }
}

function showGreeting(name) {
    const dayPart = getDayPart(new Date().getHours());
    greetingText.textContent = buildGreeting(dayPart, name);

    greetingText.classList.remove("fade-in");
    void greetingText.offsetWidth; 
    greetingText.classList.add("fade-in");
}

if (greetingText && greetingForm) {
    let savedName = "";
    try {
        savedName = localStorage.getItem("sattiName") || "";
    } catch (error) {
        savedName = "";
    }

    greetingName.value = savedName;
    showGreeting(savedName);

    greetingForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = greetingName.value.trim();

        // JS validation instead of the HTML maxlength attribute
        if (name.length > 30) {
            SattiUI.toast("Name must be 30 characters or less.", "error");
            playSound("error");
            return;
        }

        try {
            localStorage.setItem("sattiName", name);
        } catch (error) {
        }

        showGreeting(name);
        playSound("success");
    });
}
