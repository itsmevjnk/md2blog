const showdown = require('showdown');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = process.env.MD_INPUT || 'input';
const TEMPLATE_DIR = process.env.MD_TEMPLATE || 'template';
const OUTPUT_DIR = process.env.MD_OUTPUT || 'output';

let postTemplate;
const postTemplatePath = path.join(TEMPLATE_DIR, 'post.html');
try {
    postTemplate = fs.readFileSync(postTemplatePath).toString();
    console.debug(`Loaded post template from ${postTemplate}`);
} catch (err) {
    console.error(`Cannot open post template filr ${postTemplatePath}: ${err}`);
    process.exit(1);
}

let classes = {};
const classesPath = path.join(TEMPLATE_DIR, 'classes.json');
try {
    classes = JSON.parse(fs.readFileSync(classesPath));
    console.debug(`Loaded custom classes for ${Object.keys(classes).length} element(s) from ${classesPath}`);
} catch (err) {
    console.warn(`Cannot open classes file ${classesPath}: ${err} - not setting custom classes for elements`);
}
showdown.setOption('extensions', Object.keys(classes).map((key) => ({
    type: 'output',
    regex: new RegExp(`<${key}([^>]*)>`, 'g'),
    replace: `<${key} class="${classes[key]}" $1>`
})));
showdown.setOption('tables', true);
showdown.setOption('strikethrough', true);
showdown.setOption('noHeaderId', true); // remove clutter

let inputFiles;
try {
    inputFiles = fs.readdirSync(INPUT_DIR, { recursive: true });
} catch(err) {
    console.error(`Cannot open input directory ${INPUT_DIR}: ${err}`);
    process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
    try {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.debug(`Created output directory ${OUTPUT_DIR}`);
    } catch (err) {
        console.error(`Cannot create output directory ${OUTPUT_DIR}: ${err}`);
        process.exit(1);   
    }
}

const staticPath = path.join(TEMPLATE_DIR, 'static');
if (fs.existsSync(staticPath)) {
    console.log('Copying static files...');

    fs.cpSync(staticPath, OUTPUT_DIR, { recursive: true });
}

for (let file of inputFiles) {
    const filePath = path.join(INPUT_DIR, file);
    
    console.log(`Converting ${filePath}...`);
    let html;
    try {
        html = new showdown.Converter().makeHtml(fs.readFileSync(filePath).toString());
    } catch (err) {
        console.error(`Cannot convert ${filePath}: ${err}`);
        continue;
    }

    /* extract title */
    let title = '';
    for (let i = 1; i <= 6; i++) {
        let titleMatch = /<h1[^>]*>(.*)<\/h1>/g.exec(html);
        if (!titleMatch) continue;
        
        title = titleMatch[1].replaceAll(/<[^>]*>/g, '');
        break;
    }
    if (!title.length) console.warn(' - No title found');
    else console.debug(` - Post title: ${title}`);

    const fileParsed = path.parse(file);
    const outputDir = path.join(OUTPUT_DIR, fileParsed.dir);
    if (!fs.existsSync(outputDir)) {
        try {
            fs.mkdirSync(outputDir, { recursive: true });
            console.debug(` - Created output directory ${outputDir}`);
        } catch (err) {
            console.error(` - Cannot create output directory ${outputDir}: ${err} - skipping this file`);
            continue;  
        }
    }
    const outputPath = path.join(outputDir, fileParsed.name + '.html');
    try {
        fs.writeFileSync(outputPath, postTemplate.replaceAll('${TITLE}', title).replaceAll('${CONTENT}', html));
        console.debug(` - Output file ${outputPath} written successfully`);
    } catch (err) {
        console.error(` - Cannot write output file ${outputPath}: ${err} - skipping`);
        continue;
    }
}
