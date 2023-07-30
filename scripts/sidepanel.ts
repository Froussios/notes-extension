function addItem(text: string) {
  const el = document.createElement("li");
  el.innerHTML = "text";
  document.body.querySelector("ul")?.appendChild(el);
}

addItem("Worker online");

chrome.runtime.onMessage.addListener(({ name, data }) => {
  if (name === "show-notes") {
    addItem("123");
  }
});
