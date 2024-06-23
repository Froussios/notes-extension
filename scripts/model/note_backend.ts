import { Note } from "./note";
import { Sync } from "./sync";
import { Observable, BehaviorSubject, distinctUntilChanged, map } from "rxjs";

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

  // Get the set of notes every time an update is pushed.
  get noteUpdates(): Observable<Note[]>;
}

function arraysEqual<T>(a: Array<T>, b: Array<T>) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

type receiveCallback = (notes: Note[]) => void;
export interface NoteStorePushPull {
  pull(): Promise<Note[]>;
  push(notes: Note[]): Promise<void>;
  receive(callback: receiveCallback): void;
}

// Store that uploads and syncs notes.
export class NoteStoreWebSync implements NoteStorePushPull {
  async pull(): Promise<Note[]> {
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

  async push(notes: Note[]) {
    console.log("Saving to sync.");
    const str = JSON.stringify(notes);
    console.log(`Saving ${str.length} bytes`);
    await Sync.uploadNotes(notes);
  }

  receive(callback: receiveCallback): void {
    // Not supported.
  }
}

// Delegates communication with an actual store to the background script.
export class NoteStoreWithBackground implements NoteStorePushPull {
  async pull(): Promise<Note[]> {
    const notes = await chrome.runtime.sendMessage({
      type: "pull"
    });
    if (!Array.isArray(notes)) throw new Error("Received non Note[]", notes);
    return notes.map(Note.fromNoteLike);
  }

  async push(notes: Note[]) {
    chrome.runtime.sendMessage({
      type: "push",
      notes: notes
    });
  }

  receive(callback: receiveCallback): void {
    chrome.runtime.onMessage.addListener((message, sender, respond) => {
      console.log("Note backend received", message, sender);
      if (message["type"] === "notesUpdate") {
        const notes = message["notes"];
        if (!Array.isArray(notes)) throw new Error("Received non Note[]", notes);
        callback(notes.map(Note.fromNoteLike));
      }
      return true;
    });
  }
}

export class NoteStoreImpl implements NoteStore {
  store: NoteStorePushPull;
  notesBehaviour = new BehaviorSubject<Note[]>([]);

  constructor(backend: NoteStorePushPull) {
    this.store = backend;
    this.store.pull().then(notes => this.notesBehaviour.next(notes));
    this.store.receive(notes => this.notesBehaviour.next(notes));
  }

  async getAllNotes(): Promise<Note[]> {
    return this.store.pull();
  }

  private async persistAllNotes(notes: Note[]) {
    await this.store.push(notes);
    this.notesBehaviour.next(notes);
  }

  async insert(note: Note): Promise<void> {
    const notes = await this.getAllNotes();
    const index = notes.findIndex((n: Note) => n.id === note.id);

    if (index === -1)
      notes.push(note);
    else
      throw new Error(`Note ${note.id} already exists`);

    await this.persistAllNotes(notes);
  }

  async update(note: Note): Promise<void> {
    const notes = await this.getAllNotes();
    const index = notes.findIndex((n: Note) => n.id === note.id);

    if (index !== -1)
      notes[index] = note;
    else
      throw new Error(`Note ${note.id} does not exist to be updated. Insert it first.`);

    await this.persistAllNotes(notes);
  }

  async updateOrInsert(note: Note): Promise<void> {
    const notes = await this.getAllNotes();
    const index = notes.findIndex((n: Note) => n.id === note.id);

    if (index !== -1)
      notes[index] = note;
    else
      notes.push(note);

    await this.persistAllNotes(notes);
  }

  async delete(note: Note): Promise<void> {
    const notes = await this.getAllNotes();
    const index = notes.findIndex((n: Note) => n.id === note.id);

    if (index !== -1)
      notes.splice(index, 1);

    await this.persistAllNotes(notes);
  }

  get noteUpdates(): Observable<Note[]> {
    return this.notesBehaviour.asObservable()
      .pipe(map((n: Note[]) => [...n]))
      .pipe(distinctUntilChanged(arraysEqual));
  }
}