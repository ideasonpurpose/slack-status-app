import * as dotenv from "dotenv";
dotenv.config();

import { main } from "./digital-ocean/packages/set-status.js";

console.log(main);

const timestamp = 1665415353; // 2022-10-10 11:22:33
const args = {
  command: "/iam",
  text: ":stopwatch: checking time",
  user_id: "U8Z7P2G0H",
  "x-slack-request-timestamp": timestamp,
};
main(args);
