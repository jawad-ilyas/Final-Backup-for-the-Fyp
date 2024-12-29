import fs from "fs"
// Load the data
const data = JSON.parse(fs.readFileSync('questions.json', 'utf8'));

// Update the tags field
data.forEach((doc) => {
    if (Array.isArray(doc.tags)) {
        doc.tags = doc.tags.map(tag => tag.toLowerCase());
    }
});

// Save the modified data
fs.writeFileSync('questions_updated.json', JSON.stringify(data, null, 2));
console.log('Tags have been updated and saved to questions_updated.json');
