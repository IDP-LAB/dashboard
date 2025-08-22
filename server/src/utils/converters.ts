/**
 * Converte um tamanho em bytes num string legível (B, KB, MB, GB, ...).
 *
 * @param byteLength - tamanho em bytes
 * @param decimals - número de casas decimais (padrão: 2)
 * @returns string formatada, ex: "1.23 MB"
 */
export function bytesToSizeString(byteLength: number, decimals: number = 2): string {
  if (byteLength === 0) {
    return '0 B'
  }

  const k = 1024
  const dm = Math.max(0, decimals)
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const

  const i = Math.floor(Math.log(Math.abs(byteLength)) / Math.log(k))
  const value = byteLength / Math.pow(k, i)
  const formatted = value.toFixed(dm)

  return `${formatted} ${sizes[i]}`
}

/**
 * Converte uma string de duração (ex: "1D", "12h", "30m") em um objeto Date.
 * @param duration A string de duração.
 * @returns Um objeto Date representando a data de expiração, ou null se a duração for nula.
 */
export function parseDuration(duration?: string): Date | undefined {
  if (!duration) return

  const value = parseInt(duration.slice(0, -1), 10)
  const unit = duration.slice(-1).toLowerCase()

  if (isNaN(value)) return

  const date = new Date()

  switch (unit) {
  case 'd':
    date.setDate(date.getDate() + value)
    break
  case 'h':
    date.setHours(date.getHours() + value)
    break
  case 'm':
    date.setMinutes(date.getMinutes() + value)
    break
  default:
    return // Unidade inválida
  }

  return date
}