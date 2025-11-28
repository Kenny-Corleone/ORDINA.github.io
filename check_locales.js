const fs = require('fs');
const path = require('path');

const localesDir = path.join('c:\\Users\\ANCL\\Desktop\\ORDINA 2.1\\locales');
const files = ['locale-en.json', 'locale-ru.json', 'locale-az.json'];

const contents = {};
files.forEach(file => {
    contents[file] = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
});

const allKeys = new Set();
Object.values(contents).forEach(json => {
    Object.keys(json).forEach(key => allKeys.add(key));
});

const missingKeys = {};
files.forEach(file => {
    missingKeys[file] = [];
    allKeys.forEach(key => {
        if (!contents[file].hasOwnProperty(key)) {
            missingKeys[file].push(key);
        }
    });
});

console.log('Missing keys report:');
let hasMissing = false;
Object.entries(missingKeys).forEach(([file, keys]) => {
    if (keys.length > 0) {
        hasMissing = true;
        console.log(`${file} is missing keys: ${keys.join(', ')}`);
    } else {
        console.log(`${file} is complete.`);
    }
});

if (!hasMissing) {
    console.log('All locale files have the same keys.');
}
