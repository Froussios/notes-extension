import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Note } from "./model/note";
import { calculateSimilarityScore } from "./util";
import "@material/web/button/text-button";
import "@material/web/icon/icon";
import "@material/web/textfield/outlined-text-field";
import { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field";
import "@material/web/textfield/filled-text-field";
import "./compact_url";

const MIN_TEXTAREA_LINES = 3;

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

  @query('md-outlined-text-field') private readonly noteTextEl?: MdOutlinedTextField | null;

  updateScope() {
    if (!this.context || !this.note) {
      this.scope = "exact"; // TODO Should this be other?
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

  private getNoteLength() {
    if (!this.note) return 3;
    return Math.max(this.note.content.split('\n').length, MIN_TEXTAREA_LINES);
  }

  private updateNoteContent(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    if (this.note) {
      this.note.content = target.value;
    }
    this.noteTextEl!.rows = this.getNoteLength();
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

  private undeleteNote() {
    if (this.note) {
      this.note.undelete();
      this.isNewNote = false;
      this.isDirty = false;
    }
  }

  private deleteNote() {
    if (this.note) {
      this.note.delete();
      this.isNewNote = true;
      this.isDirty = true;

      this.requestUpdate();
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
    if (!!this.note.softDeleted)
      return html`
        <md-text-button @click="${this.undeleteNote}">
          Undo delete
        </md-text-button>
      `;

    return html`
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet">
        <link rel="stylesheet" href="css/theme.css">
        <md-filled-text-field
          @input="${this.updateNoteTitle}"
          .value="${this.note?.title || ""}"
          placeholder="New note"
        ></md-filled-text-field>
        ${this.renderUrlIcon()}
        <compact-url url=${this.note?.url}></compact-url>
        <md-outlined-text-field
          @input=${this.updateNoteContent}
          .value="${this.note?.content || ""}"
          type="textarea"
          placeholder="Empty"
          rows=${this.getNoteLength()}
        ></md-outlined-text-field>
        <div>
          <md-text-button
            @click="${this.saveNote}"
            ?disabled=${!this.isDirty}
          >
            Save
          </md-text-button>
          <md-text-button
            @click="${this.deleteNote}"
            ?disabled=${this.isNewNote}
          >
            Delete
          </md-text-button>
        </div>
    `;
  }

  renderUrlIcon() {
    switch (this.scope) {
      case "exact":
        return html``;
      case "host":
        return html`<i class="material-icons" translate="no">domain</i>`;
      default:
        return html`<i class="material-icons" translate="no">public</i>`;
    }
  }

  static styles = css`
    :host {
      display: inline-block;
      padding: 10px;
      color: var(--md-sys-color-on-background);
      background: var(--md-sys-color-background);
      box-sizing: border-box;
    }

    :host([scope="exact"]),
    :host([scope="host"]) {
      box-shadow: 2px 2px 5px var(--md-sys-color-shadow);
      background-color: var(--md-sys-color-tertiary-container);
      border: 1px solid var(--md-sys-color-outline);
    }

    :host([scope="other"]) {
      border: 1px solid var(--md-sys-color-outline-variant);
    }

    md-filled-text-field {
      --md-filled-text-field-container-color: transparent;
      --md-filled-text-field-top-space: 0px;
      --md-filled-text-field-bottom-space: 0px;
      --md-filled-text-field-leading-space: 2px;
      --md-filled-text-field-trailing-space: 2px;
    }

    md-outlined-text-field {
      --md-outlined-text-field-container-shape: 2px;
      --md-outlined-text-field-top-space: 2px;
      --md-outlined-text-field-bottom-space: 2px;
      --md-outlined-field-leading-space: 0px;
      --md-outlined-field-trailing-space: 0px;
      --md-outlined-field-outline-color: var(--md-sys-color-outline-variant);
      --md-outlined-text-field-input-text-type: 350 0.8rem/1rem Roboto;
      width: 100%;
      margin-top: 4px;
    }
  `;
}
