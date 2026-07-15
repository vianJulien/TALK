// notes.js - TALK Notes 页面逻辑

const NOTES_KEY = "v11_notes";
const ACTIVE_NOTE_KEY = "v11_active_note_id";

function notesLoadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) { return []; }
}

function notesSaveNotes() {
  localStorage.setItem(NOTES_KEY, JSON.stringify(core.notes));
}

function notesCreateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

core.notes = notesLoadNotes();
core.activeNoteId = localStorage.getItem(ACTIVE_NOTE_KEY) || null;

core.addNote = function({ title, content }) {
  const note = { id: notesCreateId(), title: title || "未命名便签", content: content || "", createdAt: new Date().toISOString() };
  core.notes.unshift(note);
  notesSaveNotes();
  core.renderNotes();
  return note;
};

core.deleteNote = function(id) {
  core.notes = core.notes.filter(n => n.id !== id);
  if (core.activeNoteId === id) { core.activeNoteId = null; localStorage.removeItem(ACTIVE_NOTE_KEY); }
  notesSaveNotes();
  core.renderNotes();
};

core.activateNote = function(id) {
  core.activeNoteId = id;
  localStorage.setItem(ACTIVE_NOTE_KEY, id);
  core.renderNotes();
};

core.clearActiveNote = function() {
  core.activeNoteId = null;
  localStorage.removeItem(ACTIVE_NOTE_KEY);
  core.renderNotes();
};

core.getActiveNote = function() {
  if (!core.activeNoteId) return null;
  return core.notes.find(n => n.id === core.activeNoteId) || null;
};

core.renderNotes = function() {
  const notesList = document.getElementById("notesList");
  const activeNoteInfo = document.getElementById("activeNoteInfo");
  if (!notesList) return;

  if (activeNoteInfo) {
    const an = core.getActiveNote();
    activeNoteInfo.innerHTML = an ? `当前激活便签：<strong>${an.title}</strong> <button onclick="core.clearActiveNote()">取消激活</button>` : "当前没有激活便签。";
  }

  notesList.innerHTML = "";
  if (!core.notes.length) {
    notesList.innerHTML = '<div style="padding:15px;color:#999;">还没有便签，手动添加或对TALK说"帮我整理成便签"</div>';
    return;
  }

  core.notes.forEach(function(note) {
    const isActive = note.id === core.activeNoteId;
    const card = document.createElement("div");
    card.style.cssText = "background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;margin:10px 15px;";
    if (isActive) card.style.borderColor = "var(--accent)";
    card.innerHTML = `
      <div style="font-weight:bold;margin-bottom:5px;">${note.title} ${isActive ? '<span style="color:var(--accent);font-size:0.8rem;">已激活</span>' : ''}</div>
      <div style="font-size:0.9rem;color:var(--text-sub);margin-bottom:8px;">${note.content}</div>
      <button onclick="core.activateNote('${note.id}')" style="margin-right:8px;font-size:0.8rem;">${isActive ? "取消激活" : " 激活"}</button>
      <button onclick="core.deleteNote('${note.id}')" style="font-size:0.8rem;color:#f85149;">删除</button>
    `;
    notesList.appendChild(card);
  });
};

const addNoteBtn = document.getElementById("addNoteBtn");
if (addNoteBtn) {
  addNoteBtn.addEventListener("click", function() {
    const title = document.getElementById("noteTitleInput").value.trim();
    const content = document.getElementById("noteContentInput").value.trim();
    if (!title && !content) return;
    core.addNote({ title: title || "未命名便签", content });
    document.getElementById("noteTitleInput").value = "";
    document.getElementById("noteContentInput").value = "";
  });
}

core.renderNotes();

