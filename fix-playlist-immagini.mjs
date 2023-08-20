import fs from "fs"
import YAML from "yaml"

// Opzioni
const {
  pathOfPlaylistFile,
  screenshotsDirPaths,
  loadingAnims,
  chalkLoadingAnim
} = YAML.parse(fs.readFileSync("config.yaml").toString());

const colors = {
  // Custom formatting
  normal: "\x1b[0m",
  bold: "\x1b[1m",
  underline: "\x1b[4m",
  // Actual colors
  red: "\x1b[31;1m",
  dimRed: "\x1b[31;2m",
  dimGray: "\x1b[37;2m"
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
    console.log(`${colors.red}'${colors.dimRed+colors.underline}content_image_history.lpl${colors.normal+colors.red}' non è presente${colors.normal}`)
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
const listaImmagini_suSistema = fs.readdirSync(
  screenshotsDirPaths.relative,
  { recursive: true }
)
let listaImmagini_soloRecursivi = listaImmagini_suSistema.filter(
  thing => thing.search("/") !== -1
)

//    L'aggiunta
let itemsInFormatoStringa = JSON.stringify(parsedJSON?.items)
var addCount = 0
listaImmagini_soloRecursivi.forEach(
  imgConCartella => {
    let pathCompletaImmagine = `${
      escapeRegExp(screenshotsDirPaths.normal)
    }${escapeRegExp(imgConCartella)}`
    
    // Inesistente nella lista
    if (itemsInFormatoStringa.search(pathCompletaImmagine) === -1) 
    {
      // ↓ Deve essere normale, niente escapes
      let pathCompletaImmagine = `${
        screenshotsDirPaths.normal
      }${imgConCartella}`
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