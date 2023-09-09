import { dirname } from "path"
import { fileURLToPath } from "url"

let __filename2 = fileURLToPath(import.meta.url);
const getCurrentFileName = loc => fileURLToPath(loc);
const __dirname = dirname(__filename2);
export { 
  getCurrentFileName,
  __dirname
}