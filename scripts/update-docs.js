const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '..', 'js');
const docsDir = path.join(__dirname, '..', 'docs', 'js');

// Ensure docs directory exists
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

fs.readdir(jsDir, (err, files) => {
    if (err) {
        console.error('Error reading js directory:', err);
        return;
    }

    const outdatedFiles = [];

    files.forEach(file => {
        if (path.extname(file) === '.js') {
            const jsFilePath = path.join(jsDir, file);
            const docFilePath = path.join(docsDir, file + '.md');

            try {
                const jsStat = fs.statSync(jsFilePath);
                
                if (!fs.existsSync(docFilePath)) {
                    outdatedFiles.push(jsFilePath);
                } else {
                    const docStat = fs.statSync(docFilePath);
                    if (jsStat.mtime > docStat.mtime) {
                        outdatedFiles.push(jsFilePath);
                    }
                }
            } catch (e) {
                console.error(`Error processing file ${file}:`, e);
            }
        }
    });

    if (outdatedFiles.length > 0) {
        console.log('Outdated documentation for the following files:');
        outdatedFiles.forEach(file => console.log(file));
    } else {
        console.log('All documentation is up to date.');
    }
});
