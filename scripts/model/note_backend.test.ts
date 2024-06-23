import { Note } from './note';
import { NoteStoreSync, NoteStoreImpl } from "./note_backend";
import { Observer, Subscription } from "rxjs";

class FakeNoteStoreSync extends NoteStoreSync {
  notes: Note[] = [];

  override async getAllNotes(): Promise<Note[]> {
    return this.notes;
  }

  override async persistAllNotes(notes: Note[]) {
    this.notes = notes;
  }
}

class ReplayObserver<T> implements Observer<T> {
  replay = new Array<T>();
  replayError: Error | undefined;
  replayCompleted = false;

  next(t: T) {
    this.replay.push(t);
    console.info("Next:", t, JSON.stringify(t));
  }

  error(err: Error) {
    this.replayError = err;
    console.error("Error:", err);
  }

  complete() {
    this.replayCompleted = true;
    console.info("Completed");
  }
}

let nextId = 1;
function createNote() {
  return new Note(`id${++nextId}`, "title", "text", "www.example.com");
}

describe("NoteStoreImpl", function () {
  let noteStore: NoteStoreImpl;
  let fake: FakeNoteStoreSync;

  beforeEach(() => {
    fake = new FakeNoteStoreSync();
    spyOn(fake, "getAllNotes").and.callThrough();
    spyOn(fake, "persistAllNotes").and.callThrough();
    noteStore = new NoteStoreImpl(fake);
  });

  it('starts empty', async () => {
    const notes = await noteStore.getAllNotes();

    expect(notes).toEqual([]);
    expect(fake.getAllNotes).toHaveBeenCalled();
  });

  it('inserts notes', async () => {
    const note1 = createNote();
    const note2 = createNote();
    await noteStore.insert(note1);

    expect(fake.persistAllNotes).toHaveBeenCalledWith([note1]);

    await noteStore.insert(note2);

    expect(fake.persistAllNotes).toHaveBeenCalledWith([note1, note2]);

    const notes = await noteStore.getAllNotes();

    expect(notes).toEqual([note1, note2]);
  });

  describe("rx", () => {
    let observer: ReplayObserver<Note[]>;
    let subscription: Subscription;

    beforeEach(() => {
      observer = new ReplayObserver<Note[]>();
      spyOn(observer, "complete").and.callThrough();
      spyOn(observer, "error").and.callThrough();
      spyOn(observer, "next").and.callThrough();

      subscription = noteStore.noteUpdates.subscribe(observer);
    });

    afterEach(() => {
      subscription.unsubscribe();
    });

    it('emits updates', async () => {
      await noteStore.getAllNotes();

      expect(observer.complete).not.toHaveBeenCalled();
      expect(observer.next).toHaveBeenCalledTimes(1);
      expect(observer.next).toHaveBeenCalledWith([]);
    });

    it('emits update after insert', async () => {
      const [note1, note2, note3] = [createNote(), createNote(), createNote()];
      await noteStore.insert(note1);
      await noteStore.insert(note2);
      await noteStore.insert(note3);

      expect(observer.complete).not.toHaveBeenCalled();
      expect(observer.next).toHaveBeenCalledTimes(4);
      expect(observer.next).toHaveBeenCalledWith([]);
      expect(observer.next).toHaveBeenCalledWith([note1]);
      expect(observer.next).toHaveBeenCalledWith([note1, note2]);
      expect(observer.next).toHaveBeenCalledWith([note1, note2, note3]);
      expect(observer.complete).not.toHaveBeenCalled();
      expect(observer.error).not.toHaveBeenCalled();
    });

    it('emits update after delete', async () => {
      const note = createNote();
      await noteStore.insert(note);
      await noteStore.delete(note);

      expect(observer.next).toHaveBeenCalledWith([]);
      expect(observer.next).toHaveBeenCalledWith([note]);
      expect(observer.next).toHaveBeenCalledWith([]);
      expect(observer.next).toHaveBeenCalledTimes(3);
      expect(observer.complete).not.toHaveBeenCalled();
      expect(observer.error).not.toHaveBeenCalled();
    });

    it('emits update after update', async () => {
      const note = createNote();
      const noteUpdate = Note.fromNoteLike(note);
      noteUpdate.title = "Other title";

      await noteStore.insert(note);
      await noteStore.updateOrInsert(noteUpdate);

      expect(observer.next).toHaveBeenCalledWith([]);
      expect(observer.next).toHaveBeenCalledWith([note]);
      expect(observer.next).toHaveBeenCalledWith([noteUpdate]);
      expect(observer.next).toHaveBeenCalledTimes(3);
      expect(observer.complete).not.toHaveBeenCalled();
      expect(observer.error).not.toHaveBeenCalled();
    });
  });
});
