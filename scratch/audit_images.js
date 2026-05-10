const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = 'f:\\MosterAds\\MonsterCreative\\src\\renderer\\public\\OutputSocialAds';
const files = fs.readdirSync(dir);

const results = [];

files.forEach(file => {
    if (file.match(/^t\d+\.png$/)) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        // Use powershell to get dimensions if possible, or just report size
        // Since I can't easily get dimensions without a lib, I'll try to use a command-line tool if available.
        // Actually, I can use a small trick with powershell to get image dimensions.
        results.push({
            name: file,
            size: stats.size,
            format: 'PNG'
        });
    }
});

console.log(JSON.stringify(results, null, 2));
