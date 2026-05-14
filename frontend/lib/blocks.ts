/** CKB produces ~1 block every 10 seconds */
export function blocksToHuman(blocks: number | bigint): string {
  const totalSeconds = Number(blocks) * 10;
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    const remMins = minutes % 60;
    if (remHours === 0 && remMins === 0) return `${days}d`;
    if (remMins === 0) return `${days}d ${remHours}h`;
    if (remHours === 0) return `${days}d ${remMins}min`;
    return `${days}d ${remHours}h ${remMins}min`;
  }
  if (hours > 0) {
    const remMins = minutes % 60;
    return remMins === 0 ? `${hours}h` : `${hours}h ${remMins}min`;
  }
  if (minutes > 0) return `${minutes}min`;
  return `${totalSeconds}s`;
}
