import { Sync } from "./sync";

export interface NoteLike {
  id: string;
  title: string;
  content: string;
  url: string;
  _softDeleted: string | undefined;
}

export class Note implements NoteLike {
  id: string;
  title: string;
  content: string;
  url: string;
  _softDeleted: string | undefined;

  get softDeleted(): Date | null {
    return this._softDeleted ? new Date(this._softDeleted) : null;
  }

  set softDeleted(date: Date) {
    this._softDeleted = date.toISOString();
  }

  constructor(id: string, title: string, content: string, url: string) {
    this.id = id;
    this.title = title || "";
    this.content = content || "";
    this.url = url || "";

    this.validate();
  }

  static fromNoteLike(notelike: NoteLike): Note {
    const note = new Note(
      notelike.id,
      notelike.title,
      notelike.content,
      notelike.url
    );
    note._softDeleted = notelike._softDeleted;
    return note;
  }

  private validate() {
    if (!this.id) {
      throw new Error("Required data is missing.");
    }
    return true;
  }

  // Save the note to localStorage
  save() {
    this.validate();

    const notes = Note.getAllNotes();
    const index = notes.findIndex((note: Note) => note.id === this.id);

    if (index !== -1) {
      // Update an existing note
      notes[index] = this;
    } else {
      // Add a new note
      notes.push(this);
    }

    Note.persistAllNotes(notes);
  }

  // Delete the note from localStorage
  delete(hardDelete = false) {
    const notes = Note.getAllNotes();
    const index = notes.findIndex((note: Note) => note.id === this.id);

    if (index !== -1) {
      this.softDeleted = notes[index].softDeleted = new Date();
      if (hardDelete)
        notes.splice(index, 1);
    }

    Note.persistAllNotes(notes);
  }

  // Static method to fetch all notes from localStorage
  static getAllNotes(): Note[] {
    const notesStr = localStorage.getItem("notes");
    console.log(`Loaded ${notesStr?.length || 0} bytes`);
    const notesObj = notesStr ? JSON.parse(notesStr) : [];
    const notes = notesObj.map(
      (n: NoteLike) => Note.fromNoteLike(n)
    );

    console.assert(Array.isArray(notes));
    console.assert(notes.every((n: Note) => n.validate()));
    if (!notes.every((n: Note) => !!n.url)) {
      console.warn("Loaded note without url", notes);
    }

    // TODO Merge with local notes
    // TODO Do this somewhere less busy.
    Sync.downloadNotes().then(notes => console.log("Downloaded", notes));

    return notes;
  }

  static async persistAllNotes(notes: Note[]) {
    const str = JSON.stringify(notes);
    console.log(`Saving ${str.length} bytes`);
    localStorage.setItem("notes", str);

    await Sync.uploadNotes(notes);
  }
}
