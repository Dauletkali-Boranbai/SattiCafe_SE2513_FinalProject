
var SattiUI = (function ($) {

    var ICONS = { success: "✔", error: "✖", info: "ℹ" };
    var MAX_TOASTS = 4;

    function getToastBox() {
        var $box = $("#toastBox");
        if ($box.length === 0) {
            $box = $('<div id="toastBox" aria-live="polite"></div>').appendTo("body");
        }
        return $box;
    }

    function toast(message, type) {
        type = type || "success";
        var $box = getToastBox();

        $box.children().slice(0, Math.max(0, $box.children().length - MAX_TOASTS + 1)).remove();

        var $toast = $('<div class="toast-msg" role="status"></div>')
            .addClass("toast-" + type)
            .append('<span class="toast-icon">' + ICONS[type] + "</span>")
            .append($('<span class="toast-text"></span>').text(message))
            .append('<button type="button" class="toast-close" aria-label="Close">&times;</button>')
            .hide()
            .appendTo($box);

        $toast.fadeIn(250).delay(2800).fadeOut(500, function () {
            $(this).remove();
        });

        $toast.find(".toast-close").on("click", function () {
            $toast.stop(true, true).fadeOut(200, function () {
                $(this).remove();
            });
        });
        return $toast;
    }

    function setLoading($btn, isLoading) {
        if (isLoading) {
            if ($btn.data("origHtml") === undefined) {
                $btn.data("origHtml", $btn.html());
            }
            $btn.prop("disabled", true)                   
                .addClass("is-loading")
                .html('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Please wait…');
        } else {
            $btn.prop("disabled", false)
                .removeClass("is-loading")
                .html($btn.data("origHtml") !== undefined ? $btn.data("origHtml") : $btn.html());
            $btn.removeData("origHtml");
        }
    }

    function fakeRequest($btn, delay, done) {
        setLoading($btn, true);
        setTimeout(function () {
            setLoading($btn, false);
            if (typeof done === "function") {
                done();
            }
        }, delay || 1500);
    }

    function escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    $.fn.highlight = function (term) {
        return this.each(function () {
            var $el = $(this);
            if ($el.data("orig") === undefined) {
                $el.data("orig", $el.html());
            }
            var original = $el.data("orig");

            if (!term) {
                $el.html(original);
                return;
            }

            var regex = new RegExp("(" + escapeRegExp(term) + ")", "gi");
            var parts = original.split(/(<[^>]+>|&#?\w+;)/);
            var result = $.map(parts, function (part, i) {
                return i % 2 ? part : part.replace(regex, '<mark class="search-hit">$1</mark>');
            }).join("");
            $el.html(result);
        });
    };

    return { toast: toast, setLoading: setLoading, fakeRequest: fakeRequest };
})(jQuery);

$(document).ready(function () {
    console.log("jQuery is ready!");

    initScrollProgress();    
    initMenuSearch();        
    initFaqSearch();          
    initCounters();          
    initCopyButtons();        
    initLazyLoading();        
});

function initMenuSearch() {
    var $search = $("#menuSearch");
    if ($search.length === 0 || typeof menuManager === "undefined") {
        return;
    }

    var $wrap = $search.wrap('<div class="autocomplete-wrap"></div>').parent();
    var $list = $('<ul class="suggest-list" id="suggestList" role="listbox"></ul>').hide().appendTo($wrap);
    var activeIndex = -1;

    $search.attr({ autocomplete: "off", role: "combobox", "aria-controls": "suggestList", "aria-expanded": "false" });

    function applyFilter(text) {
        menuManager.searchText = String(text).trim();
        menuManager.firstNewIndex = -1;
        menuManager.render();
    }

    function hideSuggestions() {
        $list.hide().empty();
        activeIndex = -1;
        $search.attr("aria-expanded", "false");
    }

    function showSuggestions(text) {
        var query = String(text).trim().toLowerCase();
        if (query === "") {
            hideSuggestions();
            return;
        }

        var matches = $.grep(menuManager.items, function (item) {
            return item.name.toLowerCase().indexOf(query) > -1;
        });

        matches.sort(function (a, b) {
            var aStart = a.name.toLowerCase().indexOf(query) === 0 ? 0 : 1;
            var bStart = b.name.toLowerCase().indexOf(query) === 0 ? 0 : 1;
            return aStart - bStart || a.name.localeCompare(b.name);
        });
        matches = matches.slice(0, 6);

        $list.empty();
        if (matches.length === 0) {
            $list.append('<li class="suggest-empty">No dishes found</li>');
        }

        $.each(matches, function (i, item) {
            var $li = $('<li class="suggest-item" role="option"></li>').attr("data-name", item.name);
            $li.append($('<span class="suggest-name"></span>').text(item.name).highlight(String(text).trim()));
            $li.append($('<span class="suggest-meta"></span>').text(item.category + " · " + item.price + " ₸"));
            $list.append($li);
        });

        activeIndex = -1;
        $list.show();
        $search.attr("aria-expanded", "true");
    }

    function chooseSuggestion(name) {
        $search.val(name);
        applyFilter(name);
        hideSuggestions();
        SattiUI.toast('Showing results for "' + name + '"', "info");
    }

    function moveActive(step) {
        var $items = $list.children(".suggest-item");
        if ($items.length === 0) {
            return;
        }
        activeIndex = (activeIndex + step + $items.length) % $items.length;
        $items.removeClass("active").eq(activeIndex).addClass("active");
    }

    $search.on("input", function () {
        applyFilter($(this).val());
        showSuggestions($(this).val());
    });

    $search.on("keydown", function (event) {
        if (!$list.is(":visible")) {
            return;
        }
        if (event.key === "ArrowDown") {
            event.preventDefault();
            moveActive(1);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            moveActive(-1);
        } else if (event.key === "Enter") {
            var $active = $list.children(".suggest-item.active");
            if ($active.length) {
                event.preventDefault();
                chooseSuggestion($active.attr("data-name"));
            } else {
                hideSuggestions();
            }
        } else if (event.key === "Escape") {
            hideSuggestions();
        }
    });

    $list.on("mousedown", ".suggest-item", function (event) {
        event.preventDefault();
        chooseSuggestion($(this).attr("data-name"));
    });

    $list.on("mouseenter", ".suggest-item", function () {
        $(this).addClass("active").siblings().removeClass("active");
        activeIndex = $(this).index();
    });

    $search.on("blur", function () {
        setTimeout(hideSuggestions, 120);
    });
    $search.on("focus", function () {
        if ($(this).val().trim() !== "") {
            showSuggestions($(this).val());
        }
    });
}


function initFaqSearch() {
    var $input = $("#faqSearch");
    if ($input.length === 0) {
        return;
    }

    var $items = $(".accordion-item");
    var $targets = $(".accordion-button, .accordion-content p, .hl-target");
    var $result = $("#faqResult");

    function runSearch() {
        var term = String($input.val()).trim();

        $targets.highlight(term); 

        if (term === "") {
            $items.show().children(".accordion-content").hide();
            $result.text("");
            return;
        }

        var shown = 0;
        $items.each(function () {
            var $item = $(this);
            var hasHit = $item.find("mark.search-hit").length > 0;
            $item.toggle(hasHit);
            $item.children(".accordion-content").toggle(hasHit);
            if (hasHit) {
                shown++;
            }
        });

        var total = $("mark.search-hit").length;
        $result.text(total === 0
            ? 'No matches for "' + term + '".'
            : total + (total === 1 ? " match" : " matches") + " found · " + shown + " FAQ " + (shown === 1 ? "question" : "questions") + " shown");
    }

    $input.on("input keyup", runSearch);
    $("#faqClear").on("click", function () {
        $input.val("").trigger("input").trigger("focus");
    });
}

function initScrollProgress() {
    var $progress = $(
        '<div id="scrollProgress" aria-hidden="true">' +
            '<div class="progress-fill"><span class="progress-dot"></span></div>' +
        "</div>" +
        '<div id="scrollPercent" aria-hidden="true">0%</div>'
    ).prependTo("body");

    var $fill = $("#scrollProgress .progress-fill");
    var $percent = $("#scrollPercent");

    function update() {
        var scrollable = $(document).height() - $(window).height();
        var percent = scrollable > 0 ? ($(window).scrollTop() / scrollable) * 100 : 0;
        percent = Math.min(100, Math.max(0, percent));

        $fill.css("width", percent + "%");
        $percent.text(Math.round(percent) + "%")
                .toggleClass("visible", percent > 1)
                .toggleClass("done", percent >= 99.5);
        $("#scrollProgress").toggleClass("done", percent >= 99.5);
    }

    $(window).on("scroll resize", update);
    update();
}

function initCounters() {
    var $numbers = $(".stat-number");
    if ($numbers.length === 0) {
        return;
    }

    function countUp($el) {
        var target = Number($el.data("target"));
        var suffix = $el.data("suffix") || "";

        $({ value: 0 }).animate({ value: target }, {
            duration: 2200,
            easing: "swing",
            step: function (now) {
                $el.text(Math.floor(now).toLocaleString("en-US") + suffix);
            },
            complete: function () {
                $el.text(target.toLocaleString("en-US") + suffix);
                $el.closest(".stat").addClass("counted");
            }
        });
    }

    function check() {
        $numbers.each(function () {
            var $el = $(this);
            if ($el.data("started")) {
                return;
            }
            var visibleLine = $(window).scrollTop() + $(window).height();
            if (visibleLine > $el.offset().top + 40) {
                $el.data("started", true);
                countUp($el);
            }
        });
    }

    $(window).on("scroll resize", check);
    check();
}

var COPY_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
var CHECK_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

function copyToClipboard(text) {
    var done = $.Deferred();

    function legacyCopy() {
        var $temp = $("<textarea>").val(text).css({ position: "fixed", opacity: 0 }).appendTo("body");
        $temp[0].select();
        var ok = false;
        try {
            ok = document.execCommand("copy");
        } catch (e) {
            ok = false;
        }
        $temp.remove();
        return ok ? done.resolve() : done.reject();
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done.resolve, legacyCopy);
    } else {
        legacyCopy();
    }
    return done.promise();
}

function initCopyButtons() {
    var $buttons = $(".copy-btn");
    if ($buttons.length === 0) {
        return;
    }

    $buttons.html(COPY_ICON);

    $buttons.on("click", function () {
        var $btn = $(this);
        var text = $($btn.data("copyTarget")).text().trim();

        copyToClipboard(text).done(function () {
            $btn.addClass("copied").html(CHECK_ICON);                    
            $('<span class="copy-tip">Copied to clipboard!</span>')        
                .hide().appendTo($btn).fadeIn(150).delay(1400).fadeOut(250, function () { $(this).remove(); });
            SattiUI.toast('Copied: ' + text, "success");
            if (typeof playSound === "function") { playSound("success"); }

            clearTimeout($btn.data("timer"));
            $btn.data("timer", setTimeout(function () {                
                $btn.removeClass("copied").html(COPY_ICON);
            }, 2000));
        }).fail(function () {
            SattiUI.toast("Could not copy. Select the text and press Ctrl+C.", "error");
        });
    });

    $(".copy-text").on("copy", function () {
        SattiUI.toast("Text copied from the page", "info");
    });
}

function initLazyLoading() {
    var $lazy = $("img.lazy");
    if ($lazy.length === 0) {
        return;
    }

    var total = $lazy.length;
    var loaded = 0;
    var $status = $("#lazyStatus");
    var OFFSET = 150;  

    function updateStatus() {
        $status.text("Images loaded: " + loaded + " / " + total);
    }

    function loadImage($img) {
        $img.removeClass("lazy").addClass("lazy-loading").css("opacity", 0);
        $img.one("load", function () {
            $img.removeClass("lazy-loading").addClass("loaded").animate({ opacity: 1 }, 500);
            loaded++;
            updateStatus();
        });
        $img.attr("src", $img.attr("data-src")).removeAttr("data-src");
    }

    function check() {
        var viewBottom = $(window).scrollTop() + $(window).height() + OFFSET;
        $("img.lazy").each(function () {
            var $img = $(this);
            var $ref = $img.closest(".carousel");
            if ($ref.length === 0) {
                $ref = $img;
            }
            if ($ref.offset().top < viewBottom) {
                loadImage($img);
            }
        });
    }

    updateStatus();
    $(window).on("scroll resize", check);
    $(window).on("load", check);
    check();
}
