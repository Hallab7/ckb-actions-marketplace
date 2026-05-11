/**
 * Cell data layout:
 * [reward: 8 LE][deadline: 8 LE][status: 1][worker_lock_hash: 32 (optional)]
 * [title_len: 2 LE][title: n][desc_len: 2 LE][desc: m]
 *
 * Script args layout:
 * [poster_lock_hash: 32][reviewer_lock_hash: 32]
 */

const REWARD_OFFSET = 0;
const DEADLINE_OFFSET = 8;
const STATUS_OFFSET = 16;
const WORKER_OFFSET = 17;
const META_OFFSET_NO_WORKER = 17;
const META_OFFSET_WITH_WORKER = 49;

export interface TaskCellData {
  reward: bigint;
  deadline: bigint;
  status: number;
  workerLockHash?: Uint8Array;
  title: string;
  description: string;
}

export function encodeTaskData(data: TaskCellData): Uint8Array {
  const titleBytes = new TextEncoder().encode(data.title);
  const descBytes = new TextEncoder().encode(data.description);

  const hasWorker = !!data.workerLockHash;
  const metaOffset = hasWorker ? META_OFFSET_WITH_WORKER : META_OFFSET_NO_WORKER;
  const totalLen = metaOffset + 2 + titleBytes.length + 2 + descBytes.length;

  const buf = new Uint8Array(totalLen);
  const view = new DataView(buf.buffer);

  // reward (8 bytes LE)
  view.setBigUint64(REWARD_OFFSET, data.reward, true);
  // deadline (8 bytes LE)
  view.setBigUint64(DEADLINE_OFFSET, data.deadline, true);
  // status (1 byte)
  buf[STATUS_OFFSET] = data.status;

  let offset = META_OFFSET_NO_WORKER;

  // worker lock hash (32 bytes, optional)
  if (hasWorker && data.workerLockHash) {
    buf.set(data.workerLockHash, WORKER_OFFSET);
    offset = META_OFFSET_WITH_WORKER;
  }

  // title length + title
  view.setUint16(offset, titleBytes.length, true);
  offset += 2;
  buf.set(titleBytes, offset);
  offset += titleBytes.length;

  // desc length + desc
  view.setUint16(offset, descBytes.length, true);
  offset += 2;
  buf.set(descBytes, offset);

  return buf;
}

export function decodeTaskData(raw: Uint8Array): TaskCellData {
  if (raw.length < 17) throw new Error("Cell data too short");

  const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
  const reward = view.getBigUint64(REWARD_OFFSET, true);
  const deadline = view.getBigUint64(DEADLINE_OFFSET, true);
  const status = raw[STATUS_OFFSET];

  let offset = META_OFFSET_NO_WORKER;
  let workerLockHash: Uint8Array | undefined;

  if (status >= 1 && raw.length >= META_OFFSET_WITH_WORKER) {
    workerLockHash = raw.slice(WORKER_OFFSET, WORKER_OFFSET + 32);
    offset = META_OFFSET_WITH_WORKER;
  }

  let title = "";
  let description = "";

  if (raw.length > offset + 2) {
    const titleLen = view.getUint16(offset, true);
    offset += 2;
    if (raw.length >= offset + titleLen) {
      title = new TextDecoder().decode(raw.slice(offset, offset + titleLen));
      offset += titleLen;
    }
    if (raw.length > offset + 2) {
      const descLen = view.getUint16(offset, true);
      offset += 2;
      if (raw.length >= offset + descLen) {
        description = new TextDecoder().decode(raw.slice(offset, offset + descLen));
      }
    }
  }

  return { reward, deadline, status, workerLockHash, title, description };
}

export function encodeTaskArgs(
  posterLockHash: Uint8Array,
  reviewerLockHash: Uint8Array
): Uint8Array {
  const args = new Uint8Array(64);
  args.set(posterLockHash, 0);
  args.set(reviewerLockHash, 32);
  return args;
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
