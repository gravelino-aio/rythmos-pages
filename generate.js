const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'template.html');
const dataPath = path.join(__dirname, 'data.json');
const outputDir = path.join(__dirname, 'dist');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const template = fs.readFileSync(templatePath, 'utf8');
const devices = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

devices.forEach(device => {
    let content = template;
    
    // Приклад заміни заголовка (можна розширити для всіх полів)
    content = content.replace(/Anchor <span>Type F<\/span>/g, device.title);
    
    const fileName = `${device.id}.html`;
    fs.writeFileSync(path.join(outputDir, fileName), content);
    console.log(`Generated: ${fileName}`);
});

console.log('\nSuccess! All pages are in the /dist folder.');
