const fs = require('fs');

async function testUpload() {
  try {
    const dbPath = 'f:/MosterAds/MonsterCreative/settings.json'; // using raw path since we don't have dbService
    let apiKey = '';
    
    // Read the API key from the local app data database where electron-store saves it
    // Wait, the DB service actually uses better-sqlite3 in appData.
    const appData = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config');
    const dbFile = appData + '/MosterAds/monster.db';
    
    const Database = require('better-sqlite3');
    const db = new Database(dbFile);
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('fal_api_key');
    if (!row) throw new Error("No FAL API Key found in DB!");
    
    apiKey = row.value;
    
    console.log('Got API key, uploading dummy image...');
    
    // Create a 1x1 pixel base64 jpeg
    const base64Data = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
    const buffer = Buffer.from(base64Data, 'base64');

    console.log('Sending to fal.media/files/upload...');
    const response = await fetch('https://fal.media/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Fal-File-Name': 'test.jpg',
        'Content-Type': 'image/jpeg',
        'Accept': 'application/json'
      },
      body: buffer
    });

    console.log('Response HTTP Status:', response.status, response.statusText);
    const text = await response.text();
    console.log('Response Text:', text);
  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

testUpload();
