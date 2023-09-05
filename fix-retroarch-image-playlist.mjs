#!/usr/bin/env node
import fs from "fs"
import { join } from "path"
import { execSync } from "child_process"
import YAML from "yaml"
const { __dirname } = await import("./utils.mjs");


// Options
const configPath = join(__dirname, "config.yaml");
const {
  pathOfPlaylistFile,
  screenshotsDirPaths,
  loadingAnims,
  chalkLoadingAnim
} = YAML.parse(fs.readFileSync(configPath).toString());

let isMobile;
try {
  // Android 
  // or Linux/MacOS
  const osName = execSync("uname -o")
    .toString()
    .replace("\n", "");
  isMobile = (osName === "Android") ? true : false;
} catch(err) {
  // Windows
  // or Linux OSes without GNU coreutils
  isMobile = false;
}

const colors = {
  // Custom formatting
  normal: "\x1b[0m",
  bold: "\x1b[1m",
  italics: "\x1b[3m",
  underline: "\x1b[4m",
  // Actual colors
  red: "\x1b[31;1m",
  yellow: "\x1b[33m",
  dimYellow: "\x1b[33;2m",
  dimRed: "\x1b[31;2m"
}

const stdout = process.stdout;
function escapeRegExp(string) {
  // ❗ . * + ? ^ $ { } ( ) | [ ] \ ❗
  // $& —→ the whole string being identified/matched
  return string
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // https://stackoverflow.com/a/6969486
}

try {
  var file = fs.readFileSync(pathOfPlaylistFile);
} catch(err) {
  // In case there's no file
  if (err.code === "ENOENT") {
    if (pathOfPlaylistFile === "") {
      console.log(`${colors.yellow}The string "${colors.normal+colors.underline}pathOfPlaylistFile${colors.normal+colors.yellow}" is empty,\nmaybe you need to configure ${
        colors.normal +
        colors.italics +
        colors.dimYellow
      }config.yaml${colors.normal+colors.yellow} ?${colors.normal}\n`)
      process.exit()
    }
    console.log(`${colors.red}'${colors.dimRed+colors.underline}content_image_history.lpl${colors.normal+colors.red}' hasn't being found${colors.normal}\n`)
    process.exit()
  }
  console.log(err)
  process.exit()
}
let parsedJSON = JSON.parse(file);

// Adds the missing images to the list
const templateOfImageObject = {
  "path": "",
  "label": "",
  "core_path": "builtin",
  "core_name": "imageviewer",
  "crc32": "",
  "db_name": ""
};
let imageList_onSystem;
try {
  if (isMobile) {
    imageList_onSystem = fs.readdirSync(
      screenshotsDirPaths.mobile.terminalEmu,
      { recursive: true }
    )
  } else {
    imageList_onSystem = fs.readdirSync(
      screenshotsDirPaths.desktop,
      { recursive: true }
    )
  }
} catch(err) {
  // In case there's no file
  if (err.code === "ENOENT") {
    if (isMobile) {
      if (screenshotsDirPaths.mobile.terminalEmu === "") {
        console.log(`${colors.yellow}The string "${
            colors.normal+colors.underline
        }terminalEmu${colors.normal+colors.yellow}"'s empty${colors.normal}\n`)
        process.exit()
      }
      console.log(`${colors.red}'${
        colors.dimRed+colors.underline +
        screenshotsDirPaths.mobile.terminalEmu // Other cases
      }${colors.normal+colors.red}' doesn't exist or it's wrong${colors.normal}\n`)
      process.exit()
    } else { // Desktop
      if (screenshotsDirPaths.desktop === "") {
        console.log(`${colors.yellow}The string "${
          colors.normal+colors.underline
        }desktop${colors.normal+colors.yellow}"'s empty${colors.normal}\n`)
        process.exit()
      }
      console.log(`${colors.red}'${
        colors.dimRed+colors.underline +
        screenshotsDirPaths.desktop // Other cases
      }${colors.normal+colors.red}' doesn't exist or it's wrong${colors.normal}`)
      process.exit()
    }
  }
  console.log(err)
  process.exit()
}
let imageList_onlyRecursives = imageList_onSystem.filter(
  thing => thing.search("/") !== -1
)

//    The addition
let itemsToString = JSON.stringify(parsedJSON?.items);
var addCount = 0
imageList_onlyRecursives.forEach(
  imgWithFolder => {
    // In case there's no file
    if (isMobile) {
      if (screenshotsDirPaths.mobile.normal === "") {
        console.log(`${colors.yellow}The string "${colors.normal+colors.underline}normal${colors.normal+colors.yellow}" inside mobile is empty${colors.normal}`)
        process.exit()
      }
    }
    const path = (isMobile) 
      ? screenshotsDirPaths.mobile.normal 
      : screenshotsDirPaths.desktop;
    let completeImgPath = `${
      escapeRegExp(path)
    }${escapeRegExp(imgWithFolder)}`
    
    // Non-existent inside the list
    if (itemsToString.search(completeImgPath) === -1) 
    {
      // ↓ It needs to be normal, no escapes
      let completeImgPath = `${path}${imgWithFolder}`
      let copyOfTemplate = {
        ...templateOfImageObject
      };
      
      copyOfTemplate.path = completeImgPath;
      parsedJSON?.items?.unshift(copyOfTemplate)
      addCount += 1;
    }
  }
)
console.log(`Added ${
  colors.bold +
  addCount +
  colors.normal
} images to RetroArch's list`)

let clearLastLine;
let dotAnimation_ID;
if (loadingAnims) {
  // Basic dot animation
  const OGphrase = `${colors.dimGray}Computing what needs to be cleaned/added${colors.normal}`;
  var phrase = OGphrase;
  const updateFrequency  = 1000;
  var dotCount = 0;
  const maxDotCount = 3;
  clearLastLine = () => {
    stdout.cursorTo(0);
    stdout.clearLine(0);
  }
  function dotAnimation() {
    if (dotCount !== 0) clearLastLine();
    if (dotCount > maxDotCount) {
      phrase = OGphrase;
      dotCount = 1;
    }
    phrase += `${colors.dimGray}.${colors.normal}`;
    stdout.write(phrase)
    dotCount += 1;
  }
  dotAnimation_ID = setInterval(dotAnimation, updateFrequency);
}

// Obtains items to be cleaned
let itemsToDelete = [];
let itemsLength = parsedJSON?.items?.length;
itemsToString = JSON.stringify(parsedJSON?.items)
for (let i = 0; i < itemsLength; i++) {
  let imgPath = parsedJSON?.items[i]?.path;
  
  // Non-existents
  if (!fs.existsSync(imgPath)) {
    itemsToDelete.push(i);
    continue;
  }
  // Duplicates
  const regex = new RegExp(
    escapeRegExp(imgPath), "g"
  );
  const resultsAmount = itemsToString.match(regex)?.length
  
  if (resultsAmount > 1) {
    itemsToDelete.push(i);
  }
}
if (loadingAnims) {
  clearInterval(dotAnimation_ID)
  clearLastLine()
}
console.log("Done computing what needs to be cleaned")


if (chalkLoadingAnim) {
  // Colored animation
  const { default: chalkAnimation } = 
    await import("chalk-animation")
  let str = `Cleaning ${itemsToDelete.length} items`;
  chalkAnimation.pulse(str);
}

// Cleans RetroArch's image list
itemsToDelete.forEach(
  index => delete parsedJSON?.items[index]
)
clearLastLine()
console.log("Cleaned the list")

// In case the JSON breaks
try {
  let completeJSON_toString = JSON.stringify(parsedJSON);
  JSON.parse(completeJSON_toString)
} catch(err) {
  console.log(err)
  process.exit()
}

// Writes to file
let newJsonFile = Buffer.from(
  JSON.stringify(parsedJSON)
)
fs.writeFileSync(
  pathOfPlaylistFile, 
  newJsonFile
)
process.exit()