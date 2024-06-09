import { Note } from './note';
import { Sync } from "./sync";

describe("Sync", function () {
  it('can reconstruct data', async () => {
    // When getting the key, skip directly to generating and return one.
    spyOn(Sync, "getEncryptionKey").and.returnValue(Sync.generateEncryptionKey());

    const notes = [new Note(
      "noteid",
      "title",
      "stuff",
      "http://www.example.com"
    )];
    const notes_str = JSON.stringify(notes);

    const notes_encrypted = await Sync.encrypt(notes_str);
    const notes_decrypted = await Sync.decrypt(notes_encrypted);

    expect(notes_str).toEqual(notes_decrypted);
  });
});

