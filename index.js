import * as dotenv from "dotenv";
dotenv.config();

import { main } from "./packages/set-status/set-status/set-status.js";

const timestamp = (new Date().getTime() / 1000).toFixed(0);
const args = {
  command: "/iam",
  text: ":robot_face: local test for 20 minutes",
  // user_id: "U8Z7P2G0H", // joe @ joe's slack playground
  user_id: "U06A8QEJ2", // joe @ IOP
  "x-slack-request-timestamp": timestamp,
};

main(args);
