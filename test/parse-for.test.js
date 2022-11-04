import { DateTime } from "luxon";

import parseFor from "../packages/set-status/set-status/lib/parse-for.js";

let base;
beforeEach(() => {
  base = DateTime.fromISO("2022-10-10T11:22:33Z", { zone: "utc" }); // Monday
});

describe("For tests (durations)", () => {
  test("integer < 5", () => {
    const req = { for: 2 }; // Integers < 3 are treated as hours
    const expected = base.plus({ hours: 2 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("integer >= 5", () => {
    const req = { for: 8 }; // Integers > 2  are treated as minutes
    const expected = base.plus({ minutes: 8 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("integer > 60", () => {
    const req = { for: "75" }; // treat as minutes
    const expected = base.plus({ minutes: 75 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("integer > 100", () => {
    const req = { for: "185" }; // treat as minutes
    const expected = base.plus({ minutes: 185 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("integer units: minutes", () => {
    const req = { for: "15 minutes" };
    const expected = base.plus({ minutes: 15 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("integer units: mins (abbreviated)", () => {
    const req = { for: "20 min" };
    const expected = base.plus({ minutes: 20 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("integer units: min (abbreviated)", () => {
    const req = { for: "22 min" };
    const expected = base.plus({ minutes: 22 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("integer units: m (abbreviated)", () => {
    const req = { for: "25 m" };
    const expected = base.plus({ minutes: 25 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("integer units: hours", () => {
    const req = { for: "4 hours" };
    const expected = base.plus({ hours: 4 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("integer units: hr (abbreviated)", () => {
    const req = { for: "4 hr" };
    const expected = base.plus({ hours: 4 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("integer units: h (abbreviated)", () => {
    const req = { for: "4 h" };
    const expected = base.plus({ hours: 4 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("integer units: zero", () => {
    const req = { for: "0 hours" };
    const expected = base;
    const actual = parseFor(req, base); // unchanged
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("mixed integer units", () => {
    const req = { for: "2 hours 15 minutes" };
    const expected = base.plus({ hours: 2, minutes: 15 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("mixed integer units: and", () => {
    const req = { for: "1 hour and 20 minutes" };
    const expected = base.plus({ hours: 1, minutes: 20 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });
  test("mixed integer units: commas", () => {
    const req = { for: "3 hours, 1 minute" };
    const expected = base.plus({ hours: 3, minutes: 1 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("mixed integer units: everything", () => {
    const req = { for: "2 days 5 hours 45 minutes and 12 seconds" };
    const expected = base.plus({ days: 2, hours: 5, minutes: 45, seconds: 12 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("using words: minutes", () => {
    const req = { for: "ten minutes" };
    const expected = base.plus({ minutes: 10 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("using words: hours", () => {
    const req = { for: "two hours" };
    const expected = base.plus({ hours: 2 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("using words: seconds", () => {
    const req = { for: "three-hundred and seven seconds" };
    const expected = base.plus({ seconds: 307 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("using words: days", () => {
    const req = { for: "four days" };
    const expected = base.startOf("day").plus({ days: 4 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
    expect(expected.month).toBe(10);
  });

  test("using words: hyphenated numbers", () => {
    const req = { for: "twenty-five minutes" };
    const expected = base.plus({ minutes: 25 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("using words: mixed units", () => {
    const req = { for: " one hour and ten minutes " };
    const expected = base.plus({ hours: 1, minutes: 10 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("hours:minutes", () => {
    const req = { for: "04:04" };
    const expected = base.plus({ hours: 4, minutes: 4 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("hours:minutes:seconds", () => {
    const req = { for: "04:04:04" };
    const expected = base.plus({ hours: 4, minutes: 4, seconds: 4 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("hours:minutes: single-digit hours", () => {
    const req = { for: "1:15" };
    const expected = base.plus({ hours: 1, minutes: 15 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("leading-colon: minutes", () => {
    const req = { for: ":32" };
    const expected = base.plus({ minutes: 32 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("leading-colon: single-digit minutes", () => {
    const req = { for: ":5" };
    const expected = base.plus({ minutes: 5 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("leading-colon: one-digit minutes", () => {
    const req = { for: ":5:30" };
    const expected = base.plus({ minutes: 5, seconds: 30 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("mixed plural: minutes", () => {
    const req = { for: "3 minutes" };
    const expected = base.plus({ minutes: 3 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("mixed singular: minute", () => {
    const req = { for: "1 minute" };
    const expected = base.plus({ minutes: 1 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("mixed not plural: 2 minute", () => {
    const req = { for: "2 minute" };
    const expected = base.plus({ minutes: 2 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("mixed not singular: 1 minutes", () => {
    const req = { for: "1 minutes" };
    const expected = base.plus({ minutes: 1 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("mixed not plural: 2 minute", () => {
    const req = { for: "2 minute" };
    const expected = base.plus({ minutes: 2 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("Invalid time duration three-digit minutes", () => {
    const req = { for: "1:234:56" };
    const expected = base;
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("trailing-colon: hours", () => {
    // TODO: is this too stupid?
    const req = { for: "11:" };
    const expected = base.plus({ hours: 11 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("trailing-colon: single-digit hours", () => {
    // TODO: is this too stupid?
    const req = { for: "4:" };
    const expected = base.plus({ hours: 4 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("the whole day", () => {
    const req = { for: "the whole day" };
    const expected = base.startOf("day").plus({ days: 1 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("all day", () => {
    const req = { for: "all day" };
    const expected = base.startOf("day").plus({ days: 1 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("all week", () => {
    const req = { for: "all week" };
    const expected = base.startOf("week").plus({ weeks: 1 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("for today", () => {
    const req = { for: "today" };
    const expected = base.startOf("day").plus({ days: 1 });
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("for eternity", () => {
    const req = { for: "eternity" };
    const expected = DateTime.fromSeconds(0);
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("for eternity and then some", () => {
    const req = { for: "eternity" };
    const expected = DateTime.fromSeconds(0);
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("for all time", () => {
    const req = { for: "all time" };
    const expected = DateTime.fromSeconds(0);
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("for ever", () => {
    const req = { for: "ever" };
    const expected = DateTime.fromSeconds(0);
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("forever and ever", () => {
    const req = { for: "ever and ever" };
    const expected = DateTime.fromSeconds(0);
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("forever and ever, amen", () => {
    // sure, why not?
    const req = { for: "ever and ever, amen" };
    const expected = DateTime.fromSeconds(0);
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });

  test("forever followed by anything else", () => {
    // sure, why not?
    const req = { for: "ever and ever, amen" };
    const expected = DateTime.fromSeconds(0);
    const actual = parseFor(req, base);
    expect(actual.toHTTP()).toEqual(expected.toHTTP());
  });
});
