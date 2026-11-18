// Menu page: filters, live search, order list and "Load more" (fetch from JSON).
// menuManager keeps the data + current filter/search; render() redraws the table.
const menuBody = document.getElementById("menuBody");
const filterButtons = document.querySelectorAll(".filter-btn");
const menuSearch = document.getElementById("menuSearch");
const menuCount = document.getElementById("menuCount");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const loadMessage = document.getElementById("loadMessage");
const orderList = document.getElementById("orderList");
const orderTotal = document.getElementById("orderTotal");
const clearOrderBtn = document.getElementById("clearOrderBtn");

function formatPrice(price) {
    return price + " ₸";
}

function matchesFilter(item, filter) {
    switch (filter) {
        case "food":
            return item.type === "food";
        case "drinks":
            return item.type === "drink";
        case "cheap":
            return item.price < 3000;
        case "national":
            return item.category === "National Drink";
        case "all":
        default:
            return true;
    }
}

function matchesSearch(item, text) {
    const haystack = (item.name + " " + item.description + " " + item.category).toLowerCase();
    return haystack.includes(text.toLowerCase());
}

const menuManager = {
    items: menuItems.slice(),  
    activeFilter: "all",
    searchText: "",
    firstNewIndex: -1,      
    getVisibleItems() {
        return this.items
            .filter(item => matchesFilter(item, this.activeFilter))
            .filter(item => matchesSearch(item, this.searchText));
    },

    addItems(newItems) {
        this.firstNewIndex = this.items.length;
        this.items = this.items.concat(newItems);
    },

    render() {
        const visible = this.getVisibleItems();
        menuBody.innerHTML = "";

        if (visible.length === 0) {
            menuBody.innerHTML = '<tr><td colspan="5" class="empty-row"><em>Nothing found. Try another filter.</em></td></tr>';
        }

        for (let i = 0; i < visible.length; i++) {
            const item = visible[i];
            const row = document.createElement("tr");

            if (this.firstNewIndex !== -1 && this.items.indexOf(item) >= this.firstNewIndex) {
                row.classList.add("new-row");
            }

            [item.name, item.description, item.category, formatPrice(item.price)].forEach(function (text) {
                const cell = document.createElement("td");
                cell.textContent = text;
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            const addButton = document.createElement("button");
            addButton.type = "button";
            addButton.className = "btn-add";
            addButton.textContent = "Add";
            addButton.setAttribute("aria-label", "Add " + item.name + " to order");
            addButton.addEventListener("click", function () {
                order.add(item);
                playSound("add");
                SattiUI.toast(item.name + " added to your order", "success");
                addButton.classList.remove("pulse");
                void addButton.offsetWidth;
                addButton.classList.add("pulse");
            });
            actionCell.appendChild(addButton);
            row.appendChild(actionCell);

            menuBody.appendChild(row);
        }

        menuCount.textContent = "Showing " + visible.length + " of " + this.items.length + " items";

        $("#menuBody td:nth-child(-n+3)").highlight(this.searchText);
    }
};

const order = {
    lines: [],

    add(item) {
        const existing = this.lines.find(line => line.name === item.name);
        if (existing) {
            existing.qty += 1;
        } else {
            this.lines.push({ name: item.name, price: item.price, qty: 1 });
        }
        this.render();
    },

    remove(name) {
        this.lines = this.lines.filter(line => line.name !== name);
        this.render();
    },

    clear() {
        this.lines = [];
        this.render();
    },

    getTotal() {
        return this.lines.reduce((sum, line) => sum + line.price * line.qty, 0);
    },

    render() {
        orderList.innerHTML = "";

        if (this.lines.length === 0) {
            orderList.innerHTML = "<li class=\"order-empty\">Your order is empty. Press \"Add\" next to any item.</li>";
        }

        this.lines.forEach(line => {
            const li = document.createElement("li");
            li.className = "order-line";

            const label = document.createElement("span");
            label.textContent = line.name + " × " + line.qty + " — " + formatPrice(line.price * line.qty);

            const removeBtn = document.createElement("button");
            removeBtn.type = "button";
            removeBtn.className = "btn-remove";
            removeBtn.textContent = "×";
            removeBtn.setAttribute("aria-label", "Remove " + line.name);
            removeBtn.addEventListener("click", () => {
                this.remove(line.name);
                playSound("click");
                SattiUI.toast(line.name + " removed from your order", "info");
            });

            li.appendChild(label);
            li.appendChild(removeBtn);
            orderList.appendChild(li);
        });

        orderTotal.textContent = "Total: " + formatPrice(this.getTotal());
    }
};


filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        menuManager.activeFilter = button.dataset.filter;
        menuManager.firstNewIndex = -1;
        menuManager.render();
        playSound("click");
    });
});

document.addEventListener("keydown", function (event) {
    const typing = document.activeElement === menuSearch;

    switch (event.key) {
        case "/":
            if (!typing) {
                event.preventDefault();
                menuSearch.focus();
            }
            break;
        case "Escape":
            if (typing || menuSearch.value !== "") {
                menuSearch.value = "";
                $("#suggestList").hide();
                menuManager.searchText = "";
                menuManager.render();
                menuSearch.blur();
            }
            break;
        default:
            break;
    }
});

loadMoreBtn.addEventListener("click", function () {
    loadMoreBtn.disabled = true;
    loadMessage.textContent = "Loading...";
    playSound("click");

    fetch("data/more-dishes.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Server answered " + response.status);
            }
            return response.json();
        })
        .then(function (newItems) {
            menuManager.addItems(newItems);
            menuManager.render();
            loadMessage.textContent = newItems.length + " new items were added to the menu!";
            loadMoreBtn.textContent = "All items loaded";
            playSound("success");
            SattiUI.toast(newItems.length + " new dishes were added to the menu", "success");
        })
        .catch(function (error) {
            SattiUI.toast("Could not load more dishes", "error");
            loadMessage.textContent = "Could not load more items (" + error.message + "). Please try again.";
            loadMoreBtn.disabled = false;
            playSound("error");
        });
});

clearOrderBtn.addEventListener("click", function () {
    order.clear();
    playSound("click");
    SattiUI.toast("Your order was cleared", "info");
});

menuManager.render();
order.render();
