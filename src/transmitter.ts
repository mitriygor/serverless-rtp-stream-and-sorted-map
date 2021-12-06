import dgram from "dgram";
import fs from "fs";
import path from "path";

import { RTPPacket } from "../models/rtp-packet";

const INPUT_FILE = path.resolve(__dirname, "../data/input.ulaw");
const RECEIVER_PORT = 3456;
const BYTES_PER_PACKET = 160;
const MILLIS_PER_PACKET = 20;
const MAX_DELAY_MILLIS = 60;

const data = fs.readFileSync(INPUT_FILE);
const numTotalPackets = Math.ceil(data.length / BYTES_PER_PACKET);
const ssrc = Math.floor(Math.random() * Math.pow(2, 32));
const initialTimestamp = Math.floor(Math.random() * 1000);
const initialSequenceNumber = Math.floor(Math.random() * 1000);

const client = dgram.createSocket("udp4");

let packetsRead = 0;
let packetsSent = 0;

console.log(`Sending ${INPUT_FILE} to port ${RECEIVER_PORT} as RTP`);

const interval = setInterval(() => {

  const start = packetsRead * BYTES_PER_PACKET;
  const end = (packetsRead + 1) * BYTES_PER_PACKET;

  packetsRead++;

  const packet = new RTPPacket();
  packet.ssrc = ssrc;
  packet.timestamp = initialTimestamp + end;
  packet.sequenceNumber = initialSequenceNumber + packetsRead;
  packet.payload = data.slice(start, end);

  const timeout = Math.floor(Math.random() * MAX_DELAY_MILLIS);

  setTimeout(() => {
    client.send(packet.data, RECEIVER_PORT, "localhost", (error) => {
      if (error) {
        console.error(error);
        process.exit(1);
      }

      packetsSent++;

      if (packetsSent === numTotalPackets) {
        console.log(`Last packet sent`);
        client.close();
      }
    });
  }, timeout);

  if (end >= data.length) {
    clearInterval(interval);
  }
}, MILLIS_PER_PACKET);
