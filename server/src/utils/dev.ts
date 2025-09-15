export const isDev = !process.env.PRODUCTION || process.env.PRODUCTION === 'false'
console.log('is dev lindo', process.env.PRODUCTION)