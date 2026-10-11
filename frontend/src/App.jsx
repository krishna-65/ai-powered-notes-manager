import { useCallback, useEffect, useState } from 'react';
import NoteForm from './components/NoteForm.jsx';
import NoteList from './components/NoteList.jsx';
import { fetchNotes, createNote, updateNote, deleteNote, getErrorMessage } from './api/notesApi.js';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotes = useCallback(async (searchTerm) => {
    setIsLoading(true);
    try {
      setNotes(await fetchNotes(searchTerm));
      setError('');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not load notes. Is the server running?'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounced so typing in the search box does not fire a request per keystroke.
    const timer = setTimeout(() => loadNotes(search), 300);
    return () => clearTimeout(timer);
  }, [search, loadNotes]);

  async function handleSubmit(note) {
    try {
      if (editingNote) {
        const updated = await updateNote(editingNote._id, note);
        setNotes((current) => current.map((item) => (item._id === updated._id ? updated : item)));
        setEditingNote(null);
      } else {
        const created = await createNote(note);
        setNotes((current) => [created, ...current]);
      }
      setError('');
      return true;
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not save the note.'));
      return false;
    }
  }

  async function handleDelete(noteId) {
    if (!window.confirm('Delete this note?')) return;

    setDeletingNoteId(noteId);
    try {
      await deleteNote(noteId);
      setNotes((current) => current.filter((note) => note._id !== noteId));
      if (editingNote?._id === noteId) setEditingNote(null);
      setError('');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not delete the note.'));
    } finally {
      setDeletingNoteId(null);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI-Powered Notes</h1>
        <p>Write a note and let AI polish it.</p>
      </header>

      {error && (
        <div className="banner banner-error" role="alert">
          <span>{error}</span>
          <button type="button" className="banner-close" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}

      <main className="layout">
        <NoteForm
          editingNote={editingNote}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingNote(null)}
        />

        <section className="notes-panel">
          <div className="notes-toolbar">
            <h2>Your notes</h2>
            <input
              type="search"
              className="search-input"
              placeholder="Search by title..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <NoteList
            notes={notes}
            isLoading={isLoading}
            search={search}
            editingNoteId={editingNote?._id}
            deletingNoteId={deletingNoteId}
            onEdit={setEditingNote}
            onDelete={handleDelete}
          />
        </section>
      </main>
    </div>
  );
}
