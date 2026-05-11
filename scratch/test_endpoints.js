const https = require('node:https')

async function testEndpoint(endpoint) {
  const apiKey = process.env.FAL_API_KEY // I'll assume it's available in my env if I were running it, but I'll use it to check the 422 logic.
  if (!apiKey) {
    console.error('No API key found in env.')
    return
  }

  const payload = {
    input: {
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: 'Hello' }]
        }
      ]
    }
  }

  const data = JSON.stringify(payload)
  const options = {
    hostname: 'queue.fal.run',
    port: 443,
    path: `/${endpoint}`,
    method: 'POST',
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'HTTP-Referer': 'https://monstercreative.app'
    }
  }

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`Endpoint: ${endpoint} -> Status: ${res.statusCode}`)
      let body = ''
      res.on('data', (d) => (body += d))
      res.on('end', () => resolve({ status: res.statusCode, body }))
    })
    req.on('error', (e) => console.error(e))
    req.write(data)
    req.end()
  })
}

// We will test both to see which one is valid
// testEndpoint('openrouter/router/vision');
// testEndpoint('openrouter/router');
