import { NoteElement } from "./note_element";

describe("note-element", function () {

  let noteElement: NoteElement | null = null;
  beforeAll(() => {
    noteElement = new NoteElement();
    document.body.append(noteElement);
  });

  afterAll(() => {
    noteElement!.remove();
  });

  it('inits', () => {
    expect(noteElement!.isDirty).toBeFalse();
  });
});