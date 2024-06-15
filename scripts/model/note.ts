import { Sync } from "./sync";

export class Note {
  id: string;
  title: string;
  content: string;
  url: string;

  constructor(id: string, title: string, content: string, url: string) {
    this.id = id;
    this.title = title || "";
    this.content = content || "";
    this.url = url || "";

    this.validate();
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
  delete() {
    const notes = Note.getAllNotes();
    const index = notes.findIndex((note: Note) => note.id === this.id);

    if (index !== -1) {
      notes.splice(index, 1);
      Note.persistAllNotes(notes);
    }
  }

  // Static method to fetch all notes from localStorage
  static getAllNotes(): Note[] {
    const notesStr = localStorage.getItem("notes");
    console.log(`Loaded ${notesStr?.length || 0} bytes`);
    const notesObj = notesStr ? JSON.parse(notesStr) : [];
    const notes = notesObj.map(
      (n: any) => new Note(n.id, n.title, n.content, n.url)
    );

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
    localStorage.setItem("notes", str);

    await Sync.uploadNotes(notes);
  }
}
