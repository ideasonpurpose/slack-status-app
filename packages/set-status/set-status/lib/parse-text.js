import { DateTime } from "luxon";

import parseFor from "./parse-for.js";
import parseUntil from "./parse-until.js";

/**
 * @param {string} text The raw command string passed from the Slack API
 * @param {number|string} ts A seconds-based timestamp, eg. x-slack-request-timestamp
 * @returns {{ status_emoji: string, status_text: string, status_expiration: DateTime }}
 */
export default function (raw, ts) {
  let text = raw,
    matches,
    status_emoji = "",
    status_text,
    keyword,
    timeString,
    status_expiration;

  /**
   * Convert ts to a Luxon DateTime
   */
  const tsDateTime = DateTime.fromSeconds(parseInt(ts, 10));

  // let expiration = DateTime.fromSeconds(ts);
  // if (!expiration.isValid) {
  //   throw new Error("Invalid Timestamp");
  // }

  const emojiPattern = /^(:[_A-Z0-9-]+:)(.*)/i;
  matches = text.match(emojiPattern);
  if (matches) {
    status_emoji = matches[1];
    text = matches[2];
  }

  const kwPattern = /\b(all|for|forever|until|til|'til)\b/i;

  matches = text.split(kwPattern);
  if (matches.length > 1) {
    timeString = matches.pop().trim();
    keyword = matches.pop().toLowerCase();
  }
  status_text = matches.join("").trim();

  /**
   * Pre-correct bare "today"
   */
  if (!keyword && status_text.match(/\b(?:today|tonight)$/i)) {
    keyword = "until";
    timeString = "end-of-day";
  }

  /**
   * Translate "all"
   */
  if (keyword === "all") {
    keyword = "until";
    timeString = "end-of-" + timeString;
  }

  /**
   * translate "forever"
   */
  if (keyword === "forever") {
    keyword = "until";
    timeString = "forever";
  }

  /**
   * Ensure `keyword` will always be 'for' or 'until'
   */
  keyword = ["until", "til", "'til"].includes(keyword) ? "until" : keyword;
  if (!["for", "until"].includes(keyword)) {
    keyword = "for";
    timeString = "1hr";
  }

  /**
   * Set status_expiration using keyword-specific parsers
   */
  if (keyword === "for") {
    status_expiration = parseFor({ [keyword]: timeString }, tsDateTime);
  } else {
    status_expiration = parseUntil({ [keyword]: timeString }, tsDateTime);
  }

  // console.log(status_expiration);
  status_expiration = status_expiration.toSeconds()

  return { status_emoji, status_text, status_expiration };
}
