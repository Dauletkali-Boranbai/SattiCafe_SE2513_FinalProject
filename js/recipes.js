// "Chef's Inspiration" on menu.html – external API integration with TheMealDB.
// Free public API, no key needed: https://www.themealdb.com/api.php
const MEAL_API = "https://www.themealdb.com/api/json/v1/1/";

const recipeForm = document.getElementById("recipeForm");
const recipeSearch = document.getElementById("recipeSearch");
const recipeError = document.getElementById("recipeError");
const recipeStatus = document.getElementById("recipeStatus");
const recipeResults = document.getElementById("recipeResults");
const randomRecipeBtn = document.getElementById("randomRecipeBtn");
const recipeSearchBtn = document.getElementById("recipeSearchBtn");

// Load meals from the API; shows a loading state and handles errors
async function loadMeals(endpoint) {
    recipeStatus.style.color = "";
    recipeStatus.textContent = "Loading recipes...";
    recipeResults.innerHTML = "";
    SattiUI.setLoading($(recipeSearchBtn), true);
    randomRecipeBtn.disabled = true;

    try {
        const response = await fetch(MEAL_API + endpoint);
        if (!response.ok) {
            throw new Error("Server answered " + response.status);
        }
        const data = await response.json();

        if (!data.meals) {
            recipeStatus.textContent = "No recipes found. Try another word, for example \"chicken\".";
            return;
        }

        const meals = data.meals.slice(0, 6);
        meals.forEach(function (meal) {
            recipeResults.appendChild(createMealCard(meal));
        });
        recipeStatus.textContent = "Showing " + meals.length + " of " + data.meals.length + " recipes";
    } catch (error) {
        recipeStatus.style.color = "red";
        recipeStatus.textContent = "Sorry, recipes could not be loaded (" + error.message + "). Please try again later.";
        SattiUI.toast("Could not load recipes", "error");
    } finally {
        SattiUI.setLoading($(recipeSearchBtn), false);
        randomRecipeBtn.disabled = false;
    }
}

// Build one card; textContent is used so API text cannot inject HTML
function createMealCard(meal) {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-4";

    const card = document.createElement("article");
    card.className = "recipe-card";

    const img = document.createElement("img");
    img.src = meal.strMealThumb + "/medium";
    img.alt = meal.strMeal;
    img.loading = "lazy";

    const body = document.createElement("div");
    body.className = "recipe-card-body";

    const title = document.createElement("h3");
    title.textContent = meal.strMeal;
    body.appendChild(title);

    [meal.strCategory, meal.strArea].forEach(function (tag) {
        if (tag) {
            const span = document.createElement("span");
            span.className = "recipe-tag";
            span.textContent = tag;
            body.appendChild(span);
        }
    });

    const link = document.createElement("a");
    link.href = "https://www.themealdb.com/meal/" + meal.idMeal;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "View recipe →";
    body.appendChild(link);

    card.appendChild(img);
    card.appendChild(body);
    col.appendChild(card);
    return col;
}

if (recipeForm) {
    // Restore the last search from localStorage
    const lastSearch = localStorage.getItem("sattiRecipeSearch") || "";
    recipeSearch.value = lastSearch;

    recipeForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const query = recipeSearch.value.trim();
        recipeError.textContent = "";

        if (query === "") {
            recipeError.textContent = "Please enter a dish or ingredient.";
            return;
        }
        if (!/^[A-Za-z\s-]{2,30}$/.test(query)) {
            recipeError.textContent = "Use 2–30 English letters (the API works in English).";
            return;
        }

        localStorage.setItem("sattiRecipeSearch", query);
        loadMeals("search.php?s=" + encodeURIComponent(query));
    });

    randomRecipeBtn.addEventListener("click", function () {
        recipeError.textContent = "";
        loadMeals("random.php");
    });
}
