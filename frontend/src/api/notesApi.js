import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? fallback;
}

export async function fetchNotes(search = '') {
  const { data } = await api.get('/notes', { params: search ? { search } : {} });
  return data.data;
}

export async function createNote(note) {
  const { data } = await api.post('/notes', note);
  return data.data;
}

export async function updateNote(noteId, note) {
  const { data } = await api.put(`/notes/${noteId}`, note);
  return data.data;
}

export async function deleteNote(noteId) {
  await api.delete(`/notes/${noteId}`);
}

export async function improveNoteContent(content) {
  const { data } = await api.post('/ai/improve-note', { content });
  return data.data.improvedContent;
}
