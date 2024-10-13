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
    console.debug(`Loaded post template from ${postTemplatePath}`);
} catch (err) {
    console.error(`Cannot open post template file ${postTemplatePath}: ${err}`);
    process.exit(1);
}

let classes = {};
const classesPath = path.join(TEMPLATE_DIR, 'classes.json');
if (fs.existsSync(classesPath)) {
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
}
showdown.setFlavor('github');
const sdOptions = {
    extensions: Object.keys(classes).map((key) => ({
        type: 'output',
        regex: new RegExp(`<${key}([^>]*)>`, 'g'),
        replace: `<${key} class="${classes[key]}" $1>`
    })),
    metadata: true,
    tables: true,
    strikethrough: true,
    noHeaderId: true
};

let postsTemplate;
const postsTemplatePath = path.join(TEMPLATE_DIR, 'posts.html');
try {
    postsTemplate = fs.readFileSync(postsTemplatePath).toString();
    console.debug(`Loaded posts list template from ${postsTemplatePath}`);
} catch (err) {
    console.error(`Cannot open posts list template file ${postsTemplatePath}: ${err}`);
    process.exit(1);
}

let inputFiles;
try {
    inputFiles = fs.readdirSync(INPUT_DIR, { recursive: true, withFileTypes: true });
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
    console.log('Copying static files from template...');
    try {
        fs.cpSync(staticPath, OUTPUT_DIR, { recursive: true });
    } catch (err) {
        console.error(`Cannot copy static files from ${staticPath} to ${OUTPUT_DIR}: ${err}`);
        process.exit(1);
    }
}

let posts = new Map();

for (let file of inputFiles) {
    if (!file.isFile()) continue; // ignore directory dirents

    const filePath = path.join(file.parentPath, file.name);
    const fileParsed = path.parse(file.name);

    if (fileParsed.ext.toLowerCase() != '.md') {
        /* not Markdown - just copy the file over to the output */
        console.log(`Copying ${filePath}...`);
        const pathParts = filePath.split(path.sep); pathParts[0] = OUTPUT_DIR; const destPath = path.join(...pathParts);
        try {
            fs.cpSync(filePath, destPath, { recursive: true });
        } catch (err) {
            console.error(` - Cannot copy file ${filePath} to ${destPath}: ${err}`);
        }
        continue;
    }
    
    console.log(`Converting ${filePath}...`);
    const converter = new showdown.Converter(sdOptions);
    let html;
    try {
        html = converter.makeHtml(fs.readFileSync(filePath).toString());
    } catch (err) {
        console.error(` - Cannot convert ${filePath}: ${err}`);
        continue;
    }

    /* get metadata */
    const metadata = converter.getMetadata();
    console.debug(` - Metadata:`, metadata);

    /* extract title */
    let title = metadata.title || '';
    if (!title.length) {
        for (let i = 1; i <= 6; i++) {
            let titleMatch = /<h1[^>]*>(.*)<\/h1>/g.exec(html);
            if (!titleMatch) continue;
            
            title = titleMatch[1].replaceAll(/<[^>]*>/g, '');
            break;
        }
        if (!title.length) console.warn(' - No title found');
    }
    console.debug(` - Post title: ${title}`);

    /* extract date */
    let date;
    try {
        date = new Date(metadata.date || fs.statSync(filePath).mtime);
    } catch (err) {
        console.error(` - Cannot stat ${filePath}`);
        date = new Date();
    }
    console.debug(` - Post date: ${date}`);

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
    
    /* save to posts list */
    if (fileParsed.name.toLowerCase() != 'index') {
        posts.set(date.getTime(), {
            date: date.toDateString(),
            link: fileParsed.name + '.html',
            title: title
        });
    }
}

posts = new Map([...posts.entries()].sort().reverse());
// console.debug('List of posts sorted by date:', posts);

const templateReplacements = []; // list of replacements to be made
for (let match of postsTemplate.matchAll(/\${ITEM:([^}]*)}/gm)) {
    const repl = {
        index: match.index,
        length: match[0].length,
        value: ''
    };
    posts.forEach((post) => {
        // console.debug(posts);
        repl.value += match[1]
            .replaceAll('$DATE', post.date)
            .replaceAll('$LINK', post.link)
            .replaceAll('$TITLE', post.title);
    });
    templateReplacements.push(repl);
}

let templateIndex = 0;
let postsOutput = '';
for (const repl of templateReplacements) {
    postsOutput += postsTemplate.slice(templateIndex, repl.index); // copy up to our replacement point
    postsOutput += repl.value;
    templateIndex = repl.index + repl.length;
}
postsOutput += postsTemplate.slice(templateIndex); // copy remaining parts of the template

const postsPath = path.join(OUTPUT_DIR, 'posts.html');

console.debug(`Writing posts list file ${postsPath}...`);
try {
    fs.writeFileSync(postsPath, postsOutput);
} catch (err) {
    console.error(` - Cannot write to posts list file ${postsPath}: ${err}`);
    process.exit(1);
}
