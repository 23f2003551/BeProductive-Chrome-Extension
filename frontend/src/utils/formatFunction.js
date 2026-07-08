
export function formatDuration(ms) {
    if (ms==null || isNaN(ms)) return '—'

    const totalSeconds = Math.round(ms/1000)
    const minutes = Math.floor(totalSeconds/60)
    const seconds = totalSeconds%60

    if (minutes===0) {
        return `${seconds} sec`
    }
    if (seconds===0) {
        return `${minutes} min`
    }
    return `${minutes} min and ${seconds} sec`
}