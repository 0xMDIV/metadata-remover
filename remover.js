const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Check if folder path is provided
if (process.argv.length < 3) {
    console.error("Usage: node remover.js <folder-path>");
    process.exit(1);
}

const folderPath = process.argv[2];

// Check if the provided folder exists
if (!fs.existsSync(folderPath)) {
    console.error("Error: The specified folder does not exist.");
    process.exit(1);
}

// Read all files in the folder
fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error("Error reading folder:", err);
        process.exit(1);
    }

    files.forEach((file) => {
        const filePath = path.join(folderPath, file);

        // Process only image files (JPEG, PNG, WebP, etc.)
        if (/\.(jpe?g|png|webp)$/i.test(file)) {
            const tempFilePath = path.join(folderPath, `temp_${file}`);
            sharp(filePath)
                .toBuffer({ resolveWithObject: true })
                .then(({ data }) => {
                    // Write the file without metadata
                    sharp(data)
                        .toFile(tempFilePath)
                        .then(() => {
                            // Replace the original file with the new file
                            fs.rename(tempFilePath, filePath, (renameErr) => {
                                if (renameErr) {
                                    console.error(`Error replacing file ${file}:`, renameErr);
                                } else {
                                    console.log(`Metadata removed: ${file}`);
                                }
                            });
                        })
                        .catch((writeErr) => {
                            console.error(`Error writing file ${file}:`, writeErr);
                        });
                })
                .catch((sharpErr) => {
                    console.error(`Error processing file ${file}:`, sharpErr);
                });
        }
    });
});
