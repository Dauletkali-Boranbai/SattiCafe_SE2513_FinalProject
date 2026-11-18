subscribeForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const subName = document.getElementById("subscribeName").value.trim();
    const subEmail = document.getElementById("subscribeEmail").value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    subscribeMessage.textContent = "";

    if (subName === "" || subEmail === "") {
        subscribeMessage.style.color = "red";
        subscribeMessage.textContent = "Please fill in all fields.";
        SattiUI.toast("Please fill in all fields", "error");
        return;
    }

    if (!emailPattern.test(subEmail)) {
        subscribeMessage.style.color = "red";
        subscribeMessage.textContent = "Please enter a valid email address.";
        SattiUI.toast("Invalid email address", "error");
        return;
    }

    SattiUI.fakeRequest($(subscribeForm).find("button[type=submit]"), 1500, function () {
        subscribeMessage.style.color = "green";
        subscribeMessage.textContent = "Thank you for subscribing!";
        playSound("success");
        SattiUI.toast("Subscribed successfully. Thank you!", "success");
        subscribeForm.reset();
    });
});