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
      <md-text-button @click="${this.openSidepanel}">
          Open sidepanel
      </md-text-button>
      <note-manager></note-manager>
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
      color: var(--md-sys-color-on-background);
      background: var(--md-sys-color-background);
    }
  `;
}
