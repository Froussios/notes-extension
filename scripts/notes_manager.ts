import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Note } from "./model/note";
import "@spectrum-web-components/divider/sp-divider.js";

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

function calculateSimilarityScore(url1: string, url2: string): number {
  const parsedUrl1 = new URL(url1);
  const parsedUrl2 = new URL(url2);

  // Calculate score for same host and path
  if (
    parsedUrl1.host === parsedUrl2.host &&
    parsedUrl1.pathname === parsedUrl2.pathname
  ) {
    return 3;
  }

  // Calculate score for same host and partial path match
  if (
    parsedUrl1.host === parsedUrl2.host &&
    parsedUrl1.pathname.includes(parsedUrl2.pathname)
  ) {
    return 2;
  }

  // Calculate score for same host
  if (parsedUrl1.host === parsedUrl2.host) {
    return 1;
  }

  // Calculate score for everything else
  return 0;
}

@customElement("note-manager")
export class NoteManager extends LitElement {
  @property({ type: String }) currentUrl: string | null = null;

  private notes: Note[] = [];

  constructor() {
    super();
    // Load existing notes from localStorage
    this.notes = Note.getAllNotes();
  }

  private createNote() {
    const newNote = new Note(
      this.generateRandomId(),
      "New Note",
      "",
      this.currentUrl || "Invalid"
    );
    this.notes.push(newNote);
    this.requestUpdate();
  }

  private generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9); // Generate a random string as an ID
  }

  /** Show the active tab url. */
  private async refreshContext() {
    const tabs = await QueryContext();
    this.currentUrl = tabs.filter((tab) => !!tab.url)[0].url!;

    // TODO only when context changes
    this.notes.sort(
      (n1, n2) =>
        calculateSimilarityScore(n2.url, this.currentUrl || "") -
        calculateSimilarityScore(n1.url, this.currentUrl || "")
    );
    this.requestUpdate();
  }

  firstUpdated() {
    this.refreshContext();

    setInterval(() => {
      this.refreshContext();
    }, 2000);
  }

  render() {
    return html`
      <sp-theme scale="medium" color="light" theme="spectrum">
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
              <sp-divider size="m"></sp-divider>
            `
        )}
      </sp-theme>
    `;
  }

  static styles = css`
    :host {
      display: inline-block;
      width: 100%;
    }

    note-element {
      width: 100%;
    }

    sp-divider {
      margin: 4px 0;
      width: 100%;
    }
  `;
}
