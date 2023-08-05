import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { Note } from "./model/note";

@customElement("note-manager")
export class NoteManager extends LitElement {
  static styles = css`
    /* Add your custom styles here */
  `;

  private notes: Note[] = [];

  constructor() {
    super();
    // Load existing notes from localStorage
    const notesFromStorage = Note.getAllNotes();
    this.notes = notesFromStorage.map(
      (noteData: any) => new Note(noteData.id, noteData.title, noteData.content)
    );
  }

  private createNote() {
    const newNote = new Note(this.generateRandomId(), "New Note", "");
    this.notes.push(newNote);
    this.saveNotesToStorage();
    this.requestUpdate();
  }

  private deleteNote(note: Note) {
    const index = this.notes.indexOf(note);
    if (index !== -1) {
      this.notes.splice(index, 1);
      this.saveNotesToStorage();
      this.requestUpdate();
    }
  }

  private saveNotesToStorage() {
    const notesData = this.notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
    }));
    localStorage.setItem("notes", JSON.stringify(notesData));
  }

  private generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9); // Generate a random string as an ID
  }

  render() {
    return html`
      <button @click="${this.createNote}">Create Note</button>
      ${this.notes.map(
        (note) =>
          html`
            <note-element .note="${note}" .isNewNote=${false}></note-element>
          `
      )}
    `;
  }
}
