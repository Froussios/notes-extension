import { DefaultStore } from "./note_backend";
import { Sync } from "./sync";

export interface NoteLike {
  id: string;
  title: string;
  content: string;
  url: string;
  _lastEdit: string;
  _softDeleted: string | undefined;
}

export class Note implements NoteLike {
  id: string;
  title: string;
  content: string;
  url: string;
  _lastEdit: string;
  _softDeleted: string | undefined;

  get lastEdit(): Date {
    return new Date(this._lastEdit);
  }

  private set lastEdit(date: Date) {
    this._lastEdit = date.toISOString();
  }

  get softDeleted(): Date | null {
    return this._softDeleted ? new Date(this._softDeleted) : null;
  }

  set softDeleted(date: Date) {
    this._softDeleted = date.toISOString();
  }

  get Store() { return DefaultStore; }

  constructor(id: string, title: string, content: string, url: string) {
    this.id = id;
    this.title = title || "";
    this.content = content || "";
    this.url = url || "";
    this._lastEdit = ""; // Overwritten in the next LOC.
    this.lastEdit = new Date();

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

  validate() {
    if (!this.id) {
      throw new Error("Required data is missing.");
    }
    return true;
  }

  // Save the note to localStorage
  async save() {
    this.lastEdit = new Date();
    this.validate();
    this.Store.updateOrInsert(this);
  }

  // Delete the note from localStorage
  async delete(hardDelete = false) {
    this.softDeleted = new Date();

    if (hardDelete)
      this.Store.delete(this);
    else
      this.Store.updateOrInsert(this);
  }

  // Undo a hard or a soft delete.
  async undelete() {
    this._softDeleted = undefined;
    this.Store.updateOrInsert(this);
  }
}
