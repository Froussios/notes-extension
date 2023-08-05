import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Note } from "./model/note";

/**
 @returns the active tabs.
 */
export function QueryContext(): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true }, (result: chrome.tabs.Tab[]) => {
      resolve(result);
    });
  });
}

@customElement("note-manager")
export class NoteManager extends LitElement {
  @property({ type: String }) currentUrl: string | null = null;

  static styles = css`
    /* Add your custom styles here */
  `;

  private notes: Note[] = [];

  constructor() {
    super();
    // Load existing notes from localStorage
    const notesFromStorage = Note.getAllNotes();
    this.notes = notesFromStorage.map(
      (noteData: any) =>
        new Note(noteData.id, noteData.title, noteData.content, noteData.url)
    );
  }

  private createNote() {
    const newNote = new Note(
      this.generateRandomId(),
      "New Note",
      "",
      this.currentUrl || "Invalid"
    );
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

  /** Show the active tab url. */
  private async refreshContext() {
    const tabs = await QueryContext();
    this.currentUrl = tabs.filter((tab) => !!tab.url)[0].url!;
  }

  firstUpdated() {
    this.refreshContext();

    setInterval(() => {
      this.refreshContext();
    }, 2000);
  }

  render() {
    return html`
      <button @click="${this.createNote}">Create Note</button>
      <h2>${this.currentUrl}</h2>
      ${this.notes.map(
        (note) =>
          html`
            <note-element
              .note="${note}"
              .isNewNote=${false}
              .context=${this.currentUrl}
            ></note-element>
          `
      )}
    `;
  }
}
