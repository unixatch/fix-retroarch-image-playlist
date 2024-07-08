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

import { platform, env, exit } from "process"
import { existsSync, mkdirSync, copyFileSync } from "fs"
import { join } from "path"

let configFolder;
switch (platform) {
  case "win32":
    configFolder = env.APPDATA;
    break;
  case "darwin": // MacOS
    configFolder = env.HOME + "/Library/Preferences";
    break;
  
  default:
    configFolder = env.HOME + "/.local/share";
}

const configFileFolder = join(configFolder, "fix-retroarch-image-playlist");
const completePath = join(configFileFolder, "config.yaml");

// In case there's no config folder
if (!existsSync(configFileFolder)) mkdirSync(configFileFolder);

// In case there's no matching file inside the location
if (!existsSync(completePath)) copyFileSync("config_default.yaml", completePath);

export default completePath