#!/usr/bin/env node
import fs from "fs"
import { join } from "path"
import { execSync } from "child_process"
import YAML from "yaml"
const { __dirname } = await import("./utils.mjs");


// Opzioni
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
  // $& —→ tutta la stringa identificata
  return string
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // https://stackoverflow.com/a/6969486
}

try {
  var file = fs.readFileSync(pathOfPlaylistFile);
} catch(err) {
  // In caso non c'è il file
  if (err.code === "ENOENT") {
    if (pathOfPlaylistFile === "") {
      console.log(`${colors.yellow}La stringa "${colors.normal+colors.underline}pathOfPlaylistFile${colors.normal+colors.yellow}" è vuota,\nmagari devi configurare ${
        colors.normal +
        colors.italics +
        colors.dimYellow
      }config.yaml${colors.normal+colors.yellow} ?${colors.normal}\n`)
      process.exit()
    }
    console.log(`${colors.red}'${colors.dimRed+colors.underline}content_image_history.lpl${colors.normal+colors.red}' non è presente${colors.normal}\n`)
    process.exit()
  }
  console.log(err)
  process.exit()
}
let parsedJSON = JSON.parse(file);

// Aggiunge le immagini mancanti nella lista
const template_elemento = {
  "path": "",
  "label": "",
  "core_path": "builtin",
  "core_name": "imageviewer",
  "crc32": "",
  "db_name": ""
};
let listaImmagini_suSistema;
try {
  if (isMobile) {
    listaImmagini_suSistema = fs.readdirSync(
      screenshotsDirPaths.mobile.terminalEmu,
      { recursive: true }
    )
  } else {
    listaImmagini_suSistema = fs.readdirSync(
      screenshotsDirPaths.desktop,
      { recursive: true }
    )
  }
} catch(err) {
  // In caso non c'è il file
  if (err.code === "ENOENT") {
    if (isMobile) {
      if (screenshotsDirPaths.mobile.terminalEmu === "") {
        console.log(`${colors.yellow}La stringa "${
            colors.normal+colors.underline
        }terminalEmu${colors.normal+colors.yellow}" è vuota${colors.normal}\n`)
        process.exit()
      }
      console.log(`${colors.red}'${
        colors.dimRed+colors.underline +
        screenshotsDirPaths.mobile.terminalEmu // Altri casi
      }${colors.normal+colors.red}' non esiste o è sbagliata${colors.normal}\n`)
      process.exit()
    } else { // Desktop
      if (screenshotsDirPaths.desktop === "") {
        console.log(`${colors.yellow}La stringa "${
          colors.normal+colors.underline
        }desktop${colors.normal+colors.yellow}" è vuota${colors.normal}\n`)
        process.exit()
      }
      console.log(`${colors.red}'${
        colors.dimRed+colors.underline +
        screenshotsDirPaths.desktop // Altri casi
      }${colors.normal+colors.red}' non esiste o è sbagliata${colors.normal}`)
      process.exit()
    }
  }
  console.log(err)
  process.exit()
}
let listaImmagini_soloRecursivi = listaImmagini_suSistema.filter(
  thing => thing.search("/") !== -1
)

//    L'aggiunta
let itemsInFormatoStringa = JSON.stringify(parsedJSON?.items)
var addCount = 0
listaImmagini_soloRecursivi.forEach(
  imgConCartella => {
    // In caso non c'è il file
    if (isMobile) {
      if (screenshotsDirPaths.mobile.normal === "") {
        console.log(`${colors.yellow}La stringa "${colors.normal+colors.underline}normal${colors.normal+colors.yellow}" di mobile è vuota${colors.normal}`)
        process.exit()
      }
    }
    const path = (isMobile) 
      ? screenshotsDirPaths.mobile.normal 
      : screenshotsDirPaths.desktop;
    let pathCompletaImmagine = `${
      escapeRegExp(path)
    }${escapeRegExp(imgConCartella)}`
    
    // Inesistente nella lista
    if (itemsInFormatoStringa.search(pathCompletaImmagine) === -1) 
    {
      // ↓ Deve essere normale, niente escapes
      let pathCompletaImmagine = `${path}${imgConCartella}`
      let copiaTemplate = {
        ...template_elemento
      };
      
      copiaTemplate.path = pathCompletaImmagine;
      parsedJSON?.items?.unshift(copiaTemplate)
      addCount += 1;
    }
  }
)
console.log(`Aggiunte ${
  colors.bold +
  addCount +
  colors.normal
} immagini nella lista`)

let clearLastLine;
let animazionePuntini_ID;
if (loadingAnims) {
  // Animazione puntini basilare
  const OGfrase = `${colors.dimGray}Calcolo cosa deve pulire/aggiungere${colors.normal}`;
  var frase = OGfrase;
  const velocitàAggiornamento = 1000;
  var dotCount = 0;
  const maxDotCount = 3;
  clearLastLine = () => {
    stdout.cursorTo(0);
    stdout.clearLine(0);
  }
  function animazione_punti() {
    if (dotCount !== 0) clearLastLine();
    if (dotCount > maxDotCount) {
      frase = OGfrase;
      dotCount = 1;
    }
    frase += `${colors.dimGray}.${colors.normal}`;
    stdout.write(frase)
    dotCount += 1;
  }
  animazionePuntini_ID = setInterval(animazione_punti, velocitàAggiornamento);
}

// Ottiene gli elementi da pulire
let itemsToDelete = [];
let itemsLength = parsedJSON?.items?.length;
itemsInFormatoStringa = JSON.stringify(parsedJSON?.items)
for (let i = 0; i < itemsLength; i++) {
  let pathImmagine = parsedJSON?.items[i]?.path;
  
  // Inesistenti
  if (!fs.existsSync(pathImmagine)) {
    itemsToDelete.push(i);
    continue;
  }
  // Duplicati
  const regex = new RegExp(
    escapeRegExp(pathImmagine), "g"
  );
  const numeroRisultati = itemsInFormatoStringa.match(regex)?.length
  
  if (numeroRisultati > 1) {
    itemsToDelete.push(i);
  }
}
if (loadingAnims) {
  clearInterval(animazionePuntini_ID)
  clearLastLine()
}
console.log("Finito di calcolare gli elementi da pulire")


if (chalkLoadingAnim) {
  // Animazione colorata
  const { default: chalkAnimation } = 
    await import("chalk-animation")
  let str = `Pulizia di ${itemsToDelete.length} elementi in corso`;
  chalkAnimation.pulse(str);
}

// Pulisce la lista
itemsToDelete.forEach(
  index => delete parsedJSON?.items[index]
)
clearLastLine()
console.log("Pulita la lista")

// In caso il JSON è rotto
try {
  let JSONFinito_inStringa = JSON.stringify(parsedJSON);
  JSON.parse(JSONFinito_inStringa)
} catch(err) {
  console.log(err)
  process.exit()
}

// Scrive al file
let newJsonFile = Buffer.from(
  JSON.stringify(parsedJSON)
)
fs.writeFileSync(
  pathOfPlaylistFile, 
  newJsonFile
)
process.exit()