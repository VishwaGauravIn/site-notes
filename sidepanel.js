let currentUrl = "";
let currentHostname = "";
let viewMode = "page"; // "page", "domain", or "all"
let currentNotes = [];

// Initialize the extension
async function initialize() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  const url = new URL(tab.url);
  currentHostname = url.hostname;

  // Special handling for YouTube videos
  if (isYouTubeVideo(url)) {
    currentUrl = `${url.origin}${url.pathname}?v=${url.searchParams.get("v")}`;
  } else {
    // For other URLs, remove query parameters and hash
    url.search = "";
    url.hash = "";
    currentUrl = url.toString();
  }

  // Update UI
  document.getElementById("currentUrl").textContent = currentHostname;
  document.getElementById(
    "favicon"
  ).src = `https://www.google.com/s2/favicons?domain=${currentHostname}`;

  loadNotes();
  setupEventListeners();
}

function isYouTubeVideo(url) {
  return (
    url.hostname.includes("youtube.com") &&
    url.pathname === "/watch" &&
    url.searchParams.has("v")
  );
}

// Set up all event listeners
function setupEventListeners() {
  // View toggle buttons
  document.getElementById("pageNotesBtn").addEventListener("click", () => {
    viewMode = "page";
    toggleActiveButton("pageNotesBtn", ["domainNotesBtn", "allNotesBtn"]);
    loadNotes();
  });

  document.getElementById("domainNotesBtn").addEventListener("click", () => {
    viewMode = "domain";
    toggleActiveButton("domainNotesBtn", ["pageNotesBtn", "allNotesBtn"]);
    loadNotes();
  });

  document.getElementById("allNotesBtn").addEventListener("click", () => {
    viewMode = "all";
    toggleActiveButton("allNotesBtn", ["pageNotesBtn", "domainNotesBtn"]);
    loadNotes();
  });

  // Search input with debounce
  const searchInput = document.getElementById("searchInput");
  let debounceTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => loadNotes(e.target.value), 300);
  });

  // Add note button
  document
    .getElementById("addNoteBtn")
    .addEventListener("click", openNoteModal);

  // Modal buttons
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeNoteModal);
  document
    .getElementById("cancelNoteBtn")
    .addEventListener("click", closeNoteModal);
  document.getElementById("saveNoteBtn").addEventListener("click", saveNewNote);

  // Settings
  document
    .getElementById("settingsBtn")
    .addEventListener("click", openSettingsModal);
  document
    .getElementById("closeSettingsBtn")
    .addEventListener("click", closeSettingsModal);
  document
    .getElementById("resetDataBtn")
    .addEventListener("click", resetAllData);
  document
    .getElementById("exportDataBtn")
    .addEventListener("click", exportData);
  document.getElementById("importDataBtn").addEventListener("click", () => {
    document.getElementById("importFileInput").click();
  });
  document
    .getElementById("importFileInput")
    .addEventListener("change", importData);

  // Tags input
  const tagsInput = document.querySelector("#tagsInput input");
  tagsInput.addEventListener("keydown", handleTagInput);

  // Tab changes
  chrome.tabs.onActivated.addListener(initialize);
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      initialize();
    }
  });
}

// Load notes based on current view mode and search term
async function loadNotes(searchTerm = "") {
  const allNotes = await getAllNotes();
  let filteredNotes = [];

  switch (viewMode) {
    case "page":
      filteredNotes = allNotes.filter((note) => note.url === currentUrl);
      break;
    case "domain":
      filteredNotes = allNotes.filter((note) => {
        const noteUrl = new URL(note.url);
        return noteUrl.hostname === currentHostname;
      });
      break;
    case "all":
      filteredNotes = allNotes;
      break;
  }

  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredNotes = filteredNotes.filter(
      (note) =>
        note.content.toLowerCase().includes(term) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(term))
    );
  }

  // Sort by most recent first
  filteredNotes.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));

  currentNotes = filteredNotes;
  displayNotes(filteredNotes);
}

// Get all notes from storage
async function getAllNotes() {
  try {
    const data = await chrome.storage.local.get(null);
    return Object.values(data).flat();
  } catch (error) {
    console.error("Error getting notes:", error);
    return [];
  }
}

// Display notes in the container
function displayNotes(notes) {
  const container = document.getElementById("notesContainer");
  const searchTerm = document.getElementById("searchInput").value;

  if (notes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-note-sticky"></i>
        <p>No notes found${searchTerm ? " for your search" : ""}.<br>
        ${!searchTerm ? "Click the + button to create one!" : ""}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notes
    .map((note, index) => createNoteHTML(note, index))
    .join("");

  // Attach event listeners after rendering
  notes.forEach((_, index) => attachNoteEventListeners(index));
}

// Create HTML for a single note
function createNoteHTML(note, index) {
  const created = new Date(note.createdAt).toLocaleString();
  const modified = new Date(note.modifiedAt).toLocaleString();
  const noteUrl = new URL(note.url);
  const displayUrl = isYouTubeVideo(noteUrl)
    ? `YouTube: ${noteUrl.searchParams.get("v")}`
    : noteUrl.pathname === "/"
    ? noteUrl.hostname
    : noteUrl.pathname;

  return `
    <div class="note-card" data-index="${index}" data-url="${note.url}">
      <div class="note-header">
        <div class="note-title">
          Note ${index + 1}
          ${
            viewMode !== "page"
              ? `
            <a href="${note.url}" class="note-url" title="${note.url}">
              ${displayUrl}
            </a>
          `
              : ""
          }
        </div>
        <div class="note-actions">
          <button class="note-action-btn edit-btn" title="Edit">
            <i class="fas fa-pen"></i>
          </button>
          <button class="note-action-btn delete-btn" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="note-content">
        <textarea class="note-textarea" readonly>${note.content}</textarea>
        ${
          note.tags?.length
            ? `
          <div class="tags-container">
            ${note.tags
              .map((tag) => `<span class="tag">#${tag}</span>`)
              .join("")}
          </div>
        `
            : ""
        }
      </div>
      <div class="note-footer">
        <span class="timestamp">Created: ${created}</span>
        <span class="timestamp">Modified: ${modified}</span>
      </div>
    </div>
  `;
}

// Attach event listeners to a note
function attachNoteEventListeners(index) {
  const noteCard = document.querySelector(`.note-card[data-index="${index}"]`);
  if (!noteCard) return;

  const textarea = noteCard.querySelector(".note-textarea");
  const editBtn = noteCard.querySelector(".edit-btn");
  const deleteBtn = noteCard.querySelector(".delete-btn");
  let originalContent;

  editBtn.addEventListener("click", () => {
    const isEditing = textarea.hasAttribute("readonly");

    if (isEditing) {
      // Enter edit mode
      originalContent = textarea.value;
      textarea.removeAttribute("readonly");
      textarea.focus();
      editBtn.innerHTML = '<i class="fas fa-save"></i>';
      editBtn.title = "Save";
    } else {
      // Save changes
      const newContent = textarea.value.trim();
      if (newContent !== originalContent) {
        saveNoteEdit(index, newContent);
      }
      textarea.setAttribute("readonly", "true");
      editBtn.innerHTML = '<i class="fas fa-pen"></i>';
      editBtn.title = "Edit";
    }
  });

  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote(index);
    }
  });
}

// Modal functions
function openNoteModal() {
  document.getElementById("noteModal").classList.add("active");
  document.getElementById("newNoteContent").focus();
}

function closeNoteModal() {
  document.getElementById("noteModal").classList.remove("active");
  document.getElementById("newNoteContent").value = "";
  document.getElementById("tagsInput").innerHTML = `
    <input type="text" placeholder="Add tags (press Enter)" style="border: none; outline: none; flex: 1;">
  `;
}

// Save functions
async function saveNewNote() {
  const content = document.getElementById("newNoteContent").value.trim();
  if (!content) return;

  const tags = Array.from(
    document.getElementById("tagsInput").querySelectorAll(".tag")
  ).map((tag) => tag.textContent.slice(1)); // Remove # from tag

  const newNote = {
    content,
    tags,
    url: currentUrl,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };

  const existingNotes = (await chrome.storage.local.get(currentHostname)) || {};
  const notes = existingNotes[currentHostname] || [];
  notes.push(newNote);

  await chrome.storage.local.set({ [currentHostname]: notes });
  closeNoteModal();
  loadNotes();
}

async function saveNoteEdit(index, content) {
  const note = currentNotes[index];
  const existingNotes = await chrome.storage.local.get(
    new URL(note.url).hostname
  );
  const notes = existingNotes[new URL(note.url).hostname] || [];

  const noteIndex = notes.findIndex(
    (n) => n.url === note.url && n.createdAt === note.createdAt
  );

  if (noteIndex !== -1) {
    notes[noteIndex] = {
      ...notes[noteIndex],
      content: content.trim(),
      modifiedAt: new Date().toISOString(),
    };

    await chrome.storage.local.set({ [new URL(note.url).hostname]: notes });
    loadNotes();
  }
}

async function deleteNote(index) {
  const note = currentNotes[index];
  const hostname = new URL(note.url).hostname;
  const existingNotes = await chrome.storage.local.get(hostname);
  const notes = existingNotes[hostname] || [];

  const noteIndex = notes.findIndex(
    (n) => n.url === note.url && n.createdAt === note.createdAt
  );

  if (noteIndex !== -1) {
    notes.splice(noteIndex, 1);
    await chrome.storage.local.set({ [hostname]: notes });
    loadNotes();
  }
}

// Utility functions
function toggleActiveButton(activeId, inactiveIds) {
  document.getElementById(activeId).classList.add("active");
  inactiveIds.forEach((id) =>
    document.getElementById(id).classList.remove("active")
  );
}

function openSettingsModal() {
  document.getElementById("settingsModal").classList.add("active");
}

function closeSettingsModal() {
  document.getElementById("settingsModal").classList.remove("active");
}

function resetAllData() {
  if (
    confirm("Are you sure you want to reset all data? This cannot be undone.")
  ) {
    chrome.storage.local.clear(() => {
      loadNotes();
      closeSettingsModal();
    });
  }
}

function exportData() {
  chrome.storage.local.get(null, (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitenotes_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      chrome.storage.local.clear(() => {
        chrome.storage.local.set(data, () => {
          loadNotes();
          closeSettingsModal();
        });
      });
    } catch (error) {
      alert("Invalid backup file");
    }
  };
  reader.readAsText(file);
}

// Tag handling
function handleTagInput(e) {
  if (e.key === "Enter" && e.target.value.trim()) {
    e.preventDefault();
    const tag = e.target.value.trim().replace(/\s+/g, "-");
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.innerHTML = `#${tag}<button type="button">&times;</button>`;

    // Add click handler directly to the button
    const deleteBtn = tagElement.querySelector("button");
    deleteBtn.addEventListener("click", function () {
      tagElement.remove();
    });

    e.target.parentElement.insertBefore(tagElement, e.target);
    e.target.value = "";
  }
}

// Initialize the extension
document.addEventListener("DOMContentLoaded", initialize);
