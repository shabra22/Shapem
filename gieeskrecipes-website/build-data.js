#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GieesK — Data Splitter
   ───────────────────────────────────────────────────────────────
   Turns the monolithic js/data.js into:

     data/index.json        light catalogue — every recipe, browse
                            fields only. Loaded once, upfront.
     data/recipes/<ID>.json full detail — fetched on demand when a
                            recipe is actually opened.

   Run after editing data.js:   node build-data.js
═══════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

// ── Fields needed to render a card / run a search ───────────────
const INDEX_FIELDS = [
  'id','title','localName','emoji','country','countryFlag','cuisine',
  'category','course','diff','time','prepTime','cookTime','servings',
  'cal','rating','reviews','tags','collections','desc',
  'author','authorEmoji'
];

console.log('Reading js/data.js…');
const src = fs.readFileSync(path.join(__dirname,'js','data.js'),'utf8');

// Evaluate data.js in a sandbox to get the RECIPES array
const sandbox = { window:{}, document:{} };
const vm = require('vm');
vm.createContext(sandbox);
vm.runInContext(src + '\n;__OUT__ = (typeof RECIPES!=="undefined")?RECIPES:null;', sandbox);
const RECIPES = sandbox.__OUT__;

if (!Array.isArray(RECIPES)) {
  console.error('❌ Could not read RECIPES array from data.js');
  process.exit(1);
}
console.log(`Loaded ${RECIPES.length} recipes.`);

// ── Integrity: duplicate IDs silently overwrite detail files ────
const idSeen = new Map();
const dupes = [];
RECIPES.forEach((r, i) => {
  if (!r.id) { dupes.push(`index ${i} has no id ("${r.title||'?'}")`); return; }
  if (idSeen.has(r.id)) {
    dupes.push(`${r.id} used twice — "${idSeen.get(r.id)}" and "${r.title}"`);
  } else idSeen.set(r.id, r.title);
});
if (dupes.length) {
  console.error('\n❌ DUPLICATE / MISSING IDs — detail files would overwrite each other:');
  dupes.forEach(d => console.error('   ' + d));
  console.error('\nFix these in js/data.js before shipping.\n');
  process.exit(1);
}
console.log('✅ All recipe IDs unique.');

// ── Build a compact search blob per recipe ──────────────────────
// Full ingredient lines are heavy ("2 tbsp kibbeh (ETH143)").
// We keep only distinctive words, deduped — search stays accurate,
// payload stays small.
const STOP = new Set(['and','the','for','with','into','from','plus','then',
  'tbsp','tsp','cup','cups','g','kg','ml','litre','litres','oz','lb','large',
  'small','medium','fresh','dried','ground','chopped','sliced','diced','minced',
  'optional','to','taste','or','of','a','an','see','use','per','about','each',
  'finely','roughly','thinly','halved','quartered','peeled','washed','cut',
  'pieces','piece','whole','extra','more','less','if','needed','room','temperature']);

function searchBlob(r) {
  // Only what ISN'T already an index field. title/desc/tags/cuisine/country
  // are searched directly, so duplicating them here is wasted bytes.
  const bits = [];
  if (Array.isArray(r.keywords))    bits.push(r.keywords.join(' '));
  if (Array.isArray(r.ingredients)) bits.push(r.ingredients.join(' '));

  const words = bits.join(' ').toLowerCase()
    .replace(/\([^)]*\)/g,' ')          // drop "(ETH143)" cross-refs
    .replace(/\/\/[^,]*/g,' ')           // drop "// section" comment lines
    .replace(/[^a-z0-9\u00C0-\u024F' ]+/g,' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w) && !/^\d/.test(w));

  // cap at the 34 most distinctive terms — beyond that adds bytes, not recall
  return [...new Set(words)].slice(0, 34).join(' ');
}

// Cards truncate long copy anyway; the full desc lives in the detail file.
function shortDesc(d) {
  if (!d) return '';
  if (d.length <= 150) return d;
  const cut = d.slice(0, 150);
  const sp = cut.lastIndexOf(' ');
  return (sp > 110 ? cut.slice(0, sp) : cut) + '…';
}

// ── Emit ────────────────────────────────────────────────────────
const outDir  = path.join(__dirname,'data');
const fullDir = path.join(outDir,'recipes');
fs.mkdirSync(fullDir,{recursive:true});

// clear stale detail files
fs.readdirSync(fullDir).forEach(f => {
  if (f.endsWith('.json')) fs.unlinkSync(path.join(fullDir,f));
});

const index = [];
let fullBytes = 0;

RECIPES.forEach(r => {
  const light = {};
  INDEX_FIELDS.forEach(k => { if (r[k] !== undefined) light[k] = r[k]; });
  if (light.desc) light.desc = shortDesc(light.desc);
  light.s = searchBlob(r);           // 's' = search blob (short key saves bytes)
  index.push(light);

  const json = JSON.stringify(r);
  fullBytes += json.length;
  fs.writeFileSync(path.join(fullDir, `${r.id}.json`), json);
});

const indexJson = JSON.stringify(index);
fs.writeFileSync(path.join(outDir,'index.json'), indexJson);

// ── Report ──────────────────────────────────────────────────────
const zlib = require('zlib');
const gz = s => zlib.gzipSync(Buffer.from(s)).length;
const mb = b => (b/1048576).toFixed(2);
const kb = b => (b/1024).toFixed(0);

const origRaw = fs.statSync(path.join(__dirname,'js','data.js')).size;
const origGz  = gz(src);
const idxGz   = gz(indexJson);

console.log('\n' + '═'.repeat(58));
console.log('BEFORE — every visitor downloaded the whole database');
console.log(`  js/data.js          ${mb(origRaw)} MB raw   ${mb(origGz)} MB gzipped`);
console.log('\nAFTER — visitors download the catalogue only');
console.log(`  data/index.json     ${mb(indexJson.length)} MB raw   ${mb(idxGz)} MB gzipped`);
console.log(`  data/recipes/*.json ${RECIPES.length} files, ${kb(fullBytes/RECIPES.length)} KB avg — fetched on demand`);
console.log('\nInitial payload reduction: ' +
  (100 - (idxGz/origGz*100)).toFixed(1) + '%  (' +
  mb(origGz - idxGz) + ' MB saved per first visit)');
console.log('═'.repeat(58));
