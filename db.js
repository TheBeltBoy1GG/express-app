import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

const readFileAsync = promisify(fs.readFile);
export async function getDB() {
  const data = await readFileAsync(dbPath, 'utf8');
  return JSON.parse(data);
}
const writeFileAsync = promisify(fs.writeFile);
export async function saveDB(data) {
  await writeFileAsync(dbPath, JSON.stringify(data, null, 2));
}
