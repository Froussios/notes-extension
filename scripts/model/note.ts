export class Note {
  id: string;
  title: string;
  content: string;
  url: string;

  constructor(id: string, title: string, content: string, url: string) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.url = url;
  }

  // Save the note to localStorage
  save() {
    const notes = Note.getAllNotes();
    const index = notes.findIndex((note: Note) => note.id === this.id);

    if (index !== -1) {
      // Update an existing note
      notes[index] = this;
    } else {
      // Add a new note
      notes.push(this);
    }

    localStorage.setItem("notes", JSON.stringify(notes));
  }

  // Delete the note from localStorage
  delete() {
    const notes = Note.getAllNotes();
    const index = notes.findIndex((note: Note) => note.id === this.id);

    if (index !== -1) {
      notes.splice(index, 1);
      localStorage.setItem("notes", JSON.stringify(notes));
    }
  }

  // Static method to fetch all notes from localStorage
  static getAllNotes(): Note[] {
    const notesStr = localStorage.getItem("notes");
    return notesStr ? JSON.parse(notesStr) : [];
  }
}
