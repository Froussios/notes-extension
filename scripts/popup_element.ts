import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Note } from "./model/note";
import { calculateSimilarityScore } from "./util";
import "@material/web/button/filled-button";
import "@material/web/divider/divider";
import { DefaultStore } from "./model/note_backend";
import "@material/web/button/text-button";

@customElement("note-popup")
export class NoteManager extends LitElement {
  async firstUpdated() {
  }

  render() {
    return html`
      <md-filled-button @click="${this.openSidepanel}">
          Open sidepanel
      </md-filled-button>
      <md-divider></md-divider>
      <note-manager-compact></note-manager-compact>
    `;
  }

  async openSidepanel() {
    const windowId = (await chrome.windows.getCurrent()).id;
    chrome.sidePanel.open({ windowId });
  }

  static styles = css`
    :host {
      display: inline-block;
      width: 100%;
      min-width: 240px;
      color: var(--md-sys-color-on-background);
      background: var(--md-sys-color-background);
    }
  `;
}
