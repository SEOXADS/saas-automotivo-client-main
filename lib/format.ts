/**
 * Formata um valor monetário para o padrão brasileiro (R$)
 * @param value - Valor em centavos (ex: 13500000 = R$ 135.000,00)
 * @returns String formatada no padrão brasileiro
 */
export function formatPrice(value: number | string | null | undefined): string {
  if (!value) return 'R$ 0,00'

  // Converte para número se for string
  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  // Sempre divide por 100 pois a API sempre retorna valores em centavos
  const realValue = numericValue / 100

  return realValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

/**
 * Formata um valor monetário simples (sem símbolo R$)
 * @param value - Valor em centavos
 * @returns String formatada sem símbolo
 */
export function formatPriceValue(value: number | string | null | undefined): string {
  if (!value) return '0,00'

  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  // Sempre divide por 100 pois a API sempre retorna valores em centavos
  const realValue = numericValue / 100

  return realValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
