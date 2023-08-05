import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Note } from "./model/note";

@customElement("note-element")
export class NoteElement extends LitElement {
  @property({ type: Object }) note: Note | null = null;
  @property({ type: Boolean }) isNewNote = false;

  static styles = css`
    /* Add your custom styles here */
  `;

  constructor() {
    super();
    // If note prop is not set, create a new note
    if (!this.note) {
      this.note = new Note(this.generateRandomId(), "New Note", "");
      this.isNewNote = true;
    }
  }

  private updateNoteTitle(event: Event) {
    const target = event.target as HTMLInputElement;
    if (this.note) {
      this.note.title = target.value;
    }
    this.requestUpdate();
  }

  private updateNoteContent(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    if (this.note) {
      this.note.content = target.value;
    }
    this.requestUpdate();
  }

  private saveNote() {
    if (this.note) {
      this.note.save();
      this.isNewNote = false;
    }
  }

  private deleteNote() {
    if (this.note) {
      this.note.delete();
      this.isNewNote = true;
    }
  }

  private generateRandomId(): string {
    // Generate a random string as an ID.
    return Math.random().toString(36).substr(2, 9);
  }

  render() {
    return html`
      <div>
        <input
          type="text"
          .value="${this.note?.title || ""}"
          @input="${this.updateNoteTitle}"
          placeholder="Title"
        />
        <textarea
          @input="${this.updateNoteContent}"
          .value="${this.note?.content || ""}"
          placeholder="Content"
        ></textarea>
        <button @click="${this.saveNote}">Save</button>
        ${!this.isNewNote
          ? html`<button @click="${this.deleteNote}">Delete</button>`
          : ""}
      </div>
    `;
  }
}