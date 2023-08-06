import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Note } from "./model/note";
import { calculateSimilarityScore } from "./util";
import "@spectrum-web-components/textfield/sp-textfield.js";
import "@spectrum-web-components/divider/sp-divider.js";
import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/theme/src/themes.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-globe.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-globe-clock.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-building.js";
import "@spectrum-web-components/button/sp-button.js";

@customElement("note-element")
export class NoteElement extends LitElement {
  @property({ type: Object }) note: Note | null = null;
  @property({ type: Boolean }) isNewNote = false;
  @property({ type: Boolean }) isDirty = false;
  @property({ type: String }) context: string | null = null;
  @property({ type: String, reflect: true, attribute: "scope" }) scope:
    | "exact"
    | "host"
    | "other" = "other";

  updateScope() {
    if (!this.context || !this.note) {
      this.scope = "other";
      return;
    }

    switch (calculateSimilarityScore(this.context, this.note.url)) {
      case 3:
        this.scope = "exact";
        break;
      case 2:
      case 1:
        this.scope = "host";
        break;
      default:
        this.scope = "other";
        break;
    }
  }

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

  updated() {
    this.updateScope();
  }

  render() {
    if (!this.note) return html`<i>No note</i>`;

    return html`
      <sp-theme scale="medium" color="light" theme="spectrum">
        <sp-textfield
          @input="${this.updateNoteTitle}"
          .value="${this.note?.title || ""}"
          placeholder="New note"
          quiet
        ></sp-textfield>
        ${this.renderUrlIcon()}
        <div class="url">${this.note?.url}</div>
        <sp-textfield
          @input=${this.updateNoteContent}
          .value="${this.note?.content || ""}"
          multiline
          placeholder="Empty"
        ></sp-textfield>
        <div>
          <sp-button
            variant="secondary"
            size="s"
            @click="${this.saveNote}"
            ?disabled=${!this.isDirty}
          >
            Save
          </sp-button>
          <sp-button
            variant="secondary"
            size="s"
            @click="${this.deleteNote}"
            ?disabled=${this.isNewNote}
          >
            Delete
          </sp-button>
        </div>
      </sp-theme>
    `;
  }

  renderUrlIcon() {
    switch (this.scope) {
      case "exact":
        return html`<sp-icon-globe></sp-icon-globe>`;
      case "host":
        return html`<sp-icon-building></sp-icon-building>`;
      case "other":
      default:
        return html``;
    }
  }

  static styles = css`
    :host {
      display: inline-block;
      padding: 10px;
      color: #333;
    }

    :host([scope="exact"]),
    :host([scope="host"]) {
      box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
      background-color: var(--spectrum-yellow-100);
      border: 1px solid var(--spectrum-yellow-200);
    }

    :host([scope="other"]) {
      background-color: var(--spectrum-gray-200);
      border: 1px solid var(--spectrum-gray-300);
    }

    div.url {
      overflow: hidden;
      font-weight: lighter;
      color: gray;
    }
  `;
}
