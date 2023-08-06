import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Note } from "./model/note";

@customElement("note-element")
export class NoteElement extends LitElement {
  @property({ type: Object }) note: Note | null = null;
  @property({ type: Boolean }) isNewNote = false;
  @property({ type: Boolean }) isDirty = false;
  @property({ type: String }) context: string | null = null;

  constructor() {
    super();
    // If note prop is not set, create a new note
    if (!this.note && this.context) {
      this.note = new Note(
        this.generateRandomId(),
        "New Note",
        "",
        this.context
      );
      this.isNewNote = true;
      this.isDirty = true;
    }
  }

  private updateNoteTitle(event: Event) {
    const target = event.target as HTMLInputElement;
    if (this.note) {
      this.note.title = target.value;
    }
    this.isDirty = true;
    this.requestUpdate();
  }

  private updateNoteContent(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    if (this.note) {
      this.note.content = target.value;
    }
    this.isDirty = true;
    this.requestUpdate();
  }

  private saveNote() {
    if (this.note) {
      this.note.save();
      this.isNewNote = false;
      this.isDirty = false;
    }
  }

  private deleteNote() {
    if (this.note) {
      this.note.delete();
      this.isNewNote = true;
      this.isDirty = true;
    }
  }

  private generateRandomId(): string {
    // Generate a random string as an ID.
    return Math.random().toString(36).substr(2, 9);
  }

  render() {
    if (!this.note) return html`<i>No note</i>`;

    return html`
      <div>
        <h3>${this.note?.url}</h3>
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
        <button @click="${this.saveNote}" ?disabled=${!this.isDirty}>
          Save
        </button>
        <button @click="${this.deleteNote}" ?disabled=${this.isNewNote}>
          Delete
        </button>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: inline-block;
      border: 1px solid gray;
      width: 200px;
    }
  `;
}
