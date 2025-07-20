export const timer = {
  number: (expires: string): number | null => {
    const regex = /^(\d+(\.\d+)?)\s*([hmdMy]?)$/i
    const match = expires.match(regex)
    if (!match) {
      return null
    }
    const numeric = parseFloat(match[1])
    const ffix = match[3]
    switch (ffix) {
    case 'h':
      return numeric * 60 * 60 * 1000
    case 'm':
      return numeric * 60 * 1000
    case 'd':
      return numeric * 24 * 60 * 60 * 1000
    case 'M':
      return numeric * 30 * 24 * 60 * 60 * 1000
    case 'y':
      return numeric * 365 * 24 * 60 * 60 * 1000
    default:
      return null
    }
  },
  string: (timestamp: number): string | null => {
    const minutes = 60 * 1000
    const hours = 60 * minutes
    const days = 24 * hours
    const months = 30 * days
    const years = 365 * days

    if (timestamp >= years) {
      return `${Math.floor(timestamp / years)}y`
    } else if (timestamp >= months) {
      return `${Math.floor(timestamp / months)}M`
    } else if (timestamp >= days) {
      return `${Math.floor(timestamp / days)}d`
    } else if (timestamp >= hours) {
      return `${Math.floor(timestamp / hours)}h`
    } else if (timestamp >= minutes) {
      return `${Math.floor(timestamp / minutes)}m`
    }

    return null
  }
}

/**
 * Formata o tempo de atividade de segundos para uma string legível.
 */
export function formatUptime(seconds: number): string {
  const dias = Math.floor(seconds / 86400)
  seconds %= 86400
  const horas = Math.floor(seconds / 3600)
  seconds %= 3600
  const minutos = Math.floor(seconds / 60)
  const segundos = Math.floor(seconds % 60)

  // Constrói a string final, adicionando as partes que não são zero.
  const partes: string[] = []
  if (dias > 0) partes.push(`${dias}d`)
  if (horas > 0) partes.push(`${horas}h`)
  if (minutos > 0) partes.push(`${minutos}m`)
  if (segundos > 0 || partes.length === 0) partes.push(`${segundos}s`)

  return partes.join(' ')
}