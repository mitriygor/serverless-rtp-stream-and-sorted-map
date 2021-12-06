// This file is just here to demonstrate how you can add unit tests for your
// code, should you wish to do so.

import { RTPPacket } from "../../models/rtp-packet";

test("sequence number", () => {
  const packet = new RTPPacket();
  packet.sequenceNumber = 24601;
  expect(packet.sequenceNumber).toBe(24601);
});
