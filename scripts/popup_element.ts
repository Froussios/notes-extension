import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@material/web/button/filled-button";
import "@material/web/divider/divider";
import "@material/web/button/text-button";
import "@material/web/icon/icon";

@customElement("note-popup")
export class NoteManager extends LitElement {
  async firstUpdated() {
  }

  render() {
    return html`
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      <md-filled-button @click="${this.openSidepanel}">
          View more notes
          <i slot="icon" class="material-icons" translate="no">arrow_outward</i>
      </md-filled-button>
      <md-divider></md-divider>
      <note-manager-compact></note-manager-compact>
    `;
  }

  async openSidepanel() {
    const windowId = (await chrome.windows.getCurrent()).id;
    chrome.sidePanel.open({ windowId });
    window.close();
  }

  static styles = css`
    :host {
      display: inline-block;
      width: 100%;
      min-width: 240px;
      color: var(--md-sys-color-on-background);
      background: var(--md-sys-color-background);
    }

    md-divider {
      margin: 4px 0 10px 0;
      width: 100%;
    }

    .material-icons {
      font-size: 20px;
    }

    i {
      width: 20px;
      height: 20px;
    }
  `;
}
