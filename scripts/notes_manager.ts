import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Note } from "./model/note";
import { Relevance, calculateSimilarityScore } from "./util";
import "@material/web/button/filled-button";
import "@material/web/divider/divider";
import { DefaultStore } from "./model/note_backend";

function generateRandomId(): string {
  return Math.random().toString(36).substr(2, 9); // Generate a random string as an ID
}

async function getCurrentTab(): Promise<chrome.tabs.Tab> {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

class NoteManagerBase extends LitElement {
  @property({ type: String }) currentUrl: string | null = null;

  protected notes: Note[] = [];

  constructor() {
    super();
    this.notes = [];
  }

  /** Show the active tab url. */
  protected async refreshContext() {
    const tab = await getCurrentTab();
    if (!tab?.url) return;
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

    const allNotes = await DefaultStore.getAllNotes();
    this.notes = allNotes.filter(note => !note.softDeleted);
    this.requestUpdate();
  }

  protected prioritiseNote(note: Note | null | undefined): Relevance {
    if (!this.currentUrl || !note || !note.url) return 0;
    return calculateSimilarityScore(this.currentUrl, note.url);
  }

  protected createNote() {
    const newNote = new Note(
      generateRandomId(),
      "New Note",
      "",
      this.currentUrl || "Invalid"
    );
    this.notes.unshift(newNote);
    this.requestUpdate();
  }
}

@customElement("note-manager-compact")
export class NoteManagerCompact extends NoteManagerBase {
  private get hostNotes(): Note[] {
    const notes = this.notes.filter((note) => this.prioritiseNote(note) >= Relevance.SAME_HOST)
      .sort((a, b) => a.lastEdit.getUTCMilliseconds() - b.lastEdit.getUTCMilliseconds());
    if (notes.length > 0) return [notes[0]];
    return [];
  }

  renderNote(note: Note) {
    return html`<note-element
      .note="${note}"
      .isNewNote=${false}
      .context=${this.currentUrl}
    ></note-element>`;
  }

  renderNoNote() {
    return html`
      <md-divider></md-divider>
      <span>
        <md-filled-button @click="${this.createNote}">
          Create Note
        </md-filled-button>
        <div class="context label-medium">for ${this.currentUrl}</div>
      </span>
    `;
  }

  render() {
    const notes = this.hostNotes;
    return html`
      <div>
        <link rel="stylesheet" href="css/theme.css">
        ${notes.length > 0 ? this.renderNote(notes[0]) : this.renderNoNote()}
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

@customElement("note-manager")
export class NoteManager extends NoteManagerBase {
  private get hostNotes(): Note[] {
    return this.notes.filter((note) => this.prioritiseNote(note) >= Relevance.SAME_HOST);
  }
  private get otherNotes(): Note[] {
    return this.notes.filter((note) => this.prioritiseNote(note) <= Relevance.NONE);
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
