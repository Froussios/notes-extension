import { LitElement } from "lit-element";
import { customElement } from "lit-element/decorators";

function SetContext(urls: string[]) {
  if (urls.length === 0) return; // TODO clear?
  if (urls.length > 1) console.warn("Multiple contexts", urls);
  document.getElementById("title").innerText = urls[0];
}

function Querycontext() {
  chrome.tabs.query({ active: true }, (result: chrome.tabs.Tab[]) => {
    SetContext(result.map((tab) => tab.url));
  });
}

Querycontext();
setInterval(Querycontext, 2000);

customElement("test-test");
class Test extends LitElement {}
