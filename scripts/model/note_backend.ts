import { Note } from "./note";
import { Sync } from "./sync";

// Handles communication with a store. Does not do caching.
export interface NoteStore {
  // Fetches all notes stored in the store.
  getAllNotes(): Promise<Note[]>;

  // Insert `note` in the store. `note` must have a unique id.
  insert(note: Note): Promise<void>;

  // Updates `note` in the store, as identified by the id.
  update(note: Note): Promise<void>;

  // Update or insert `note`.
  updateOrInsert(note: Note): Promise<void>;

  // Hard-deletes `note` from the store, as identified by the id.
  delete(note: Note): Promise<void>;
}

// Store that uploads and syncs notes.
export class NoteStoreSync {
  async getAllNotes(): Promise<Note[]> {
    console.log("Downloading from sync.");
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
    console.log("Saving to sync.");
    const str = JSON.stringify(notes);
    console.log(`Saving ${str.length} bytes`);
    await Sync.uploadNotes(notes);
  }
}

export class NoteStoreImpl implements NoteStore {
  store: NoteStoreSync;

  constructor(backend: NoteStoreSync | undefined = undefined) {
    this.store = backend || new NoteStoreSync();
  }

  async getAllNotes(): Promise<Note[]> {
    return this.store.getAllNotes();
  }

  private async persistAllNotes(notes: Note[]) {
    return this.store.persistAllNotes(notes);
  }

  async insert(note: Note): Promise<void> {
    const notes = await this.getAllNotes();
    const index = notes.findIndex((n: Note) => n.id === note.id);

    if (index === -1)
      notes.push(note);
    else
      throw new Error(`Note ${note.id} already exists`);

    this.persistAllNotes(notes);
  }

  async update(note: Note): Promise<void> {
    const notes = await this.getAllNotes();
    const index = notes.findIndex((n: Note) => n.id === note.id);

    if (index !== -1)
      notes[index] = note;
    else
      throw new Error(`Note ${note.id} does not exist to be updated. Insert it first.`);

    this.persistAllNotes(notes);
  }

  async updateOrInsert(note: Note): Promise<void> {
    const notes = await this.getAllNotes();
    const index = notes.findIndex((n: Note) => n.id === note.id);

    if (index !== -1)
      notes[index] = note;
    else
      notes.push(note);

    this.persistAllNotes(notes);
  }

  async delete(note: Note): Promise<void> {
    const notes = await this.getAllNotes();
    const index = notes.findIndex((n: Note) => n.id === note.id);

    if (index !== -1)
      notes.splice(index, 1);

    this.persistAllNotes(notes);
  }
}

export const DefaultStore = new NoteStoreImpl();