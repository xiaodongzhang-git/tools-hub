// Text Notes tool
document.addEventListener("DOMContentLoaded", () => {
    const newNoteBtn = document.getElementById("new-note-btn");
    const notesListEl = document.getElementById("notes-list");
    const titleInput = document.getElementById("note-title-input");
    const contentTextarea = document.getElementById("note-content");
    const importInput = document.getElementById("import-txt-input");
    const exportBtn = document.getElementById("export-txt-btn");
    const deleteBtn = document.getElementById("delete-note-btn");
  
    if (
      !newNoteBtn ||
      !notesListEl ||
      !titleInput ||
      !contentTextarea ||
      !importInput ||
      !exportBtn ||
      !deleteBtn
    ) {
      return; // 不是这个页面时直接退出
    }
  
    const STORAGE_KEY_NOTES = "toolsHubTextNotes";
    const STORAGE_KEY_ACTIVE = "toolsHubTextNotesActiveId";
  
    let notes = [];
    let activeId = null;
    let titleTouchedManually = false;
  
    /* ---------- Storage helpers ---------- */
  
    function loadFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_NOTES);
        if (raw) {
          notes = JSON.parse(raw);
        } else {
          notes = [];
        }
      } catch {
        notes = [];
      }
  
      activeId = localStorage.getItem(STORAGE_KEY_ACTIVE);
    }
  
    function saveToStorage() {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
      if (activeId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, activeId);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
    }
  
    /* ---------- Notes operations ---------- */
  
    function createNote(initialTitle = "Untitled note", initialContent = "") {
      const id = String(Date.now());
      const note = {
        id,
        title: initialTitle,
        content: initialContent,
        updatedAt: Date.now()
      };
      notes.unshift(note);
      activeId = id;
      titleTouchedManually = false;
      saveToStorage();
      renderNotesList();
      renderActiveNote();
    }
  
    function findNote(id) {
      return notes.find((n) => n.id === id) || null;
    }
  
    function updateActiveNote(updater) {
      if (!activeId) return;
      const note = findNote(activeId);
      if (!note) return;
      updater(note);
      note.updatedAt = Date.now();
      saveToStorage();
      renderNotesList();
    }
  
    function renderNotesList() {
      notesListEl.innerHTML = "";
      if (notes.length === 0) {
        const li = document.createElement("li");
        li.className = "notes-list-empty";
        li.textContent = "No notes yet.";
        notesListEl.appendChild(li);
        return;
      }
  
      notes.forEach((note) => {
        const li = document.createElement("li");
        li.className = "notes-list-item";
        if (note.id === activeId) {
          li.classList.add("active");
        }
        li.textContent = note.title || "Untitled note";
        li.dataset.id = note.id;
        li.addEventListener("click", () => {
          activeId = note.id;
          titleTouchedManually = false;
          saveToStorage();
          renderNotesList();
          renderActiveNote();
        });
        notesListEl.appendChild(li);
      });
    }
  
    function renderActiveNote() {
      const note = activeId ? findNote(activeId) : null;
      if (!note) {
        titleInput.value = "";
        contentTextarea.value = "";
        return;
      }
      titleInput.value = note.title || "";
      contentTextarea.value = note.content || "";
    }
  
    /* ---------- Auto title from first line ---------- */
  
    function updateTitleFromContentIfNeeded(content) {
      if (titleTouchedManually) return;
      const lines = content.split(/\r?\n/);
      const firstNonEmpty = lines.find((l) => l.trim().length > 0) || "";
      if (!activeId) return;
      const note = findNote(activeId);
      if (!note) return;
  
      if (!note.title || note.title === "Untitled note") {
        note.title = firstNonEmpty || "Untitled note";
        saveToStorage();
        renderNotesList();
        titleInput.value = note.title;
      }
    }

    function deleteNote(id) {
        const index = notes.findIndex((n) => n.id === id);
        if (index === -1) return;
      
        notes.splice(index, 1);
      
        // 如果删的是当前笔记，重置 activeId
        if (activeId === id) {
          if (notes.length > 0) {
            activeId = notes[0].id;
          } else {
            activeId = null;
          }
        }
      
        saveToStorage();
        renderNotesList();
        renderActiveNote();
      }      
  
    /* ---------- Event bindings ---------- */
  
    // 新建
    newNoteBtn.addEventListener("click", () => {
      createNote();
    });
  
    // 标题输入（手动修改）
    titleInput.addEventListener("input", () => {
      titleTouchedManually = true;
      const value = titleInput.value;
      updateActiveNote((note) => {
        note.title = value || "Untitled note";
      });
    });
  
    // 内容输入（自动保存 + 自动标题）
    contentTextarea.addEventListener("input", () => {
      const value = contentTextarea.value;
      updateActiveNote((note) => {
        note.content = value;
      });
      updateTitleFromContentIfNeeded(value);
    });
  
    // 导入 TXT（作为新笔记）
    importInput.addEventListener("change", () => {
      const file = importInput.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result || "";
        const name = file.name.replace(/\.txt$/i, "") || "Imported note";
        createNote(name, text);
        // 读完后清空 input，否则同一文件无法重复触发 change
        importInput.value = "";
      };
      reader.readAsText(file);
    });
  
    // 导出当前笔记为 TXT
    exportBtn.addEventListener("click", () => {
      if (!activeId) {
        alert("No active note. Please create or select a note first.");
        return;
      }
      const note = findNote(activeId);
      if (!note) {
        alert("No active note. Please create or select a note first.");
        return;
      }
  
      const blob = new Blob([note.content || ""], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
  
      let filename = note.title || "note";
      filename = filename.replace(/[\\\/:*?"<>|]/g, "_") || "note";
      if (!filename.toLowerCase().endsWith(".txt")) {
        filename += ".txt";
      }
  
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      URL.revokeObjectURL(url);
    });

    // 删除当前笔记
    deleteBtn.addEventListener("click", () => {
        if (!activeId) {
        alert("No active note. Please create or select a note first.");
        return;
        }
        const note = findNote(activeId);
        if (!note) {
        alert("No active note. Please create or select a note first.");
        return;
        }
    
        const ok = confirm("Delete this note? This action cannot be undone.");
        if (!ok) return;
    
        deleteNote(activeId);
    });
  
    /* ---------- Init ---------- */
  
    loadFromStorage();
  
    if (notes.length === 0) {
      // 初次打开自动生成一条空 note
      createNote();
    } else {
      // 已有数据，渲染
      if (!activeId || !findNote(activeId)) {
        activeId = notes[0].id;
      }
      renderNotesList();
      renderActiveNote();
    }
  });
  