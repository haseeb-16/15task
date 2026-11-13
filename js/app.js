
import {
    isJQueryAvailable,
    renderAssignmentsJQuery,
    bindJQueryEvents,
    unbindJQueryEvents,
    loadAssignmentsWithAjax,
    renderNotificationsJQuery
} from "./jquery-version.js";

// ==============================
// APPLICATION STATE
// ==============================

const state = {
    assignments: [],
    notifications: [
        {
            id: 1,
            title: "Welcome to InternHub",
            message: "Your internship portal is ready.",
            date: "2026-11-12"
        },
        {
            id: 2,
            title: "New Assignment",
            message: "Check your JavaScript assignment.",
            date: "2026-11-12"
        }
    ],
    search: "",
    status: "all",
    sort: "dueDate",
    implementation: "vanilla",
    theme: "light"
};

const STORAGE_KEY = "internhub-theme";

let searchTimer = null;
let toastTimer = null;

// ==============================
// DOM ELEMENTS
// ==============================

const assignmentsContainer =
    document.querySelector("#assignments-container");

const searchInput =
    document.querySelector("#search-input");

const statusFilter =
    document.querySelector("#status-filter");

const sortFilter =
    document.querySelector("#sort-filter");

const implementationSelect =
    document.querySelector("#implementation-select");

const applicationForm =
    document.querySelector("#application-form");

const modal =
    document.querySelector("#assignment-modal");

// ==============================
// DEFENSIVE PROGRAMMING
// ==============================

function getElement(selector) {

    const element = document.querySelector(selector);

    if (!element) {
        console.warn(`Element not found: ${selector}`);
    }

    return element;
}

// ==============================
// STATUS AND TOAST MESSAGES
// ==============================

function showStatus(message, type = "info") {

    const element = getElement("#status-message");

    if (!element) return;

    element.textContent = message;
    element.className = "status-message";

    if (type === "success") {
        element.classList.add("success");
    }

    if (type === "error") {
        element.classList.add("error");
    }
}

function showToast(message, type = "success") {

    const container = getElement("#toast-container");

    if (!container) return;

    clearTimeout(toastTimer);

    container.replaceChildren();

    const toast = document.createElement("div");

    toast.className = type === "error" ? "toast error" : "toast";
    toast.textContent = message;

    container.append(toast);

    toastTimer = window.setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==============================
// DATA VALIDATION
// ==============================

function validateAssignments(data) {

    if (!Array.isArray(data)) {
        throw new Error("Assignment data must be an array.");
    }

    const validStatuses = [
        "Pending",
        "In Progress",
        "Completed"
    ];

    return data.filter(assignment => {

        return (
            assignment !== null &&
            typeof assignment === "object" &&
            Number.isInteger(assignment.id) &&
            typeof assignment.title === "string" &&
            typeof assignment.description === "string" &&
            validStatuses.includes(assignment.status) &&
            typeof assignment.dueDate === "string" &&
            Number.isFinite(assignment.progress) &&
            assignment.progress >= 0 &&
            assignment.progress <= 100
        );
    });
}

// ==============================
// LOAD DATA WITH VANILLA FETCH
// ==============================

async function loadAssignmentsWithFetch() {

    showStatus("Loading assignments with Vanilla JavaScript...");

    try {

        const response = await fetch("./data/assignments.json", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
            );
        }

        const data = await response.json();

        state.assignments = validateAssignments(data);

        renderDashboard();

        showStatus(
            `Loaded ${state.assignments.length} assignments using Vanilla JavaScript.`,
            "success"
        );

    } catch (error) {

        console.error("Fetch error:", error);

        showStatus(
            `Unable to load assignments: ${error.message}`,
            "error"
        );

        assignmentsContainer?.replaceChildren();

        if (assignmentsContainer) {
            const message = document.createElement("p");

            message.className = "empty-state";
            message.textContent = "Unable to load assignments. Please try again.";

            assignmentsContainer.append(message);
        }
    }
}

// ==============================
// LOAD DATA WITH JQUERY AJAX
// ==============================

async function loadAssignmentsWithJQuery() {

    showStatus("Loading assignments with jQuery AJAX...");

    try {

        const data = await loadAssignmentsWithAjax();

        state.assignments = validateAssignments(data);

        renderDashboard();

        showStatus(
            `Loaded ${state.assignments.length} assignments using jQuery AJAX.`,
            "success"
        );

    } catch (error) {

        console.error("jQuery AJAX error:", error);

        showStatus(
            `Unable to load assignments: ${error.message}`,
            "error"
        );

        assignmentsContainer?.replaceChildren();

        if (assignmentsContainer) {
            const message = document.createElement("p");

            message.className = "empty-state";
            message.textContent = "Unable to load assignments. Please try again.";

            assignmentsContainer.append(message);
        }
    }
}

// ==============================
// VANILLA ASSIGNMENT COMPONENT
// ==============================

function renderAssignmentsVanilla(assignments) {

    if (!assignmentsContainer) return;

    assignmentsContainer.replaceChildren();

    const count = getElement("#assignment-count");

    if (count) {
        count.textContent =
            `${assignments.length} assignments found`;
    }

    if (assignments.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-state";
        emptyMessage.textContent = "No assignments match your filters.";

        assignmentsContainer.append(emptyMessage);

        return;
    }

    assignments.forEach(assignment => {

        const card = document.createElement("article");

        card.className = "assignment-card";
        card.dataset.id = String(assignment.id);

        const statusClass = assignment.status
            .toLowerCase()
            .replaceAll(" ", "-");

        const badge = document.createElement("span");

        badge.className = `status-badge status-${statusClass}`;
        badge.textContent = assignment.status;

        const title = document.createElement("h3");
        title.textContent = assignment.title;

        const description = document.createElement("p");
        description.textContent = assignment.description;

        const dueDate = document.createElement("p");
        dueDate.textContent = `Due date: ${assignment.dueDate}`;

        const progress = document.createElement("p");
        progress.textContent = `Progress: ${assignment.progress}%`;

        const progressTrack = document.createElement("div");
        progressTrack.className = "card-progress";

        const progressFill = document.createElement("div");
        progressFill.className = "card-progress-fill";
        progressFill.style.width = `${assignment.progress}%`;

        progressTrack.append(progressFill);

        const detailsButton = document.createElement("button");

        detailsButton.type = "button";
        detailsButton.className = "details-button";
        detailsButton.textContent = "View Details";

        card.append(
            badge,
            title,
            description,
            dueDate,
            progress,
            progressTrack,
            detailsButton
        );

        assignmentsContainer.append(card);
    });
}

// ==============================
// FILTER AND SORT ASSIGNMENTS
// ==============================

function getFilteredAssignments() {

    let results = state.assignments.filter(assignment => {

        const matchesSearch =
            assignment.title.toLowerCase().includes(state.search) ||
            assignment.description.toLowerCase().includes(state.search);

        const matchesStatus =
            state.status === "all" ||
            assignment.status === state.status;

        return matchesSearch && matchesStatus;
    });

    results.sort((a, b) => {

        if (state.sort === "title") {
            return a.title.localeCompare(b.title);
        }

        if (state.sort === "progress") {
            return b.progress - a.progress;
        }

        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return results;
}

function renderCurrentAssignments() {

    const filteredAssignments = getFilteredAssignments();

    if (state.implementation === "jquery") {

        renderAssignmentsJQuery(filteredAssignments);

    } else {

        renderAssignmentsVanilla(filteredAssignments);
    }

    updateURL();
}

// ==============================
// DASHBOARD STATISTICS
// ==============================

function renderStatistics() {

    const assignments = state.assignments;

    const total = assignments.length;

    const completed = assignments.filter(
        item => item.status === "Completed"
    ).length;

    const pending = assignments.filter(
        item => item.status === "Pending"
    ).length;

    const progress = total === 0
        ? 0
        : Math.round(
            assignments.reduce(
                (sum, item) => sum + item.progress,
                0
            ) / total
        );

    const values = {
        "#total-count": total,
        "#completed-count": completed,
        "#pending-count": pending,
        "#overall-progress": `${progress}%`,
        "#progress-label": `${progress}%`
    };

    Object.entries(values).forEach(([selector, value]) => {

        const element = getElement(selector);

        if (element) {
            element.textContent = value;
        }
    });

    const fill = getElement("#progress-fill");
    const bar = getElement("#progress-bar");
    const description = getElement("#progress-description");

    if (fill) {
        fill.style.width = `${progress}%`;
    }

    if (bar) {
        bar.setAttribute("aria-valuenow", String(progress));
    }

    if (description) {
        description.textContent =
            `${completed} out of ${total} assignments completed.`;
    }
}

// ==============================
// NOTIFICATIONS - VANILLA JS
// ==============================

function renderNotificationsVanilla() {

    const container = getElement("#notifications-container");

    if (!container) return;

    container.replaceChildren();

    if (state.notifications.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-state";
        emptyMessage.textContent = "No notifications available.";

        container.append(emptyMessage);

        return;
    }

    state.notifications.forEach(notification => {

        const item = document.createElement("article");
        item.className = "notification-item";

        const title = document.createElement("strong");
        title.textContent = notification.title;

        const message = document.createElement("p");
        message.textContent = notification.message;

        const date = document.createElement("p");
        date.textContent = `Date: ${notification.date}`;

        item.append(title, message, date);

        container.append(item);
    });
}

function renderNotifications() {

    if (state.implementation === "jquery") {
        renderNotificationsJQuery(state.notifications);
    } else {
        renderNotificationsVanilla();
    }
}

// ==============================
// COMPLETE DASHBOARD RENDER
// ==============================

function renderDashboard() {

    renderStatistics();

    renderCurrentAssignments();

    renderNotifications();
}

// ==============================
// MODAL
// ==============================

function openAssignmentModal(assignmentId) {

    const assignment = state.assignments.find(
        item => item.id === assignmentId
    );

    if (!assignment || !modal) return;

    const title = getElement("#modal-title");
    const content = getElement("#modal-content");

    if (!title || !content) return;

    title.textContent = assignment.title;

    content.replaceChildren();

    const details = [
        ["Description", assignment.description],
        ["Status", assignment.status],
        ["Due Date", assignment.dueDate],
        ["Progress", `${assignment.progress}%`]
    ];

    details.forEach(([label, value]) => {

        const paragraph = document.createElement("p");

        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;

        paragraph.append(
            strong,
            document.createTextNode(value)
        );

        content.append(paragraph);
    });

    if (!modal.open) {
        modal.showModal();
    }
}

const closeModalButton = getElement("#close-modal");

closeModalButton?.addEventListener("click", () => {
    modal?.close();
});

modal?.addEventListener("click", event => {

    if (event.target === modal) {
        modal.close();
    }
});

// ==============================
// VANILLA EVENT DELEGATION
// ==============================

assignmentsContainer?.addEventListener("click", event => {

    if (state.implementation !== "vanilla") return;

    const button = event.target.closest(".details-button");

    if (!button) return;

    const card = button.closest(".assignment-card");

    if (!card) return;

    openAssignmentModal(Number(card.dataset.id));
});

// ==============================
// DEBOUNCE SEARCH
// ==============================

function debounce(callback, delay = 300) {

    let timeoutId;

    return (...args) => {

        clearTimeout(timeoutId);

        timeoutId = window.setTimeout(() => {
            callback(...args);
        }, delay);
    };
}

function updateSearch(value) {

    state.search = value.trim().toLowerCase();

    renderCurrentAssignments();
}

const debouncedSearch = debounce(updateSearch, 300);

searchInput?.addEventListener("input", event => {

    if (state.implementation !== "vanilla") return;

    debouncedSearch(event.target.value);
});

// ==============================
// FILTER EVENTS - VANILLA JS
// ==============================

statusFilter?.addEventListener("change", event => {

    if (state.implementation !== "vanilla") return;

    state.status = event.target.value;

    renderCurrentAssignments();
});

sortFilter?.addEventListener("change", event => {

    if (state.implementation !== "vanilla") return;

    state.sort = event.target.value;

    renderCurrentAssignments();
});

// ==============================
// URL AND URLSEARCHPARAMS
// ==============================

function updateURL() {

    const url = new URL(window.location.href);

    if (state.status === "all") {
        url.searchParams.delete("status");
    } else {
        url.searchParams.set("status", state.status);
    }

    if (state.search) {
        url.searchParams.set("search", state.search);
    } else {
        url.searchParams.delete("search");
    }

    window.history.replaceState({}, "", url);
}

function restoreURLFilters() {

    const params = new URLSearchParams(window.location.search);

    const savedStatus = params.get("status") ?? "all";
    const savedSearch = params.get("search") ?? "";

    const allowedStatuses = [
        "all",
        "Pending",
        "In Progress",
        "Completed"
    ];

    state.status = allowedStatuses.includes(savedStatus)
        ? savedStatus
        : "all";

    state.search = savedSearch.toLowerCase();

    if (statusFilter) {
        statusFilter.value = state.status;
    }

    if (searchInput) {
        searchInput.value = savedSearch;
    }
}

// ==============================
// APPLICATION FORM - VANILLA JS
// ==============================

function handleApplicationSubmit(form) {

    if (!form.reportValidity()) return;

    const formData = new FormData(form);

    const application = {
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        position: String(formData.get("position") ?? ""),
        message: String(formData.get("message") ?? "").trim()
    };

    if (
        !application.name ||
        !application.email ||
        !application.position ||
        !application.message
    ) {
        showToast("Please complete all fields.", "error");
        return;
    }

    console.log("Application submitted:", application);

    // Demonstration only: no backend is connected.
    showToast("Application form validated successfully.");

    state.notifications.unshift({
        id: Date.now(),
        title: "Application Submitted",
        message: `Your application for ${application.position} was recorded in this demo.`,
        date: new Date().toISOString().slice(0, 10)
    });

    renderNotifications();

    form.reset();
}

applicationForm?.addEventListener("submit", event => {

    if (state.implementation !== "vanilla") return;

    event.preventDefault();

    handleApplicationSubmit(event.currentTarget);
});

// ==============================
// THEME - LOCALSTORAGE
// ==============================

function applyTheme() {

    document.body.classList.toggle(
        "dark-theme",
        state.theme === "dark"
    );

    const button = getElement("#theme-button");

    if (button) {
        button.textContent =
            state.theme === "dark" ? "Light Mode" : "Dark Mode";
    }
}

function toggleTheme() {

    state.theme = state.theme === "dark" ? "light" : "dark";

    try {

        localStorage.setItem(STORAGE_KEY, state.theme);

    } catch (error) {

        console.error("Unable to save theme preference:", error);
    }

    applyTheme();

    showToast(`${state.theme} theme enabled.`);
}

function loadTheme() {

    try {

        const savedTheme = localStorage.getItem(STORAGE_KEY);

        state.theme = savedTheme === "dark" ? "dark" : "light";

    } catch (error) {

        console.error("Unable to read theme preference:", error);

        state.theme = "light";
    }

    applyTheme();
}

getElement("#theme-button")?.addEventListener("click", () => {

    if (state.implementation !== "vanilla") return;

    toggleTheme();
});

// ==============================
// CLEAR NOTIFICATIONS
// ==============================

function clearNotifications() {

    state.notifications = [];

    renderNotifications();

    showToast("Notifications cleared.");
}

getElement("#clear-notifications")?.addEventListener("click", () => {

    if (state.implementation !== "vanilla") return;

    clearNotifications();
});

// ==============================
// VANILLA AND JQUERY SWITCH
// ==============================

function handleJQueryApplication(form) {

    handleApplicationSubmit(form);
}

function handleJQuerySearch(value) {

    updateSearch(value);
}

function handleJQueryFilterChange() {

    state.status = statusFilter?.value ?? "all";
    state.sort = sortFilter?.value ?? "dueDate";

    renderCurrentAssignments();
}

function switchImplementation() {

    const requestedMode = implementationSelect?.value ?? "vanilla";

    if (requestedMode === "jquery" && !isJQueryAvailable()) {

        state.implementation = "vanilla";

        if (implementationSelect) {
            implementationSelect.value = "vanilla";
        }

        showToast(
            "jQuery could not be loaded. Using Vanilla JavaScript.",
            "error"
        );

        return;
    }

    state.implementation = requestedMode;

    if (state.implementation === "jquery") {

        bindJQueryEvents({
            onDetails: openAssignmentModal,
            onApplicationSubmit: handleJQueryApplication,
            onReload: reloadAssignments,
            onTheme: toggleTheme,
            onClearNotifications: clearNotifications,
            onFilterChange: handleJQueryFilterChange,
            onSearch: handleJQuerySearch
        });

        renderDashboard();

        showToast("jQuery implementation enabled.");

    } else {

        unbindJQueryEvents();

        renderDashboard();

        showToast("Vanilla JavaScript implementation enabled.");
    }
}

implementationSelect?.addEventListener(
    "change",
    switchImplementation
);

// ==============================
// RELOAD BUTTON - VANILLA JS
// ==============================

async function reloadAssignments() {

    if (state.implementation === "jquery") {
        await loadAssignmentsWithJQuery();
    } else {
        await loadAssignmentsWithFetch();
    }
}

getElement("#reload-button")?.addEventListener("click", () => {

    if (state.implementation !== "vanilla") return;

    reloadAssignments();
});

// ==============================
// NAVIGATION ACTIVE STATE
// ==============================

const navigation = getElement(".navigation");

navigation?.addEventListener("click", event => {

    const link = event.target.closest(".nav-link");

    if (!link || !navigation.contains(link)) return;

    navigation.querySelectorAll(".nav-link").forEach(item => {
        item.classList.remove("active");
    });

    link.classList.add("active");
});

// ==============================
// CLOCK
// ==============================

const clockElement = getElement("#clock");

function updateClock() {

    if (!clockElement) return;

    clockElement.textContent =
        new Date().toLocaleTimeString();
}

updateClock();

const clockTimer = window.setInterval(updateClock, 1000);

// ==============================
// INITIALIZE APPLICATION
// ==============================

async function initializeApp() {

    loadTheme();

    restoreURLFilters();

    await loadAssignmentsWithFetch();

    renderNotificationsVanilla();

    if (implementationSelect) {
        implementationSelect.value = "vanilla";
    }
}

initializeApp();

// ==============================
// CLEANUP
// ==============================

window.addEventListener("pagehide", () => {

    clearInterval(clockTimer);

    clearTimeout(searchTimer);

    clearTimeout(toastTimer);

    unbindJQueryEvents();
});
