// Script to generate or validate BIBLE_STRUCTURE from web_bible.json
// Usage: node generateBibleStructure.js

const fs = require('fs');
const path = require('path');

const biblePath = path.join(__dirname, 'web_bible.json');
const structurePath = path.join(__dirname, 'bibleStructure.js');

const bible = JSON.parse(fs.readFileSync(biblePath, 'utf-8'));

// Build new structure
const newStructure = {};
for (const [book, chapters] of Object.entries(bible)) {
  const chapterNums = Object.keys(chapters).map(Number).sort((a, b) => a - b);
  const versesArr = chapterNums.map(chapNum => {
    const verses = chapters[chapNum];
    return Object.keys(verses).length;
  });
  newStructure[book] = {
    chapters: chapterNums.length,
    verses: versesArr
  };
}

// Output as JS for copy-paste
const structureJS =
  'export const BIBLE_STRUCTURE = ' + JSON.stringify(newStructure, null, 2) + ";\n";

console.log('--- Generated BIBLE_STRUCTURE ---\n');
console.log(structureJS);

// Optionally, compare with existing bibleStructure.js
if (fs.existsSync(structurePath)) {
  const structureText = fs.readFileSync(structurePath, 'utf-8');
  let oldStructure;
  try {
    // Use eval to parse the export (safe here since it's local dev)
    oldStructure = eval(structureText.replace(/export const BIBLE_STRUCTURE = /, '').replace(/;\s*$/, ''));
  } catch (e) {
    console.warn('Could not parse existing bibleStructure.js:', e);
    oldStructure = null;
  }
  if (oldStructure) {
    let mismatch = false;
    for (const book of Object.keys(newStructure)) {
      if (!oldStructure[book]) {
        console.warn(`Book missing in old structure: ${book}`);
        mismatch = true;
        continue;
      }
      if (oldStructure[book].chapters !== newStructure[book].chapters) {
        console.warn(`Chapter count mismatch for ${book}: old=${oldStructure[book].chapters}, new=${newStructure[book].chapters}`);
        mismatch = true;
      }
      const oldVerses = oldStructure[book].verses;
      const newVerses = newStructure[book].verses;
      if (oldVerses.length !== newVerses.length) {
        console.warn(`Verse array length mismatch for ${book}: old=${oldVerses.length}, new=${newVerses.length}`);
        mismatch = true;
      } else {
        for (let i = 0; i < oldVerses.length; ++i) {
          if (oldVerses[i] !== newVerses[i]) {
            console.warn(`Verse count mismatch in ${book} chapter ${i+1}: old=${oldVerses[i]}, new=${newVerses[i]}`);
            mismatch = true;
          }
        }
      }
    }
    if (!mismatch) {
      // console.log('\nNo mismatches found! Your bibleStructure.js matches web_bible.json.');
    } else {
      // console.log('\nSee warnings above for mismatches.');
    }
  }
}

// Optionally, write new structure to file (uncomment to auto-update)
// fs.writeFileSync(structurePath, structureJS, 'utf-8');
