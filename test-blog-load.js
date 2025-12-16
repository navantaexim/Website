
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(process.cwd(), 'blogs');

console.log('Testing Blog Loading...');
console.log('BLOG_DIR:', BLOG_DIR);

if (!fs.existsSync(BLOG_DIR)) {
    console.error('BLOG_DIR does not exist!');
    process.exit(1);
}

const slug = 'Essential-Exim-Documentation';
const htmlPath = path.join(BLOG_DIR, `${slug}.html`);

console.log('Looking for:', htmlPath);

if (fs.existsSync(htmlPath)) {
    console.log('File found.');
    try {
        const content = fs.readFileSync(htmlPath, 'utf8');
        console.log('File read successfully. Length:', content.length);
    } catch (err) {
        console.error('Error reading file:', err);
    }
} else {
    console.error('File NOT found.');
    // List dir to show what is there
    const files = fs.readdirSync(BLOG_DIR);
    console.log('Files in blogs dir:', files);
}
