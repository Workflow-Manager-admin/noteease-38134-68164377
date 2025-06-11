import React, { useState, useRef } from "react";

/**
 * NoteEase Main Container
 * Features: Create/Edit/Delete Note, Search Notes, Categorize Notes
 * UI: Light theme using provided palette, responsive sidebar layout
 */

// Utility for generating unique ids
const uuidv4 = () =>
  ([1e7]+-1e3+-4e3+-8e3+-1e11)
    .replace(/[018]/g, c =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4)).toString(16)
    );

// Defaults for app theme colors
const THEME = {
  primary: "#4A90E2",
  secondary: "#F5F7FA",
  accent: "#FFD700",
  text: "#252733",
  sidebarBg: "#EAF1FA",
  noteItemBg: "#FFFFFF",
  selectedNoteBg: "#CCE2FB",
  border: "#E1E4EA",
};

// ===== Note Item Component =====
function NoteListItem({
  note,
  selected,
  onClick,
  onDelete,
  onEdit,
}) {
  return (
    <div
      style={{
        background: selected ? THEME.selectedNoteBg : THEME.noteItemBg,
        border: "1px solid " + THEME.border,
        borderRadius: 8,
        padding: "12px 10px 8px 14px",
        marginBottom: 12,
        boxShadow: selected ? "0 2px 5px rgba(74, 144, 226, 0.07)" : "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        minWidth: 0,
      }}
      data-testid={"sidebar-note-"+note.id}
      onClick={onClick}
    >
      <div style={{
        fontWeight: 600,
        fontSize: 16,
        color: THEME.primary,
        marginBottom: 2,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%",
      }}>
        {note.title || <span style={{color:"#888"}}>[Untitled]</span>}
      </div>
      <div style={{
        color: "#666",
        fontSize: 13,
        marginBottom: 4,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%",
      }}>
        {note.content
          ? note.content.length > 60
            ? note.content.slice(0,60)+"…"
            : note.content
          : <span style={{color:"#bbb"}}>No content</span>}
      </div>
      <div style={{
        fontSize: 12,
        marginTop: 2,
      }}>
        <span style={{
          background: THEME.accent,
          borderRadius: 5,
          color: "#fff",
          fontWeight: 500,
          padding: "0 6px",
        }}>{note.category}</span>
      </div>
      {/* Actions for quick delete/edit */}
      <div style={{
        position: "absolute",
        top: 10,
        right: 10,
        display: "flex",
        gap: 4,
        zIndex: 1,
      }}>
        <button
          title="Edit"
          tabIndex={-1}
          onClick={e => {
            e.stopPropagation();
            onEdit();
          }}
          style={{
            background: "none", border: "none", color: THEME.primary, padding: 2,
            cursor: "pointer", fontSize: 16,
          }}
        >
          ✏️
        </button>
        <button
          title="Delete"
          tabIndex={-1}
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            background: "none", border: "none", color: "#EB5252", padding: 2,
            cursor: "pointer", fontSize: 16,
          }}
        >
          🗑
        </button>
      </div>
    </div>
  );
}

// ===== Note Editor =====
function NoteEditor({ 
  note, 
  onSave, 
  onCancel, 
  categories,
  isNew
}) {
  const [title, setTitle] = useState(note ? note.title : "");
  const [content, setContent] = useState(note ? note.content : "");
  const [category, setCategory] = useState(note ? note.category : categories[0]);

  const refTitle = useRef(null);

  // Focus title when editor mounts (for new notes)
  React.useEffect(() => {
    refTitle.current && refTitle.current.focus();
  }, []);

  // PUBLIC_INTERFACE
  /** Handles saving the note (create or update) */
  function handleSave() {
    if (!title.trim() && !content.trim()) {
      // Don’t save empty note
      return;
    }
    // Returns note obj
    onSave({
      ...note,
      title: title.trim(),
      content: content.trim(),
      category: category
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input
        type="text"
        ref={refTitle}
        placeholder="Note title..."
        value={title}
        style={{
          fontSize: 22,
          padding: "7px 8px",
          borderRadius: 6,
          border: `1px solid ${THEME.primary}`,
          width: "100%",
          fontWeight: 600,
          background: "#fff",
        }}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        rows={12}
        style={{
          resize: "vertical",
          width: "100%",
          padding: 10,
          border: `1px solid ${THEME.border}`,
          borderRadius: 6,
          background: "#fff",
          fontSize: 15,
          minHeight: 80,
          boxSizing: "border-box",
        }}
        value={content}
        placeholder="Write your note here... (supports basic text only)"
        onChange={e => setContent(e.target.value)}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <select
          style={{
            fontSize: 15,
            padding: "4px 8px",
            borderRadius: 5,
            border: `1px solid ${THEME.primary}`,
            background: "#fff",
          }}
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {categories.map(cat => 
            <option value={cat} key={cat}>{cat}</option>
          )}
        </select>
        <button
          onClick={handleSave}
          style={{
            background: THEME.primary,
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "7px 18px",
            fontWeight: 500,
            marginLeft: 10,
            cursor: "pointer"
          }}
        >{isNew ? "Create" : "Save"}</button>
        <button
          onClick={onCancel}
          style={{
            marginLeft: 5,
            background: "#eee",
            color: "#444",
            border: "1px solid #ddd",
            borderRadius: 4,
            padding: "7px 15px",
            cursor: "pointer"
          }}
        >Cancel</button>
      </div>
    </div>
  );
}

// === Main NoteEase Container ===
const DEFAULT_CATEGORIES = [
  "General", "Personal", "Work", "Ideas", "Archive"
];

function filterNotes(notes, query) {
  if (!query) return notes;
  const lower = query.toLowerCase();
  return notes.filter((note) =>
    (note.title && note.title.toLowerCase().includes(lower))
    || (note.content && note.content.toLowerCase().includes(lower))
    || (note.category && note.category.toLowerCase().includes(lower))
  );
}

// PUBLIC_INTERFACE
/** NoteEase Main Container */
function NoteEaseMain() {
  // State for all notes
  const [notes, setNotes] = useState([
    // Demo note
    {
      id: uuidv4(),
      title: "Welcome to NoteEase!",
      content: "You can create, edit, and organize your notes here.",
      category: "General",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  ]);
  // Active UI states
  const [selectedId, setSelectedId] = useState(notes[0]?.id);
  const [editingNote, setEditingNote] = useState(null); // if editing/creating note, stores note
  const [searchText, setSearchText] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [addingNote, setAddingNote] = useState(false);

  // PUBLIC_INTERFACE
  /** Handles adding a new note */
  function handleAddNote() {
    setEditingNote({
      title: "",
      content: "",
      category: categories[0] || "General",
    });
    setAddingNote(true);
    setShowEditor(true);
  }

  /** Handle note select from sidebar */
  function handleSelectNote(id) {
    setSelectedId(id);
    setShowEditor(false);
    setEditingNote(null);
    setAddingNote(false);
  }

  /** Handle editing selected note */
  function handleEditNote(note) {
    setEditingNote(note);
    setShowEditor(true);
    setAddingNote(false);
  }

  /** Handle deleting note */
  function handleDeleteNote(id) {
    if (
      window.confirm("Are you sure you want to delete this note? This action cannot be undone.")
    ) {
      setNotes((prev) => {
        const newNotes = prev.filter(n => n.id !== id);
        // If deleted note is selected, select another
        if (selectedId === id && newNotes.length > 0) {
          setSelectedId(newNotes[0].id);
        } else if (newNotes.length === 0) {
          setSelectedId(null);
        }
        return newNotes;
      });
      setShowEditor(false);
      setEditingNote(null);
    }
  }

  /** Handle create or update note */
  function handleSaveNote(noteObj) {
    if (!noteObj.title && !noteObj.content) {
      setShowEditor(false);
      setEditingNote(null);
      return;
    }
    if (addingNote) {
      // Creating new note
      const newId = uuidv4();
      setNotes([
        { ...noteObj, id: newId, createdAt: Date.now(), updatedAt: Date.now() },
        ...notes,
      ]);
      setSelectedId(newId);
    } else if (editingNote) {
      // Updating existing
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? { ...n, ...noteObj, updatedAt: Date.now() }
            : n
        )
      );
    }
    setShowEditor(false);
    setEditingNote(null);
    setAddingNote(false);
  }

  /** Cancel editing/creating */
  function handleCancelEdit() {
    setShowEditor(false);
    setEditingNote(null);
    setAddingNote(false);
  }

  // Combine all notes with search
  const visibleNotes = filterNotes(notes, searchText);

  // Selected note (for view)
  const selectedNote = notes.find((n) => n.id === selectedId);

  // PUBLIC_INTERFACE
  /** Handles category management: Only allows custom user categories (future functionality) */
  function handleAddCategory(cat) {
    if (cat && !categories.includes(cat)) {
      setCategories([...categories, cat]);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.secondary,
        color: THEME.text,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter,Roboto,Arial,sans-serif",
        letterSpacing: 0.01,
      }}
      className="noteease-root"
    >
      {/* Top Bar */}
      <header
        style={{
          borderBottom: `3px solid ${THEME.primary}`,
          padding: "19px 34px 19px 32px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 800,
        }}
      >
        <div style={{
          fontSize: 22,
          fontWeight: 600,
          color: THEME.primary,
          letterSpacing: 0.06,
          display: "flex",
          alignItems: "center"
        }}>
          📝 NoteEase
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ marginRight: 20 }}>
          <input
            type="text"
            value={searchText}
            placeholder="Search notes..."
            style={{
              padding: "8px 16px 8px 32px",
              borderRadius: 20,
              border: `1px solid ${THEME.primary}`,
              width: 240,
              fontSize: 15,
              background: "#f5f7fa 0% 0% no-repeat padding-box",
              backgroundImage: `url('data:image/svg+xml;utf8,<svg width="18" height="18" fill="gray" xmlns="http://www.w3.org/2000/svg"><path d="M12.44 13.44a7 7 0 1 1 1-1l4 4a1 1 0 0 1-1.41 1.41l-4-4zm-5.44-1.44a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/></svg>')`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "8px center",
              outline: "none",
            }}
            onChange={e => setSearchText(e.target.value)}
            data-testid="note-search"
          />
        </div>
        <button
          style={{
            background: THEME.primary,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            padding: "8px 26px",
            fontSize: 16,
            marginRight: 8,
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          data-testid="add-note-btn"
          onClick={handleAddNote}
        >
          + New Note
        </button>
      </header>
      {/* Main flex: Sidebar & Main Area */}
      <div style={{
        flex: 1,
        display: "flex",
        minHeight: 0,
        marginTop: 0,
      }}>
        {/* Sidebar - Notes list */}
        <aside
          style={{
            width: 310,
            background: THEME.sidebarBg,
            borderRight: `1.5px solid #dbe3ed`,
            padding: "26px 18px 10px 19px",
            overflowY: "auto",
            minHeight: 0,
            boxShadow: "0 0px 3px rgba(74,144,226,0.02)",
          }}
        >
          <div style={{
            fontWeight: 700,
            fontSize: 17,
            color: THEME.primary,
            marginBottom: 14,
            letterSpacing: 0.01
          }}>
            My Notes
          </div>
          {visibleNotes.length===0 && (
            <div style={{ color: "#999", marginTop: 40 }}>No notes found.</div>
          )}
          {visibleNotes.map(note => (
            <NoteListItem
              key={note.id}
              note={note}
              selected={selectedId === note.id}
              onClick={() => handleSelectNote(note.id)}
              onDelete={() => handleDeleteNote(note.id)}
              onEdit={() => handleEditNote(note)}
            />
          ))}
        </aside>
        {/* Main panel: View or Edit note */}
        <main
          style={{
            flex: 1,
            background: "#fff",
            minHeight: 0,
            padding: "38px 32px 28px 32px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Editor mode */}
          {showEditor && (
            <NoteEditor
              note={editingNote}
              onSave={handleSaveNote}
              onCancel={handleCancelEdit}
              categories={categories}
              isNew={addingNote}
            />
          )}
          {/* View mode */}
          {!showEditor && selectedNote && (
            <div>
              <div style={{
                fontSize: 25,
                fontWeight: 700,
                color: THEME.primary,
                marginBottom: 4,
                wordBreak: "break-word"
              }}>
                {selectedNote.title || <span style={{ color: "#888" }}>[Untitled]</span>}
              </div>
              <div style={{
                fontSize: 14,
                marginBottom: 7,
                color: THEME.text,
                fontWeight: 500
              }}>
                <span
                  style={{
                    background: THEME.accent,
                    color: "#fff",
                    borderRadius: 6,
                    padding: "0 10px",
                    marginRight: 8,
                  }}
                >{selectedNote.category}</span>
                <span style={{ color: "#888", fontWeight: 400 }}>
                  {selectedNote.updatedAt ? "Last edited "+(new Date(selectedNote.updatedAt)).toLocaleString() : ""}
                </span>
              </div>
              <div style={{
                minHeight: 55,
                color: "#252733",
                fontSize: 16,
                marginBottom: 23,
                whiteSpace: "pre-wrap",
                background: "#f4f9fb",
                borderRadius: 7,
                padding: "13px 12px",
                border: "1px solid #ebf5fb",
                maxWidth: 790,
                boxShadow: "0 2px 8px rgba(74, 144, 226, 0.05)",
                wordBreak: "break-word"
              }}>
                {selectedNote.content || <span style={{color:"#bbb"}}>No content for this note.</span>}
              </div>
              <div style={{display:"flex", gap:8}}>
                <button
                  style={{
                    background: THEME.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 500,
                    padding: "7px 30px",
                    fontSize: 15,
                    marginRight: 4,
                    cursor: "pointer"
                  }}
                  data-testid="edit-note-btn"
                  onClick={() => handleEditNote(selectedNote)}
                >
                  Edit
                </button>
                <button
                  style={{
                    background: "#f9f2f2",
                    color: "#e14d4d",
                    border: "1px solid #e6b3b3",
                    borderRadius: 6,
                    fontWeight: 500,
                    padding: "7px 24px",
                    fontSize: 15,
                    cursor: "pointer"
                  }}
                  data-testid="delete-note-btn"
                  onClick={() => handleDeleteNote(selectedNote.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
          {/* No note selected */}
          {!showEditor && !selectedNote && (
            <div style={{ color: "#bbb", fontSize: 18, marginTop: 60 }}>
              Select a note to view.
            </div>
          )}
        </main>
      </div>
      {/* Optionally, future category management below */}
    </div>
  );
}

export default NoteEaseMain;
