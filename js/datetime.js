// Home page: shows the current date and time and updates it every second.
function updateDateTime() {
    const dateTimeElement = document.getElementById("dateTime");

    if (dateTimeElement) {
        const now = new Date();

        dateTimeElement.textContent = now.toLocaleString();
    }
}

updateDateTime();
setInterval(updateDateTime, 1000);