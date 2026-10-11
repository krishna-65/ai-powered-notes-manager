import NoteItem from './NoteItem.jsx';

export default function NoteList({ notes, isLoading, search, editingNoteId, deletingNoteId, onEdit, onDelete }) {
  if (isLoading) {
    return <p className="placeholder">Loading notes...</p>;
  }

  if (notes.length === 0) {
    return (
      <p className="placeholder">
        {search ? `No notes match "${search}".` : 'No notes yet. Create your first one.'}
      </p>
    );
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <NoteItem
          key={note._id}
          note={note}
          isEditing={note._id === editingNoteId}
          isDeleting={note._id === deletingNoteId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
