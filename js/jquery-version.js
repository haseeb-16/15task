
/*
    JQUERY IMPLEMENTATION

    This file contains the jQuery version of selected features.
    The main application is still written in Vanilla JavaScript.

    Vanilla JS equivalent:
    $("#element")          -> document.querySelector("#element")
    .text("Hello")         -> element.textContent = "Hello"
    .addClass("active")    -> element.classList.add("active")
    .removeClass("active") -> element.classList.remove("active")
    .on("click", handler)  -> element.addEventListener("click", handler)
    .closest(".card")      -> element.closest(".card")
*/

const $ = window.jQuery;

/**
 * Check whether jQuery is available.
 */
export function isJQueryAvailable() {
    return Boolean($);
}

/**
 * Render assignment cards using jQuery.
 *
 * Vanilla JS version is implemented in app.js.
 */
export function renderAssignmentsJQuery(assignments) {

    if (!$) {
        throw new Error("jQuery is not available. Check the CDN connection.");
    }

    const $container = $("#assignments-container");

    $container.empty();

    $("#assignment-count").text(
        `${assignments.length} assignments found`
    );

    if (assignments.length === 0) {

        $("<p>")
            .addClass("empty-state")
            .text("No assignments match your filters.")
            .appendTo($container);

        return;
    }

    assignments.forEach(assignment => {

        const statusClass = assignment.status
            .toLowerCase()
            .replaceAll(" ", "-");

        // Build elements using jQuery.
        // .text() is used instead of inserting external data with .html().
        const $card = $("<article>")
            .addClass("assignment-card")
            .attr("data-id", assignment.id);

        const $badge = $("<span>")
            .addClass(`status-badge status-${statusClass}`)
            .text(assignment.status);

        const $title = $("<h3>")
            .text(assignment.title);

        const $description = $("<p>")
            .text(assignment.description);

        const $dueDate = $("<p>")
            .text(`Due date: ${assignment.dueDate}`);

        const $progress = $("<p>")
            .text(`Progress: ${assignment.progress}%`);

        const $progressTrack = $("<div>")
            .addClass("card-progress");

        const $progressFill = $("<div>")
            .addClass("card-progress-fill")
            .css("width", `${assignment.progress}%`);

        const $detailsButton = $("<button>")
            .attr("type", "button")
            .addClass("details-button")
            .text("View Details");

        $progressTrack.append($progressFill);

        $card.append(
            $badge,
            $title,
            $description,
            $dueDate,
            $progress,
            $progressTrack,
            $detailsButton
        );

        // jQuery effect 1: fade in assignment cards.
        $card.hide().appendTo($container).fadeIn(250);
    });
}

/**
 * Bind jQuery events.
 *
 * Event delegation allows buttons inside dynamically
 * generated assignment cards to work.
 */
export function bindJQueryEvents(callbacks) {

    if (!$) {
        throw new Error("jQuery is not available.");
    }

    // Remove old namespaced events before adding new ones.
    unbindJQueryEvents();

    // Assignment details: delegated event + traversal.
    $("#assignments-container").on(
        "click.portal",
        ".details-button",
        function () {

            // .closest() traverses to the parent assignment card.
            const $card = $(this).closest(".assignment-card");

            // .data() retrieves the card's assignment ID.
            const assignmentId = Number($card.data("id"));

            callbacks.onDetails(assignmentId);
        }
    );

    // Application form event.
    $("#application-form").on("submit.portal", function (event) {

        event.preventDefault();

        callbacks.onApplicationSubmit(this);
    });

    // Reload button.
    $("#reload-button").on("click.portal", function () {
        callbacks.onReload();
    });

    // Theme button.
    $("#theme-button").on("click.portal", function () {
        callbacks.onTheme();
    });

    // Clear notifications.
    $("#clear-notifications").on("click.portal", function () {
        callbacks.onClearNotifications();
    });

    // Filter events.
    $("#status-filter").on("change.portal", function () {
        callbacks.onFilterChange();
    });

    $("#sort-filter").on("change.portal", function () {
        callbacks.onFilterChange();
    });

    // Search event.
    $("#search-input").on("input.portal", function () {
        callbacks.onSearch(this.value);
    });
}

/**
 * Remove jQuery event handlers.
 */
export function unbindJQueryEvents() {

    if (!$) return;

    $("#assignments-container").off(".portal");
    $("#application-form").off(".portal");
    $("#reload-button").off(".portal");
    $("#theme-button").off(".portal");
    $("#clear-notifications").off(".portal");
    $("#status-filter").off(".portal");
    $("#sort-filter").off(".portal");
    $("#search-input").off(".portal");
}

/**
 * Load assignment JSON using jQuery AJAX.
 */
export function loadAssignmentsWithAjax() {

    return new Promise((resolve, reject) => {

        if (!$) {
            reject(new Error("jQuery is not available."));
            return;
        }

        $.ajax({
            url: "./data/assignments.json",
            method: "GET",
            dataType: "json",
            timeout: 10000
        })
        .done(data => {
            resolve(data);
        })
        .fail((xhr, status, error) => {

            reject(
                new Error(
                    `jQuery AJAX failed: ${status} ${error || xhr.statusText}`
                )
            );
        });
    });
}

/**
 * jQuery notification rendering.
 *
 * jQuery effect 2: slideDown.
 */
export function renderNotificationsJQuery(notifications) {

    if (!$) return;

    const $container = $("#notifications-container");

    $container.empty();

    if (notifications.length === 0) {

        $("<p>")
            .addClass("empty-state")
            .text("No notifications available.")
            .appendTo($container);

        return;
    }

    notifications.forEach(notification => {

        const $item = $("<article>")
            .addClass("notification-item");

        const $title = $("<strong>")
            .text(notification.title);

        const $message = $("<p>")
            .text(notification.message);

        const $date = $("<p>")
            .text(`Date: ${notification.date}`);

        $item.append($title, $message, $date);

        $item.hide().appendTo($container).slideDown(250);
    });
}

/*
    CONVERSION PRACTICE

    jQuery version:
        $("#status-message").text("Data loaded");

    Equivalent Vanilla JavaScript:
        const status = document.querySelector("#status-message");

        if (status) {
            status.textContent = "Data loaded";
        }

    Both approaches update the text of an HTML element.
*/
