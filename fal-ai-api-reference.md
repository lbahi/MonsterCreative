# Fal.ai API Reference

## Authentication
- **Header:** `Authorization`
- **Value Format:** `Key YOUR_API_KEY` (Important: Must be prefixed with `Key `, not `Bearer `).

---

## 1. Get Pricing
**Endpoint:** `GET https://api.fal.ai/v1/models/pricing`

**Description:** Returns unit pricing for specific endpoint IDs. Used for estimating costs or checking billing rates.

**Query Parameters:**
- `endpoint_id` (string | array[string]): Required. Filter by specific endpoint ID(s). Accepts 1-50 IDs.
  - Example: `?endpoint_id=fal-ai/flux/dev` or `?endpoint_id=model1,model2`

**Response (`200 OK`):**
```json
{
  "next_cursor": null,
  "has_more": false,
  "prices": [
    {
      "endpoint_id": "fal-ai/flux/dev",
      "unit_price": 0.025,
      "unit": "image",
      "currency": "USD"
    }
  ]
}
```

**Errors:**
Standard JSON error structure with `{"error": { "type": "...", "message": "..." }}`.
- `401`: Authentication required (`authorization_error`).
- `400`: Invalid request parameters (`validation_error`).
- `429`: Rate limit exceeded (`rate_limited`).

---

## 2. Estimate Cost
**Endpoint:** `POST https://api.fal.ai/v1/models/pricing/estimate`

**Description:** Computes cost estimates using one of two methods: historical usage patterns or expected billing unit quantity. 

**Request Body (JSON):**

*Method A: Historical API Price* (Based on past usage patterns)
```json
{
  "estimate_type": "historical_api_price",
  "endpoints": {
    "fal-ai/flux/dev": {
      "call_quantity": 100
    }
  }
}
```

*Method B: Unit Price* (Based on specific output quantity like images/video duration)
```json
{
  "estimate_type": "unit_price",
  "endpoints": {
    "fal-ai/flux/dev": {
      "unit_quantity": 50
    }
  }
}
```

**Response (`200 OK`):**
```json
{
  "estimate_type": "historical_api_price",
  "total_cost": 3.75,
  "currency": "USD"
}
```

---

## 3. Usage Records
**Endpoint:** `GET https://api.fal.ai/v1/models/usage`

**Description:** Returns paginated usage records for the workspace with filters for endpoints, dates, user, and auth method. Each record includes billed units, unit price, and total cost.

> [!WARNING]
> **Authentication:** This endpoint specifically requires an Admin API Key (`Authorization: Key YOUR_ADMIN_API_KEY`), otherwise you will receive a `403 Access Denied` or `401 Authentication Required` error.

**Query Parameters:**
- `start` / `end` (string): ISO8601 date format. Start defaults to 24 hours ago.
- `limit` (integer): Max items to return per page.
- `expand` (array[string]): Minimum one of tracking types required. Options: `time_series`, `summary`, `auth_method`.
  - Example: `?expand=time_series&expand=summary`
- `timeframe` (enum): Aggregation timeframe (`minute`, `hour`, `day`, `week`, `month`).
- `endpoint_id` (string | array[string]): Filter by endpoint.

**Response (`200 OK`):**
```json
{
  "next_cursor": null,
  "has_more": false,
  "time_series": [
    {
      "bucket": "2025-01-15T00:00:00-05:00",
      "results": [
        {
          "endpoint_id": "fal-ai/flux/dev",
          "unit": "image",
          "quantity": 4,
          "unit_price": 0.1,
          "cost": 0.4,
          "currency": "USD",
          "auth_method": "Production Key"
        }
      ]
    }
  ]
}
```

---

## 4. Analytics
**Endpoint:** `GET https://api.fal.ai/v1/models/analytics`

**Description:** Time-bucketed performance and reliability metrics per model endpoint, including request counts, error rates, and latency percentiles (queue/prepare vs. duration).

**Query Parameters:**
- `start` / `end` (string): ISO8601 date format.
- `limit` / `cursor` (integer/string): Pagination parameters.
- `endpoint_id` (string | array[string]): Required. Filter by endpoint.
- `expand` (array[string]): Specifies the structure and the specific metrics to calculate.
   - Core structures: `time_series`, `summary`
   - Metrics available: `request_count`, `success_count`, `user_error_count`, `error_count`, `p50_prepare_duration`, `p75_prepare_duration`, `p90_prepare_duration`, `p50_duration`, `p75_duration`, `p90_duration`.
   - *Example:* `?expand=time_series&expand=request_count&expand=success_count&Endpoint_id=fal-ai/flux/dev`

**Response (`200 OK`):**
```json
{
  "next_cursor": null,
  "has_more": false,
  "time_series": [
    {
      "bucket": "2025-01-15T12:00:00-05:00",
      "results": [
        {
          "endpoint_id": "fal-ai/flux/dev",
          "request_count": 1500,
          "success_count": 1450,
          "p50_duration": 2.5,
          "p90_duration": 4.8
        }
      ]
    }
  ]
}
```
