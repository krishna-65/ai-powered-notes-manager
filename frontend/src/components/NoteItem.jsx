function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function NoteItem({ note, isEditing, isDeleting, onEdit, onDelete }) {
  const wasUpdated = note.updatedAt !== note.createdAt;

  return (
    <li className={isEditing ? 'note-card note-card-editing' : 'note-card'}>
      <h3>{note.title}</h3>
      <p className="note-content">{note.content}</p>

      <div className="note-footer">
        <span className="note-dates">
          Created {formatDate(note.createdAt)}
          {wasUpdated && ` · Updated ${formatDate(note.updatedAt)}`}
        </span>

        <div className="note-actions">
          <button type="button" className="btn btn-small" onClick={() => onEdit(note)}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn-small btn-danger"
            onClick={() => onDelete(note._id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </li>
  );
}
