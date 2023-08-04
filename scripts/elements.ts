import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, state, property } from "lit/decorators";

/**
 *
 * @returns the active tabs.
 */
export function QueryContext(): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true }, (result: chrome.tabs.Tab[]) => {
      resolve(result);
    });
  });
}

@customElement("notes-context")
export class Context extends LitElement {
  @property() url = "Loading";

  render() {
    return html`<h2>${this.url}</h2>`;
  }

  /** Show the active tab url. */
  async refreshContext() {
    const tabs = await QueryContext();
    this.url = tabs.filter((tab) => !!tab.url)[0].url!;
  }

  firstUpdated() {
    this.refreshContext();

    setInterval(() => {
      this.refreshContext();
    }, 2000);
  }
}
