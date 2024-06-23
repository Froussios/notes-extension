import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import * as path from "path-browserify";


@customElement("compact-url")
class CompactUrl extends LitElement {
  @property({ type: String }) url: string | null = null;

  UrlParts() {
    try {
      const parsed = new URL(this.url || "");
      return {
        host: parsed.host,
        path: path.dirname(parsed.pathname),
        item: `/${path.basename(parsed.pathname)}`
      };
    }
    catch (e) {
      return {
        host: this.url,
        path: "",
        item: ""
      };
    }
  }

  render() {
    const parts = this.UrlParts();
    return html`
      <a href=${this.url || ""} class="three-part-container">
        <span class="host">${parts.host}</span>
        <span class="path">${parts.path}</span>
        <span class="resource">${parts.item}</span>
      </a>
    `;
  }

  static styles = css`
    :host {
      display: inline;
      margin-inline: 2px;
    }

    .three-part-container {
      color: var(--md-sys-color-secondary);
      display: flex;  /* Enables flexbox for easy control */
      white-space: nowrap;
      max-width: max-content;
    }

    .path {
      flex: 1;  /* Grows to fill available space */
      overflow: hidden;  /* Hides excess content */
      text-overflow: ellipsis;  /* Adds ellipsis (...) if content overflows */
    }
  `;
}
