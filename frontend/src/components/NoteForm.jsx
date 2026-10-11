import { useEffect, useState } from 'react';
import { improveNoteContent, getErrorMessage } from '../api/notesApi.js';

const TITLE_MAX_LENGTH = 120;
const CONTENT_MAX_LENGTH = 10000;

const NO_FIELD_ERRORS = { title: '', content: '' };

export default function NoteForm({ editingNote, onSubmit, onCancelEdit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fieldErrors, setFieldErrors] = useState(NO_FIELD_ERRORS);
  const [aiError, setAiError] = useState('');
  const [contentBeforeImprove, setContentBeforeImprove] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  useEffect(() => {
    setTitle(editingNote?.title ?? '');
    setContent(editingNote?.content ?? '');
    setContentBeforeImprove(null);
    setFieldErrors(NO_FIELD_ERRORS);
    setAiError('');
  }, [editingNote]);

  function resetForm() {
    setTitle('');
    setContent('');
    setContentBeforeImprove(null);
    setFieldErrors(NO_FIELD_ERRORS);
    setAiError('');
  }

  function handleTitleChange(event) {
    setTitle(event.target.value);
    if (fieldErrors.title) setFieldErrors((current) => ({ ...current, title: '' }));
  }

  function handleContentChange(event) {
    setContent(event.target.value);
    if (fieldErrors.content) setFieldErrors((current) => ({ ...current, content: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {
      title: title.trim() ? '' : 'Title is required',
      content: content.trim() ? '' : 'Content is required',
    };
    setFieldErrors(nextErrors);
    if (nextErrors.title || nextErrors.content) return;

    setAiError('');
    setIsSaving(true);
    try {
      const saved = await onSubmit({ title: title.trim(), content: content.trim() });
      if (saved) resetForm();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImproveNote() {
    if (!content.trim()) {
      setFieldErrors((current) => ({ ...current, content: 'Write some content before improving it.' }));
      return;
    }

    setAiError('');
    setIsImproving(true);
    try {
      const improvedContent = await improveNoteContent(content.trim());
      setContentBeforeImprove(content);
      setContent(improvedContent.slice(0, CONTENT_MAX_LENGTH));
    } catch (requestError) {
      setAiError(getErrorMessage(requestError, 'Could not improve the note right now.'));
    } finally {
      setIsImproving(false);
    }
  }

  function handleUndoImprove() {
    setContent(contentBeforeImprove);
    setContentBeforeImprove(null);
  }

  const isBusy = isSaving || isImproving;
  const isTitleAtLimit = title.length >= TITLE_MAX_LENGTH;
  const isContentAtLimit = content.length >= CONTENT_MAX_LENGTH;

  return (
    <section className="form-panel">
      <form className="note-form" onSubmit={handleSubmit} noValidate>
        <h2>{editingNote ? 'Edit note' : 'New note'}</h2>

        <label htmlFor="title">
          Title <span className="required-mark" aria-hidden="true">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="Client meeting"
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby="title-feedback"
          className={fieldErrors.title ? 'field-invalid' : undefined}
          onChange={handleTitleChange}
        />
        <FieldFeedback
          id="title-feedback"
          error={fieldErrors.title}
          length={title.length}
          maxLength={TITLE_MAX_LENGTH}
          isAtLimit={isTitleAtLimit}
        />

        <label htmlFor="content">
          Content <span className="required-mark" aria-hidden="true">*</span>
        </label>
        <textarea
          id="content"
          rows={8}
          value={content}
          maxLength={CONTENT_MAX_LENGTH}
          placeholder="meeting with client tomorrow discuss project"
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.content)}
          aria-describedby="content-feedback"
          className={fieldErrors.content ? 'field-invalid' : undefined}
          onChange={handleContentChange}
        />
        <FieldFeedback
          id="content-feedback"
          error={fieldErrors.content}
          length={content.length}
          maxLength={CONTENT_MAX_LENGTH}
          isAtLimit={isContentAtLimit}
        />

        {aiError && <p className="form-error">{aiError}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isBusy}>
            {isSaving ? 'Saving...' : editingNote ? 'Update note' : 'Save note'}
          </button>

          <button type="button" className="btn btn-ai" onClick={handleImproveNote} disabled={isBusy}>
            {isImproving ? 'Improving...' : 'Improve with AI'}
          </button>

          {contentBeforeImprove !== null && (
            <button type="button" className="btn btn-ghost" onClick={handleUndoImprove} disabled={isBusy}>
              Undo AI edit
            </button>
          )}

          {editingNote && (
            <button type="button" className="btn btn-ghost" onClick={onCancelEdit} disabled={isBusy}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function FieldFeedback({ id, error, length, maxLength, isAtLimit }) {
  const message = error || (isAtLimit ? `Maximum ${maxLength} characters reached` : '');

  return (
    <div className="field-feedback" id={id}>
      <span className={error ? 'field-error' : 'field-limit-note'} role={error ? 'alert' : undefined}>
        {message}
      </span>
      <span className={isAtLimit ? 'field-counter field-counter-full' : 'field-counter'}>
        {length} / {maxLength}
      </span>
    </div>
  );
}
