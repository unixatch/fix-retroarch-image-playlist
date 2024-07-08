/*
  Copyright (C) 2024  unixatch

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with fix-retroarch-image-playlist.  If not, see <https://www.gnu.org/licenses/>.
*/

import { dirname } from "path"
import { fileURLToPath } from "url"

let __filename2 = fileURLToPath(import.meta.url);
const getCurrentFileName = loc => fileURLToPath(loc);
const __dirname = dirname(__filename2);
export { 
  getCurrentFileName,
  __dirname
}