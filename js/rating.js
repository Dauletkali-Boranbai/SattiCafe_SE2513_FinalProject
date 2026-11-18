const stars = document.querySelectorAll(".star");
const ratingMessage = document.getElementById("ratingMessage");

const ratingMessages = {
    1: "We are sorry! Tell us how we can improve.",
    2: "Thank you. We will try to do better.",
    3: "Good! We hope to see you again.",
    4: "Great! Thank you for the kind rating.",
    5: "Awesome! You made our day!"
};

function paintStars(value, className) {
    stars.forEach(function (star) {
        const starValue = Number(star.dataset.value);
        star.classList.toggle(className, starValue <= value);
    });
}

function setRating(value) {
    paintStars(value, "selected");

    stars.forEach(function (star) {
        star.setAttribute("aria-pressed", String(Number(star.dataset.value) === value));
    });

    ratingMessage.textContent = "You rated us " + value + " / 5. " + ratingMessages[value];

    try {
        localStorage.setItem("sattiRating", String(value));
    } catch (error) {
    }
}

if (stars.length > 0) {
    stars.forEach(function (star) {
        const value = Number(star.dataset.value);

        star.addEventListener("click", function () {
            setRating(value);
            playSound("star");
            SattiUI.toast("Thank you! You rated us " + value + " / 5", "success");

            star.classList.remove("pop");
            void star.offsetWidth;
            star.classList.add("pop");
        });

        star.addEventListener("mouseenter", function () {
            paintStars(value, "hover");
        });
        star.addEventListener("mouseleave", function () {
            paintStars(0, "hover");
        });
    });

    let saved = 0;
    try {
        saved = Number(localStorage.getItem("sattiRating")) || 0;
    } catch (error) {
        saved = 0;
    }
    if (saved >= 1 && saved <= 5) {
        setRating(saved);
    }
}
