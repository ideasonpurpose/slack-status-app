import { DateTime, Duration } from "luxon";
import { wordsToNumbers } from "words-to-numbers";

/**
 * @param {{for: string}} input;
 * @param {DateTime} from
 */
const parseFor = (input, from) => {
  let days, hours, minutes, seconds;
  let dur = Duration.fromObject({ hours: 0 });
  let time = input.for.toString().toLowerCase();
  time = wordsToNumbers(time).toString();

  let matches;

  if (/^[0-9]+$/.test(time)) {
    const numTime = parseInt(time, 10);
    if (numTime > 0 && numTime < 5) {
      dur = dur.set({ hours: numTime });
    } else {
      dur = dur.set({ minutes: numTime });
    }
    time = "";
  }

  /**
   * Match mixed integer labeled units
   * 15 minutes
   * 2 hours
   * 1 day
   */
  const daysRegExp = /(\d+)\s*(?:days?)/i;
  matches = time.match(daysRegExp);
  if (matches) {
    [, days] = matches;
    time = time.replace(daysRegExp, "");
  }

  const hoursRegExp = /(\d+)\s*(?:hours?|hrs?|h)/i;
  matches = time.match(hoursRegExp);
  if (matches) {
    [, hours] = matches;
    time = time.replace(hoursRegExp, "");
  }

  const minRegExp = /(\d+)\s*(?:minutes?|mins?|m)/i;
  matches = time.match(minRegExp);
  if (matches) {
    [, minutes] = matches;
    time = time.replace(minRegExp, "");
  }

  const secRegExp = /(\d+)\s*(?:seconds?|secs?|s)/i;
  matches = time.match(secRegExp);
  if (matches) {
    [, seconds] = matches;
    time = time.replace(secRegExp, "");
  }

  if (days && !hours && !minutes) {
    // seed duration with diff to the start of day
    dur = from.startOf("day").diff(from);
  }
  dur = dur.set({ days, hours, minutes, seconds });

  /**
   * "all day" "the whole day", "today"
   */
  matches = time.match(/((?:all|(?:the)? whole) day)|today/i);
  if (matches) {
    dur = from.startOf("day").diff(from).set({ days: 1 });
  }

  /**
   * "all week
   */
  matches = time.match(/((?:all|(?:the)? whole) week)/i);
  if (matches) {
    dur = from.startOf("week").diff(from).set({ weeks: 1 });
  }

  /**
   * "all time, forever (ever), eternity
   */
  matches = time.match(/^(all time|eternity|ever|forever)/i);
  if (matches) {
    dur = dur.set({ seconds: from.toSeconds() * -1 });
  }

  /**
   * convert leading/trailing colons to 00:00 times
   */
  if (time.match(/\d:|:\d/)) {
    time = time
      .split(":")
      .map((d) => d.padStart(2, "0"))
      .join(":");
    dur = Duration.fromISOTime(time);
  }

  /**
   * Reset invalid durations
   */
  if (!dur.isValid) {
    dur = Duration.fromObject({ hours: 0 });
  }

  return from.plus(dur);
};

export default parseFor;
