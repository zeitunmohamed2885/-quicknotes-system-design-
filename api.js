
"use strict";

// JSONPlaceholder is a practice API, not a persistent notes backend.
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const statusElement = document.getElementById("status");
const notesList = document.getElementById("notes-list");

let requestInProgress = false;

// Display a status message without inserting HTML.
function showStatus(message, type = "info") {
    statusElement.textContent = message;
    statusElement.classList.remove("status-success", "status-error");

    if (type === "success") {
        statusElement.classList.add("status-success");
    } else if (type === "error") {
        statusElement.classList.add("status-error");
    }
}

// Disable all action buttons while a request is running.
function setBusy(isBusy) {
    requestInProgress = isBusy;

    loadButton.disabled = isBusy;
    submitButton.disabled = isBusy;

    notesList.querySelectorAll(".delete-btn").forEach((button) => {
        button.disabled = isBusy;
    });
}

// Reusable HTTP request helper.
async function request(url, options = {}) {
    const response = await fetch(url, options);

    const responseText = await response.text();
    let data = null;

    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error("The server returned an invalid response.");
        }
    }

    if (!response.ok) {
        const error = new Error(
            data?.message || `Request failed with status ${response.status}.`
        );

        error.status = response.status;
        throw error;
    }

    return {
        data,
        status: response.status
    };
}

// Create a note element safely using textContent.
function createNoteElement(note) {
    const listItem = document.createElement("li");
    listItem.className = "note-item";
    listItem.dataset.noteId = String(note.id);

    const heading = document.createElement("h3");
    heading.textContent = note.title || "Untitled note";

    const body = document.createElement("p");
    body.textContent = note.body || "No body provided.";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete note";
    deleteButton.disabled = requestInProgress;

    deleteButton.addEventListener("click", () => {
        deleteNote(note.id, listItem);
    });

    listItem.append(heading, body, deleteButton);

    return listItem;
}

// Show an empty state when there are no notes.
function showEmptyState() {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "No notes found. Create your first note.";

    notesList.replaceChildren(emptyItem);
}

// GET: load the first 10 notes.
async function loadNotes() {
    if (requestInProgress) return;

    setBusy(true);
    showStatus("Loading notes...");

    try {
        const result = await request(`${API_URL}?_limit=10`);

        if (!Array.isArray(result.data)) {
            throw new Error("The server returned an unexpected notes format.");
        }

        notesList.replaceChildren();

        if (result.data.length === 0) {
            showEmptyState();
            showStatus("No notes found.", "success");
            return;
        }

        const fragment = document.createDocumentFragment();

        result.data.forEach((note) => {
            fragment.appendChild(createNoteElement(note));
        });

        notesList.appendChild(fragment);

        showStatus(
            `Loaded ${result.data.length} notes from the server.`,
            "success"
        );
    } catch (error) {
        showStatus(
            `Unable to load notes. ${error.message}`,
            "error"
        );
    } finally {
        setBusy(false);
    }
}

// POST: create a note.
async function createNote(event) {
    event.preventDefault();

    if (requestInProgress) return;

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Validate in JavaScript as well as in the HTML form.
    if (!title) {
        showStatus("Please enter a title for your note.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        showStatus("The title must not exceed 100 characters.", "error");
        titleInput.focus();
        return;
    }

    setBusy(true);
    showStatus("Creating note...");

    try {
        const result = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                body,
                userId: 1
            })
        });

        if (!result.data || result.data.id == null) {
            throw new Error("The server did not return a note ID.");
        }

        const newNote = result.data;
        const noteElement = createNoteElement(newNote);

        // JSONPlaceholder simulates creation but does not persist it.
        // Add the returned note locally; it may disappear after reloading.
        const firstItem = notesList.firstElementChild;

        if (firstItem?.classList.contains("empty-state")) {
            notesList.replaceChildren(noteElement);
        } else {
            notesList.prepend(noteElement);
        }

        noteForm.reset();

        showStatus(
            `Note created (status ${result.status}, id ${newNote.id}).`,
            "success"
        );
    } catch (error) {
        showStatus(
            `Unable to create note. ${error.message}`,
            "error"
        );
    } finally {
        setBusy(false);
    }
}

// DELETE: request deletion and remove the note from the displayed list.
async function deleteNote(noteId, listItem) {
    if (requestInProgress) return;

    setBusy(true);
    showStatus("Deleting note...");

    try {
        const result = await request(`${API_URL}/${encodeURIComponent(noteId)}`, {
            method: "DELETE"
        });

        // JSONPlaceholder does not persist changes. Remove the note locally
        // only after the practice API confirms a successful response.
        listItem.remove();

        if (notesList.children.length === 0) {
            showEmptyState();
        }

        showStatus(
            `Note ${noteId} deleted (status ${result.status}).`,
            "success"
        );
    } catch (error) {
        showStatus(
            `Unable to delete note. ${error.message}`,
            "error"
        );
    } finally {
        setBusy(false);
    }
}

// Register event handlers.
loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
