import { Note } from "./model/note";
import { NoteStoreImpl, NoteStoreWebSync } from "./model/note_backend";

chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
    chrome.sidePanel.open({
        tabId: tab.id
    });
});

const store = new NoteStoreWebSync();

// Push updates to all surfaces, every time the store is updated.
// This is for completeness. The server doesn't push updates currently.
store.receive(notes => {
    chrome.runtime.sendMessage({
        type: "notesUpdate",
        notes
    });
});

chrome.runtime.onMessage.addListener((message, sender, respond: (notes: any) => void) => {
    const notes = message["notes"];
    switch (message["type"]) {
        case "push":
            if (!Array.isArray(notes)) throw new Error("Received non Notes[]", notes);
            store.push(notes);
            // Update all surfaces.
            chrome.runtime.sendMessage({
                type: "notesUpdate",
                notes
            });
            break;
        case "pull":
            store.pull().then(notes => respond(notes));
            break;
    }
    return true;
});