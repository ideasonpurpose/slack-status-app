import { DateTime } from "luxon";

/**
 * Lookup table for weekdays
 */
const dayNames = {};
[
  ["sunday", "sun", "su"],
  ["monday", "mon", "mo"],
  ["tuesday", "tues", "tue", "tu"],
  ["wednesday", "wed", "we"],
  ["thursday", "thurs", "thu", "th"],
  ["friday", "fri", "fr"],
  ["saturday", "sat", "sa"],
].forEach((days, n) => days.forEach((d) => (dayNames[d] = n)));

/**
 * @param {string} input
 * @param {DateTime} from
 * @returns {DateTime}
 */
const parseUntil = (input, from) => {
  let expiration = from.plus({ hours: 0 });

  let matches;
  let hours, minutes, seconds, meridiem, weekday;
  let time = input.until.toString().toLowerCase(); //.replace(/the/g, "");

  /**
   * Bare 1-2 digit until-integers (and zeroes)
   * (zeroes follow Slack default behavior)
   *
   * - 0: noon
   * - 00: noon
   * - 000: error
   * - 0000: midnight (handled as 24-hour time)
   * - 1-12: next logical 12-hour hour (am/pm)
   * - 12-59: next logical minute
   */
  if (/^(\d|[0-5]\d)$/.test(time)) {
    const numTime = parseInt(time, 10);
    if (numTime === 0) {
      expiration = expiration.startOf("hour").set({ hours: 12 });
      if (expiration < from) {
        expiration = expiration.plus({ days: 1 });
      }
    } else if (numTime < 13) {
      expiration = expiration.startOf("hour").set({ hours: numTime });
      if (expiration < from) {
        expiration = expiration.plus({ hours: 12 });
      }
    } else {
      expiration = expiration.startOf("hour").set({ minutes: numTime });
      if (expiration < from) {
        expiration = expiration.plus({ hours: 1 });
      }
    }
    time = "";
  }

  /**
   * Match 12-hour times with AM/PM meridiem labels
   */
  const time12ampmRegExp =
    /(1[0-2]|0?[1-9])(?::?([0-5][0-9]))?(?::?([0-5][0-9]))?\s*(am|pm)/i;
  matches = time.match(time12ampmRegExp);
  if (matches) {
    [, hours, minutes = 0, seconds = 0, meridiem] = matches;
    hours = (meridiem === "pm" ? parseInt(hours, 10) + 12 : hours).toString();
    expiration = expiration.set({ hours, minutes, seconds });

    if (expiration < from) {
      expiration = expiration.plus({ days: 1 });
    }

    time = time.replace(time12ampmRegExp, "");
  }

  /**
   * Match bare 12/24 hour times with colons and optional seconds (eg. 12:45:33)
   */
  const time12HourBareRegexp =
    /^(?<hours>[1-9]|[01]\d|2[0-3]):(?<minutes>[0-5]\d)(?::(?<seconds>[0-5]\d))?\b/i;

  matches = time.match(time12HourBareRegexp);
  if (matches) {
    [, hours, minutes, seconds = 0] = matches;

    hours = parseInt(hours, 10);
    expiration = expiration.set({ hours, minutes, seconds });

    if (expiration < from) {
      const adj = hours > 0 && hours < 13 ? { hours: 12 } : { days: 1 };
      expiration = expiration.plus(adj);
    }

    time = time.replace(time12HourBareRegexp, "");
  }

  /**
   * Match four-digit 24-hour times with optional seconds (eg. 123456)
   */

  const time24HourRegexp =
    /^(?<hours>[01]\d|2[0-3])(?<minutes>[0-5]\d)(?<seconds>[0-5]\d)?\b/i;

  matches = time.match(time24HourRegexp);
  if (matches) {
    [, hours, minutes, seconds = 0] = matches;
    expiration = expiration.set({ hours, minutes, seconds });
    if (expiration < from) {
      expiration = expiration.plus({ days: 1 });
    }
  }

  /**
   * Match Next <weekday>
   * Works with English abbreviations like Sun, FR, thurs
   */
  const weekdayRegExp = new RegExp(
    `(?<weekday>${Object.keys(dayNames).join("|")})\\b`,
    "i"
  );
  const nextWeekdayRegExp = new RegExp(
    `^(next)?\\s*${weekdayRegExp.source}`,
    "i"
  );

  matches = time.match(nextWeekdayRegExp);
  if (matches) {
    weekday = dayNames[matches.groups.weekday.toLowerCase()];
    const plusWeeks = matches[1] ? 1 : 0;
    expiration = expiration
      .startOf("day")
      .set({ weekday })
      .plus({ weeks: plusWeeks });

    if (expiration < from) {
      expiration = expiration.plus({ week: 1 });
    }
  }

  /**
   * Next week
   */
  matches = time.match(/(next)?\s*week/i);
  if (matches) {
    expiration = expiration.startOf("week").plus({ weeks: 1 }); // luxon starts weeks on Mondays
  }

  /**
   * "tomorrow" or "day after tomorrow"
   * Includes misspellings: tommorow tommorrow and tomorow
   */
  matches = time.match(/(?:day)?\s*(after)?\s*tomm?orr?ow/i);
  if (matches) {
    const plusDays = matches[1] ? 2 : 1;
    expiration = expiration.startOf("day").plus({ days: plusDays });
  }

  /**
   * "tonight"
   */
  matches = time.match(/tonight/i);
  if (matches) {
    expiration = expiration.startOf("day").plus({ hours: 20 });
  }

  /**
   * "midnight"
   */
  matches = time.match(/midnight/i);
  if (matches) {
    expiration = expiration.startOf("day").plus({ days: 1 });
  }

  /**
   * "End of day", "end-of-day" or "EOD"
   */
  matches = time.match(/(end[ -]of[ -]day|eod)/i);
  if (matches) {
    expiration = expiration.startOf("day").plus({ days: 1 });
  }

  /**
   * "End of week", "end-of-week" or "EOW"
   */
  matches = time.match(/(end[ -]of[ -]week|eow)/i);
  if (matches) {
    const plusWeeks = expiration.weekday == 1 ? 0 : 1;
    expiration = expiration.startOf("week").plus({ weeks: plusWeeks });
  }

  matches = time.match(/(end[ -]of[ -]time)/i);
  if (matches) {
    expiration = DateTime.fromSeconds(0);
  }

  return expiration;
};

// export default { parseUntil };
export default parseUntil;
