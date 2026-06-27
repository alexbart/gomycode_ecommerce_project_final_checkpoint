export const USD_TO_KES_RATE = 130

export function convertUsdToKes(usd: number, rate: number = USD_TO_KES_RATE) {
  if (!Number.isFinite(usd)) return 0
  return usd * rate
}

export function formatKES(amountKes: number) {
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 2,
    }).format(amountKes)
  } catch {
    return `KES ${amountKes}`
  }
}

