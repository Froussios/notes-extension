import { Note } from './note';
import { NoteStoreSync, NoteStoreImpl } from "./note_backend";

class FakeNoteStoreSync extends NoteStoreSync {
  notes: Note[] = [];

  override async getAllNotes(): Promise<Note[]> {
    return this.notes;
  }

  override async persistAllNotes(notes: Note[]) {
    this.notes = notes;
  }
}

describe("Sync", function () {
  it('starts empty', async () => {
    const fake = new FakeNoteStoreSync();
    spyOn(fake, "getAllNotes").and.callThrough();
    spyOn(fake, "persistAllNotes").and.callThrough();
    const noteStore = new NoteStoreImpl(fake);

    const notes = await noteStore.getAllNotes();

    expect(notes).toEqual([]);
    expect(fake.getAllNotes).toHaveBeenCalled();
  });

  describe("Sync", function () {
    it('inserts notes', async () => {
      const fake = new FakeNoteStoreSync();
      spyOn(fake, "getAllNotes").and.callThrough();
      spyOn(fake, "persistAllNotes").and.callThrough();
      const noteStore = new NoteStoreImpl(fake);

      const note1 = new Note("id1", "title", "text", "www.example.com");
      const note2 = new Note("id2", "title", "text", "www.example.com");
      await noteStore.insert(note1);

      expect(fake.persistAllNotes).toHaveBeenCalledWith([note1]);

      await noteStore.insert(note2);

      expect(fake.persistAllNotes).toHaveBeenCalledWith([note1, note2]);

      const notes = await noteStore.getAllNotes();

      expect(notes).toEqual([note1, note2]);
    });
  });
});
