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
  async save() {
    this.validate();

    const notes = await Note.getAllNotes();
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
  async delete(hardDelete = false) {
    const notes = await Note.getAllNotes();
    const index = notes.findIndex((note: Note) => note.id === this.id);

    if (index !== -1) {
      this.softDeleted = notes[index].softDeleted = new Date();
      if (hardDelete)
        notes.splice(index, 1);
    }

    Note.persistAllNotes(notes);
  }

  // Undo a hard or a soft delete.
  async undelete() {
    const notes = await Note.getAllNotes();
    const index = notes.findIndex((note: Note) => note.id === this.id);

    if (index !== -1) {
      this._softDeleted = notes[index]._softDeleted = undefined;
    }
    else {
      notes.push(this);
    }

    Note.persistAllNotes(notes);
  }

  // Static method to fetch all notes from localStorage
  static async getAllNotes(): Promise<Note[]> {
    const notes = await Sync.downloadNotes();
    console.log("Downloaded", notes);

    console.assert(Array.isArray(notes));
    console.assert(notes.every((n: Note) => n.validate()));
    if (!notes.every((n: Note) => !!n.url)) {
      console.warn("Loaded note without url", notes);
    }

    return notes;
  }

  static async persistAllNotes(notes: Note[]) {
    const str = JSON.stringify(notes);
    console.log(`Saving ${str.length} bytes`);

    await Sync.uploadNotes(notes);
  }
}
