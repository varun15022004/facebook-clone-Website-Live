import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walkDir(srcDir);
let modCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('http://localhost:5000')) {
        // Handle standalone quotes first
        content = content.replace(/'http:\/\/localhost:5000/g, "'");
        content = content.replace(/"http:\/\/localhost:5000/g, '"');
        
        // Handle instances inside backticks
        content = content.replace(/http:\/\/localhost:5000/g, '');
        
        fs.writeFileSync(file, content, 'utf8');
        modCount++;
    }
});

console.log(`Replaced hardcoded localhost URLs in ${modCount} files.`);
