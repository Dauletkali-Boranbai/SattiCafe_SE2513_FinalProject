# Satti Cafe Website

Multi-page responsive website for **Satti Cafe** (summer terrace and BOZA brewery) in Astana.
Course: WEB Technologies 1 (Front End), group SE-2513, Astana IT University, 2026.

## Team

* Batyrbek Adilkhan - Home, Team
* Alibek Kantarbay - Contact, Menu
* Dauletkali Boranbay - About Us, Gallery, Profile (authentication)

## Pages (7)

`index.html`, `menu.html`, `about.html`, `gallery.html`, `contact.html`, `team.html`, `profile.html`

## Technologies

HTML5, CSS3, Bootstrap 5.3, vanilla JavaScript (ES6), jQuery 4, localStorage, fetch()

## Features

* Responsive layout (Bootstrap grid, Flexbox, CSS Grid, media queries)
* Light / dark mode toggle saved in localStorage
* Authentication simulation: Sign Up (About page) and Log In / Profile / Log Out (Profile page)
* JavaScript form validation (no HTML validation attributes, `novalidate`): email, password length and complexity, required fields, phone pattern
* Search and filters: menu filters + live search with autocomplete, FAQ search, recipe search (last search saved)
* External API: TheMealDB (recipe search / random dish) with loading state and error handling; reservation form sent with fetch()
* Animations: hover effects, keyframes, scroll progress bar, counters, toasts, sounds

## Structure

```
index.html  menu.html  about.html  gallery.html  contact.html  team.html  profile.html
css/style.css
js/   (one script per feature, shared helpers in script.js)
images/  sounds/  data/more-dishes.json
```

## How to open

Run a local server (fetch does not work from file://), e.g. `python -m http.server`, and open `http://localhost:8000`.
