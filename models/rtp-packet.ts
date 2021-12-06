/*
 * Header reference (from https://tools.ietf.org/html/rfc3550#section-5.1):
 *
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |V=2|P|X|  CC   |M|     PT      |       sequence number         |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                           timestamp                           |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |           synchronization source (SSRC) identifier            |
 * +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 * |            contributing source (CSRC) identifiers             |
 * |                             ....                              |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 */

export class RTPPacket {
  public data: Buffer;

  constructor(data?: Buffer) {
    if (!data) {
      this.data = Buffer.alloc(12);
      this.version = 2;
      return;
    }

    if (data.length === 0) {
      throw new Error("Cannot create packet from empty buffer");
    }

    const csrcCount = data.readUInt8(0) & 0b00001111;
    const headerBytes = 12 + 4 * csrcCount;

    if (data.length < headerBytes) {
      throw new Error(
        `Invalid packet buffer: expected at least ${headerBytes} bytes, got ${data.length}`
      );
    }

    this.data = data;
  }

  public get version(): number {
    return this.data.readUInt8(0) >> 6;
  }

  public set version(version: number) {
    checkRange(version, 0, 3, "version");

    this.data.writeUInt8(
      (this.data.readUInt8(0) & 0b00111111) + (version << 6),
      0
    );
  }

  public get padding(): boolean {
    return (this.data.readUInt8(0) & 0b00100000) !== 0;
  }

  public set padding(padding: boolean) {
    let firstByte = this.data.readUInt8(0);

    if (padding) {
      firstByte |= 0b00100000;
    } else {
      firstByte &= 0b11011111;
    }

    this.data.writeUInt8(firstByte, 0);
  }

  public get extension(): boolean {
    return (this.data.readUInt8(0) & 0b00010000) !== 0;
  }

  public set extension(extension: boolean) {
    let firstByte = this.data.readUInt8(0);

    if (extension) {
      firstByte |= 0b00010000;
    } else {
      firstByte &= 0b11101111;
    }

    this.data.writeUInt8(firstByte, 0);
  }

  public get csrcCount(): number {
    return this.data.readUInt8(0) & 0b00001111;
  }

  public get marker(): boolean {
    return (this.data.readUInt8(1) & 0b10000000) !== 0;
  }

  public set marker(marker: boolean) {
    let secondByte = this.data.readUInt8(1);

    if (marker) {
      secondByte |= 0b10000000;
    } else {
      secondByte &= 0b01111111;
    }

    this.data.writeUInt8(secondByte, 1);
  }

  public get payloadType(): number {
    return this.data.readUInt8(1) & 0b01111111;
  }

  public set payloadType(payloadType: number) {
    checkRange(payloadType, 0, 127, "payloadType");

    this.data.writeUInt8(
      (this.data.readUInt8(1) & 0b10000000) + payloadType,
      1
    );
  }

  public get sequenceNumber(): number {
    return this.data.readUInt16BE(2);
  }

  public set sequenceNumber(sequenceNumber: number) {
    checkRange(sequenceNumber, 0, 65535, "sequenceNumber");
    this.data.writeUInt16BE(sequenceNumber, 2);
  }

  public get timestamp(): number {
    return this.data.readUInt32BE(4);
  }

  public set timestamp(timestamp: number) {
    checkRange(timestamp, 0, 4294967295, "timestamp");
    this.data.writeUInt32BE(timestamp, 4);
  }

  public get ssrc(): number {
    return this.data.readUInt32BE(8);
  }

  public set ssrc(ssrc: number) {
    checkRange(ssrc, 0, 4294967295, "ssrc");
    this.data.writeUInt32BE(ssrc, 8);
  }

  public get csrc(): number[] {
    const csrcCount = this.csrcCount;
    const csrc = new Array<number>(csrcCount);

    for (let i = 0; i < csrcCount; i++) {
      csrc[i] = this.data.readUInt32BE(12 + 4 * i);
    }

    return csrc;
  }

  public set csrc(csrc: number[]) {
    const newCsrcCount = csrc.length;

    if (csrc.length > 15) {
      throw new RangeError(
        `Invalid csrc length ${csrc.length}: cannot have more than 15 elements`
      );
    }

    for (const value of csrc) {
      checkRange(value, 0, 4294967295, "csrc");
    }

    const firstByte = this.data.readUInt8(0);
    const oldCsrcCount = firstByte & 0b00001111;

    if (newCsrcCount !== oldCsrcCount) {
      const fixedHeader = this.data.slice(0, 12);
      const payload = this.data.slice(12 + 4 * oldCsrcCount);

      fixedHeader.writeUInt8((firstByte & 0b11110000) + newCsrcCount);

      if (newCsrcCount === 0) {
        this.data = Buffer.concat([fixedHeader, payload]);
        return;
      }

      this.data = Buffer.concat([
        fixedHeader,
        Buffer.allocUnsafe(4 * newCsrcCount),
        payload,
      ]);
    }

    for (let i = 0; i < newCsrcCount; i++) {
      this.data.writeUInt32BE(csrc[i], 12 + 4 * i);
    }
  }

  public get payload(): Buffer {
    return this.data.slice(12 + 4 * this.csrcCount);
  }

  public set payload(payload: Buffer) {
    const oldPayload = this.payload;
    const headerBytes = 12 + 4 * this.csrcCount;

    if (payload.length === oldPayload.length) {
      payload.copy(this.data, headerBytes);
    } else {
      this.data = Buffer.concat([this.data.slice(0, headerBytes), payload]);
    }
  }
}

function checkRange(value: number, min: number, max: number, name: string) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(
      `Invalid ${name} ${value}; expected an integer between ${min} and ${max} (inclusive)`
    );
  }
}
