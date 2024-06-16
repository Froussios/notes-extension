import * as functions from '@google-cloud/functions-framework';
import { match } from "path-to-regexp";
import { Storage } from '@google-cloud/storage';

const storage = new Storage();

async function uploadFromMemory(userid: string, object: string) {
  await storage.bucket("notes-extension-425902-sync").file(`${userid}.json`).save(JSON.stringify(object));
}

functions.http('postNotes', async (req, res) => {
  // TODO restrict to extension id
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method.toUpperCase() !== 'POST') {
    res.sendStatus(405);
    return;
  }
  console.log(req);

  const parser = match("/user/:userid", { decode: decodeURIComponent });
  const { userid } = (parser(req.path) as any)["params"];
  const payload = req.body;

  console.log(userid, payload);

  await uploadFromMemory(userid, payload);

  res.send(`${payload} [end]`);
});

functions.http('getNotes', async (req, res) => {
  // TODO restrict to extension id
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method.toUpperCase() !== 'GET') {
    res.sendStatus(405);
    return;
  }

  const parser = match("/user/:userid", { decode: decodeURIComponent });
  const { userid } = (parser(req.path) as any)["params"];
  const filename = `${userid}.json`;
  const bucketname = "notes-extension-425902-sync";

  console.info("Fetching save for", userid);

  const file = await storage.bucket(bucketname).file(filename);

  console.info("Checking if", filename, "exists");
  if (!(await file.exists())[0]) {
    console.info("Save file not found");
    res.sendStatus(404);
    return;
  }

  console.info("Downloading file");

  const download = await file.download({ decompress: true });

  console.info("Forwarding");

  res.send(download.toString());
});
