import { Note } from "./note";
import { Sync } from "./sync";

// Handles communication with a store. Does not do caching.
export interface NoteStore {
  // Fetches all notes stored in the store.
  getAllNotes(): Promise<Note[]>;

  // Sets the contents of the store to `notes`.
  persistAllNotes(notes: Note[]): Promise<void>;
}

// Store that uploads and syncs notes.
class NoteStoreSync implements NoteStore {
  async getAllNotes(): Promise<Note[]> {
    const notes = await Sync.downloadNotes();
    console.log("Downloaded", notes);

    console.assert(Array.isArray(notes));
    console.assert(notes.every((n: Note) => n.validate()));
    if (!notes.every((n: Note) => !!n.url)) {
      console.warn("Loaded note without url", notes);
    }

    return notes;
  }

  async persistAllNotes(notes: Note[]) {
    const str = JSON.stringify(notes);
    console.log(`Saving ${str.length} bytes`);
    await Sync.uploadNotes(notes);
  }
}

export const DefaultStore = new NoteStoreSync();