import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Note } from "./model/note";
import { calculateSimilarityScore } from "./util";
import "@material/web/button/filled-button";
import "@material/web/divider/divider";

async function getCurrentTab(): Promise<chrome.tabs.Tab> {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

@customElement("note-manager")
export class NoteManager extends LitElement {
  @property({ type: String }) currentUrl: string | null = null;

  private notes: Note[] = [];

  private get hostNotes(): Note[] {
    return this.notes.filter((note) => this.prioritiseNote(note) >= 1);
  }
  private get otherNotes(): Note[] {
    return this.notes.filter((note) => this.prioritiseNote(note) <= 0);
  }

  constructor() {
    super();
    this.notes = [];
  }

  private createNote() {
    const newNote = new Note(
      this.generateRandomId(),
      "New Note",
      "",
      this.currentUrl || "Invalid"
    );
    this.notes.unshift(newNote);
    this.requestUpdate();
  }

  private generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9); // Generate a random string as an ID
  }

  /** Show the active tab url. */
  private async refreshContext() {
    const tab = await getCurrentTab();
    if (!tab.url) return;
    if (this.currentUrl === tab.url) return;

    this.currentUrl = tab.url;
    this.notes.sort(
      (n1, n2) =>
        calculateSimilarityScore(n2.url, this.currentUrl || "") -
        calculateSimilarityScore(n1.url, this.currentUrl || "")
    );
    this.requestUpdate();
  }

  async firstUpdated() {
    this.refreshContext();

    chrome.tabs.onActivated.addListener(() => this.refreshContext());
    chrome.tabs.onUpdated.addListener(() => this.refreshContext());

    const allNotes = await Note.getAllNotes();
    this.notes = allNotes.filter(note => !note.softDeleted);
  }

  prioritiseNote(note: Note | null | undefined) {
    if (!this.currentUrl || !note || !note.url) return 0;
    return calculateSimilarityScore(this.currentUrl, note.url);
  }

  render() {
    return html`
      <div>
        <link rel="stylesheet" href="css/theme.css">
        <span>
          <md-filled-button @click="${this.createNote}">Create Note</md-filled-button>
          <div class="context label-medium">for ${this.currentUrl}</div>
        </span>
        <md-divider></md-divider>
        ${this.hostNotes.map(
      (note) =>
        html`
              <note-element
                .note="${note}"
                .isNewNote=${false}
                .context=${this.currentUrl}
              ></note-element>
              <md-divider></md-divider>
            `
    )}
        <h3 class="title-medium">Everything else</h3>
        <md-divider></md-divider>
        ${this.otherNotes.map(
      (note) =>
        html`
              <note-element
                .note="${note}"
                .isNewNote=${false}
                .context=${this.currentUrl}
              ></note-element>
              <md-divider></md-divider>
            `
    )}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: inline-block;
      width: 100%;
      color: var(--md-sys-color-on-background);
      background: var(--md-sys-color-background);
    }

    .context {
      margin-top: 2px;
      margin-inline: 8px;
      color: var(--md-sys-color-secondary);
    }

    note-element {
      width: 100%;
    }

    md-divider {
      margin: 4px 0 10px 0;
      width: 100%;
    }
  `;
}
