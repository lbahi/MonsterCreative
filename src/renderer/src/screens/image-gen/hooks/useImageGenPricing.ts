import { useEffect, useState } from 'react'

import { MODEL_ENDPOINT_MAP, MODEL_FALLBACK_PRICES } from '../constants'

export function useImageGenPricing() {
  const [modelPrices, setModelPrices] = useState<Record<string, number>>(MODEL_FALLBACK_PRICES)
  const [pricesLoading, setPricesLoading] = useState(true)

  useEffect(() => {
    async function fetchPricing() {
      try {
        const ids = Object.values(MODEL_ENDPOINT_MAP)
        const res = await window.api.fal.getPricing(ids)
        if (!res.error && res.prices) {
          const nextPrices: Record<string, number> = { ...MODEL_FALLBACK_PRICES }
          for (const [name, endpointId] of Object.entries(MODEL_ENDPOINT_MAP)) {
            const found = res.prices.find((price: any) => price.endpoint_id === endpointId)
            if (found) nextPrices[name] = found.unit_price
          }
          setModelPrices(nextPrices)
        }
      } catch {
        // Keep fallback prices if the API is unavailable.
      } finally {
        setPricesLoading(false)
      }
    }

    fetchPricing()
  }, [])

  return { modelPrices, pricesLoading }
}
