// Authentication simulation for profile.html (Log In / Profile / Log Out).
// Users are created on the About page (validation.js) and stored in localStorage:
//   sattiUsers       – array of {name, email, password}
//   sattiCurrentUser – the user who is logged in now
const loginForm = document.getElementById("loginForm");
const loginCard = document.getElementById("loginCard");
const profileCard = document.getElementById("profileCard");
const logoutBtn = document.getElementById("logoutBtn");

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        return fallback;
    }
}

// Show the profile card with stored details, or the login form if nobody is logged in
function renderProfile() {
    const currentUser = readStorage("sattiCurrentUser", null);

    if (currentUser) {
        document.getElementById("profileNameDisplay").textContent = currentUser.name;
        document.getElementById("profileEmailDisplay").textContent = currentUser.email;
        loginCard.classList.add("d-none");
        profileCard.classList.remove("d-none");
    } else {
        profileCard.classList.add("d-none");
        loginCard.classList.remove("d-none");
    }
}

if (loginForm) {
    renderProfile();

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const emailError = document.getElementById("loginEmailError");
        const passwordError = document.getElementById("loginPasswordError");
        const loginMessage = document.getElementById("loginMessage");
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        emailError.textContent = "";
        passwordError.textContent = "";
        loginMessage.textContent = "";

        let isValid = true;

        if (email === "") {
            emailError.textContent = "Please enter your email.";
            isValid = false;
        } else if (!emailPattern.test(email)) {
            emailError.textContent = "Please enter a valid email.";
            isValid = false;
        }

        if (password === "") {
            passwordError.textContent = "Please enter your password.";
            isValid = false;
        }

        if (!isValid) {
            loginMessage.style.color = "red";
            loginMessage.textContent = "Please correct the errors above.";
            SattiUI.toast("Please correct the errors in the form", "error");
            return;
        }

        SattiUI.fakeRequest($("#loginBtn"), 1000, function () {
            const users = readStorage("sattiUsers", []);
            const user = users.find(function (u) {
                return u.email.toLowerCase() === email.toLowerCase() && u.password === password;
            });

            if (!user) {
                loginMessage.style.color = "red";
                loginMessage.textContent = "Wrong email or password. Don't have an account? Register on the About page.";
                SattiUI.toast("Wrong email or password", "error");
                return;
            }

            localStorage.setItem("sattiCurrentUser", JSON.stringify(user));
            loginForm.reset();
            SattiUI.toast("Welcome back, " + user.name + "!", "success");
            renderProfile();
        });
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("sattiCurrentUser");
        SattiUI.toast("You have logged out", "info");
        renderProfile();
    });
}
