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
    if (!this.context || !this.note)
      return html`<sp-icon-globe-clock></sp-icon-globe-clock>`;
    switch (calculateSimilarityScore(this.context, this.note.url)) {
      case 3:
        return html`<sp-icon-globe></sp-icon-globe>`;
      case 2:
      case 1:
        return html`<sp-icon-building></sp-icon-building>`;
      default:
        return html``;
    }
  }

  static styles = css`
    :host {
      display: inline-block;
    }

    div.url {
      overflow: hidden;
      font-weight: lighter;
      color: gray;
    }
  `;
}
