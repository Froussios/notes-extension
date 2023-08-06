import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Note } from "./model/note";
import "@spectrum-web-components/divider/sp-divider.js";
import "@spectrum-web-components/button/sp-button.js";
import { calculateSimilarityScore } from "./util";

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

  firstUpdated() {
    this.refreshContext();

    chrome.tabs.onActivated.addListener(() => {
      this.refreshContext();
    });
  }

  render() {
    return html`
      <sp-theme scale="medium" color="light" theme="spectrum">
        <span>
          <sp-button @click="${this.createNote}">Create Note</sp-button>
          <div>for ${this.currentUrl}</div>
        </span>
        <sp-divider size="l"></sp-divider>
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
      margin: 4px 0 10px 0;
      width: 100%;
    }
  `;
}
