// Keyboard navigation in the header: arrow keys, Home and End move focus between links.
const navMenu = document.querySelector(".nav-menu");

function getNavItems() {
    return Array.from(navMenu.querySelectorAll("a, button"));
}

function focusNavItem(items, index) {
    const safeIndex = (index + items.length) % items.length;
    items[safeIndex].focus();
}

if (navMenu) {
    navMenu.addEventListener("keydown", function (event) {
        const items = getNavItems();
        const current = items.indexOf(document.activeElement);

        if (current === -1) {
            return;
        }

        switch (event.key) {
            case "ArrowRight":
            case "ArrowDown":
                event.preventDefault();
                focusNavItem(items, current + 1);
                break;
            case "ArrowLeft":
            case "ArrowUp":
                event.preventDefault();
                focusNavItem(items, current - 1);
                break;
            case "Home":
                event.preventDefault();
                focusNavItem(items, 0);
                break;
            case "End":
                event.preventDefault();
                focusNavItem(items, items.length - 1);
                break;
            default:
                break; 
        }
    });
}
