import { LitElement, html } from "lit";
import { customElement } from "lit/decorators";

@customElement("notes-test")
export class Test extends LitElement {
  render() {
    return html`<span>testtest</span>`;
  }
}
