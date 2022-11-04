import { DateTime } from "luxon";
import parseUntil from "../packages/set-status/set-status/lib/parse-until.js";

// const parseUntil = ParseUntil.parseUntil;

/**
 * Utility helper for converting JS Dates to Unix seconds-based timestamps
 * TODO: Problem that this returns a string? (API happily accepts strings)
 * @param {Date} date
 * @returns {String} a timestamp as a string
 */
// const dateToUnixTimestamp = (date) => (date.getTime() / 1000).toFixed(0);
// const unixTimeStampToDate = (timeString) =>
//   new Date(parseInt(timeString, 10) * 1000);

let base;
beforeEach(() => {
  base = DateTime.fromISO("2022-10-10T11:22:33Z", { zone: "utc" });
});

describe("Expiration Tests (until)", () => {
  test("basic time: labeled AM", () => {
    const req = { until: "11:25 AM" };
    const expected = base.set({
      hours: 11,
      minutes: 25,
      seconds: 0,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("basic time: labeled PM", () => {
    const req = { until: "11:25 PM" };
    const expected = base.set({
      hours: 23,
      minutes: 25,
      seconds: 0,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("basic time: labeled PM with seconds", () => {
    const req = { until: "10:20:30 PM" };
    const expected = base.set({
      hours: 22,
      minutes: 20,
      seconds: 30,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("basic time: integer labeled PM", () => {
    const req = { until: "5 PM" };
    const expected = base.startOf("day").set({ hours: 17 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("basic time: integer labeled PM, lowercase no spaces", () => {
    const req = { until: "11pm" };
    const expected = base.startOf("day").set({ hours: 23 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("basic time: labeled PM with seconds", () => {
    const req = { until: "10:20:30 PM" };
    const expected = base.set({
      hours: 22,
      minutes: 20,
      seconds: 30,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("bare integer < now", () => {
    const req = { until: 5 }; // Next logical 5:00 AM/PM
    const expected = base.set({
      hours: 17,
      minutes: 0,
      seconds: 0,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("bare integer > now", () => {
    const req = { until: 12 }; // Next logical 5:00 AM/PM
    const expected = base.set({
      hours: 12,
      minutes: 0,
      seconds: 0,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("zero", () => {
    const req = { until: 0 };
    const expected = base.startOf("day").set({ hours: 12 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("zero (afternoon)", () => {
    const req = { until: "0" };
    const expected = base.startOf("day").set({ hours: 12 }).plus({ days: 1 });
    const actual = parseUntil(req, base.set({ hours: 18 }));
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("zero zero", () => {
    const req = { until: "00" };
    const expected = base.set({
      hours: 12,
      minutes: 0,
      seconds: 0,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("zero zero zero", () => {
    const req = { until: "000" };
    const expected = base;
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("zero zero zero zero", () => {
    const req = { until: "0000" };
    const expected = base.startOf("day").plus({ days: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("bare integer > now (minutes)", () => {
    const req = { until: 33 }; // Next logical :33
    const expected = base.set({
      minutes: 33,
      seconds: 0,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("bare integer < now (minutes)", () => {
    const req = { until: 21 }; // Next logical :21
    const expected = base
      .startOf("hour")
      .set({
        minutes: 21,
        seconds: 0,
      })
      .plus({ hours: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("basic time: implied AM", () => {
    const req = { until: "11:25" };
    const expected = base.set({
      hours: 11,
      minutes: 25,
      seconds: 0,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("basic time: implied PM", () => {
    const req = { until: "4:25" };
    const expected = base.set({
      hours: 16,
      minutes: 25,
      seconds: 0,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("basic time: implied PM with seconds", () => {
    const req = { until: "6:12:24" };
    const expected = base.set({
      hours: 18,
      minutes: 12,
      seconds: 24,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("24-hour time with colons", () => {
    const req = { until: "17:18" };
    const expected = base.set({
      hours: 17,
      minutes: 18,
      seconds: 0,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("24-hour time with colons (tomorrow)", () => {
    const req = { until: "17:18" };
    const expected = base
      .set({
        hours: 17,
        minutes: 18,
        seconds: 0,
      })
      .plus({ days: 1 });
    const actual = parseUntil(req, base.set({ hours: 20 }));
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("no-colon times < 12, 3-digit", () => {
    const req = { until: "400" }; // no colors, so 4 AM. Too much guessing?
    const expected = base;
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("no-colon times < 12, 4-digit", () => {
    const req = { until: "1015" }; // no colon, handle as 24-hour time
    const expected = base
      .set({
        hours: 10,
        minutes: 15,
        seconds: 0,
      })
      .plus({ days: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("no-colon times > 12, 4-digit", () => {
    const req = { until: "1500" }; // expect 3:00 PM - 24-hour time
    const expected = base.set({
      hours: 15,
      minutes: 0,
      seconds: 0,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("no-colon times, 4-digit, leading zero", () => {
    const req = { until: "0900" }; // expect 9:00 AM - 24-hour time next day
    const expected = base
      .set({
        hours: 9,
        minutes: 0,
        seconds: 0,
      })
      .plus({ days: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("no-colon times 6-digit with seconds", () => {
    const req = { until: "123456" }; // expect 9:00 AM - 24-hour time next day
    const expected = base.set({
      hours: 12,
      minutes: 34,
      seconds: 56,
    });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("day of week", () => {
    const req = { until: "Monday" };
    const expected = base.startOf("week").plus({ weeks: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("next day of week", () => {
    const req = { until: "next Tuesday" };
    const expected = base
      .set({
        weekday: 2,
        hours: 0,
        minutes: 0,
        seconds: 0,
      })
      .plus({ weeks: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("tomorrow", () => {
    const req = { until: "tomorrow" };
    const expected = base.startOf("day").plus({ days: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("day after tomorrow", () => {
    const req = { until: "day after tomorrow" };
    const expected = base.startOf("day").plus({ days: 2 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("next week", () => {
    const req = { until: "next week" };
    const expected = base.startOf("week").plus({ weeks: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("midnight", () => {
    const req = { until: "midnight" };
    const expected = base.startOf("day").plus({ days: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("tonight", () => {
    const req = { until: "tonight" };
    const expected = base.startOf("day").plus({ hours: 20 }); // TODO: Tonight is 8 pm? Earlier?
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("EOD", () => {
    const req = { until: "EOD" };
    const expected = base.startOf("day").plus({ days: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("end-of-day", () => {
    const req = { until: "end-of-day" };
    const expected = base.startOf("day").plus({ days: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("end of day", () => {
    const req = { until: "end of day" };
    const expected = base.startOf("day").plus({ days: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("EOW", () => {
    const newBase = base.plus({ days: 2 });
    const req = { until: "EOW" };
    const expected = newBase.startOf("week").plus({ weeks: 1 });
    const actual = parseUntil(req, newBase);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("end-of-week", () => {
    const req = { until: "end-of-week" };
    const expected = base.startOf("week").plus({ weeks: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("the end of the week", () => {
    const req = { until: "the end of the week" };
    const expected = base.startOf("week").plus({ weeks: 1 });
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("end of time", () => {
    const req = { until: "end of time" };
    const expected = DateTime.fromSeconds(0);
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("the end of time", () => {
    const req = { until: "the end of time" };
    const expected = DateTime.fromSeconds(0);
    const actual = parseUntil(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });
});
