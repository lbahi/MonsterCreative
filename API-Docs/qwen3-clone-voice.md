# Qwen 3 TTS - Clone Voice [1.7B]

> Clone your voices using Qwen3-TTS Clone-Voice model with zero shot cloning capabilities and use it on text-to-speech models to create speeches of yours!


## Overview

- **Endpoint**: `https://fal.run/fal-ai/qwen-3-tts/clone-voice/1.7b`
- **Model ID**: `fal-ai/qwen-3-tts/clone-voice/1.7b`
- **Category**: audio-to-audio
- **Kind**: inference
**Tags**: clone-voice, voice-clone



## Pricing

- **Price**: $0.0008 per minutes

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`audio_url`** (`string`, _required_):
  URL to the reference audio file used for voice cloning.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/qwen3-tts/clone_in.mp3"

- **`reference_text`** (`string`, _optional_):
  Optional reference text that was used when creating the speaker embedding. Providing this can improve synthesis quality when using a cloned voice.
  - Examples: "Okay. Yeah. I resent you. I love you. I respect you. But you know what? You blew it! And it is all thanks to you."



**Required Parameters Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/qwen3-tts/clone_in.mp3"
}
```

**Full Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/qwen3-tts/clone_in.mp3",
  "reference_text": "Okay. Yeah. I resent you. I love you. I respect you. But you know what? You blew it! And it is all thanks to you."
}
```


### Output Schema

The API returns the following output format:

- **`speaker_embedding`** (`File`, _required_):
  The generated speaker embedding file in safetensors format.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/qwen3-tts/clone_out.safetensors","content_type":"application/octet-stream","file_size":16288,"file_name":"tmpe71u7t4j.safetensors"}



**Example Response**:

```json
{
  "speaker_embedding": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/qwen3-tts/clone_out.safetensors",
    "content_type": "application/octet-stream",
    "file_size": 16288,
    "file_name": "tmpe71u7t4j.safetensors"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/qwen-3-tts/clone-voice/1.7b \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/qwen3-tts/clone_in.mp3"
   }'
```

### Python

Ensure you have the Python client installed:

```bash
pip install fal-client
```

Then use the API client to make requests:

```python
import fal_client

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
           print(log["message"])

result = fal_client.subscribe(
    "fal-ai/qwen-3-tts/clone-voice/1.7b",
    arguments={
        "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/qwen3-tts/clone_in.mp3"
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)
print(result)
```

### JavaScript

Ensure you have the JavaScript client installed:

```bash
npm install --save @fal-ai/client
```

Then use the API client to make requests:

```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/qwen-3-tts/clone-voice/1.7b", {
  input: {
    audio_url: "https://storage.googleapis.com/falserverless/example_inputs/qwen3-tts/clone_in.mp3"
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
console.log(result.data);
console.log(result.requestId);
```


## Additional Resources

### Documentation

- [Model Playground](https://fal.ai/models/fal-ai/qwen-3-tts/clone-voice/1.7b)
- [API Documentation](https://fal.ai/models/fal-ai/qwen-3-tts/clone-voice/1.7b/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/qwen-3-tts/clone-voice/1.7b)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)
