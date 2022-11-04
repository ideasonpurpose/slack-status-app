import { jest } from "@jest/globals";
import { DateTime } from "luxon";

const mockTimestamp = 1678999999;
const mockExpiration = DateTime.fromSeconds(mockTimestamp);

const parseForMock = jest.fn(() => mockExpiration);
const parseUntilMock = jest.fn(() => mockExpiration);

let parseText;

beforeAll(async () => {
  /**
   * Set up mocks for parseFor and parseUntil
   */
  jest.unstable_mockModule(
    "../packages/set-status/set-status/lib/parse-for",
    () => ({
      default: parseForMock,
    })
  );

  jest.unstable_mockModule(
    "../packages/set-status/set-status/lib/parse-until",
    () => ({
      default: parseUntilMock,
    })
  );

  /**
   * OMG this is ugly.
   * Modules need to be imported AFTER their dependents mocks are
   * set up. Instead of putting this into each test, this maps
   * the default function to a temporary name, then assigns that to
   * a variable outside the setup function. Name mapping with defaults
   * is messier than I'd like.
   *
   * Ugly, but nicer than repeating this in every test.
   */

  let { default: libParseText } = await import(
    "../packages/set-status/set-status/lib/parse-text"
  );
  parseText = libParseText;
});

// beforeEach(async () => {
//   /**
//    * OMG this is ugly.
//    * Modules need to be imported AFTER their dependents mocks are
//    * set up. Instead of putting this into each test, this maps
//    * the default function to a temporary name, then assigns that to
//    * a variable outside the setup function. Name mapping with defaults
//    * is messier than I'd like.
//    */
//   // let { default: libParseText } = await import("../lib/parse-text");
//   // parseText = libParseText;
// });

afterEach(() => {
  jest.restoreAllMocks();
});

test("checking mock", async () => {
  const { default: parseUntil } = await import(
    "../packages/set-status/set-status/lib/parse-until"
  );
  const actual = parseUntil({ for: 10 }, "datetime");
  expect(parseUntilMock).toHaveBeenCalled();
  expect(actual).toBe(mockExpiration);
});

test("checking mock deeper", async () => {
  // const { default: parseText } = await import("../lib/parse-text");
  const actual = parseText("Testing for 3 hours");
  console.log({ actual });
  expect(parseForMock).toHaveBeenCalled();
  expect(actual).toHaveProperty("status_expiration");
});

/**
 * NOTE: These tests use their name as their primary argument. This is a little bit of a
 * Jest hack, but still nicer than duplicating everything.
 * @link https://stackoverflow.com/a/62694295/503463
 */
test(":horse: I'm on a horse for two hours", async () => {
  const actual = parseText(expect.getState().currentTestName);

  expect(actual).toHaveProperty("status_emoji", ":horse:");
  expect(actual).toHaveProperty("status_text", "I'm on a horse");
  expect(actual).toHaveProperty("status_expiration", mockTimestamp);

  expect(parseForMock).toHaveBeenCalled();
  expect(parseForMock.mock.calls[0][0]).toEqual({ for: "two hours" });
});

test(":coffee: Coffee! until 2:25", async () => {
  const actual = parseText(expect.getState().currentTestName);
  expect(actual).toHaveProperty("status_emoji", ":coffee:");
  expect(actual).toHaveProperty("status_text", "Coffee!");
  expect(actual).toHaveProperty("status_expiration", mockTimestamp);

  expect(parseUntilMock).toHaveBeenCalled();
  expect(parseUntilMock.mock.calls[0][0]).toEqual({ until: "2:25" });
});

test("Writing tests for 15m", () => {
  const actual = parseText(expect.getState().currentTestName);

  expect(actual).toHaveProperty("status_emoji", "");
  expect(actual).toHaveProperty("status_text", "Writing tests");

  expect(parseForMock).toHaveBeenCalled();
  expect(parseForMock.mock.calls[0][0]).toEqual({ for: "15m" });
});

test("Sitting here jauntily all day", () => {
  // 'jauntily' contains 'until'
  const actual = parseText(expect.getState().currentTestName);

  expect(actual).toHaveProperty("status_text", "Sitting here jauntily");

  expect(parseUntilMock).toHaveBeenCalled();
  expect(parseUntilMock.mock.calls[0][0]).toEqual({ until: "end-of-day" });
});

// // // TODO: Move this into the general parser
// // test("Synonyms for 'until'", () => {
// //   let actual;
// //   actual = "thing 'til 12:34";
// //   expect(parseText(actual)).toHaveProperty("status_expiration");

// //   actual = "thing til 12:56";
// //   expect(parseText(actual)).toHaveProperty("status_expiration");
// // });

// // test("no keyword", () => {
// //   const req = "Writing tests 2 hours";
// //   expect(parseText(expect.getState().currentTestName)).toHaveProperty("status_text", "Writing tests 2 hours");
// // });

// // test("no time", () => {
// //   const req = "Maximizing coverage until 4pm";
// //   expect(parseText(expect.getState().currentTestName)).toHaveProperty("status_text", "Maximizing coverage");
// // });

test(":sleeping: Asleep until 7", () => {
  const actual = parseText(expect.getState().currentTestName);
  expect(actual).toHaveProperty("status_emoji", ":sleeping:");
  expect(actual).toHaveProperty("status_text", "Asleep");

  expect(parseUntilMock).toHaveBeenCalled();
  expect(parseUntilMock.mock.calls[0][0]).toEqual({ until: "7" });
});

test(":sleeping: asleep until 7 am", () => {
  const actual = parseText(expect.getState().currentTestName);
  expect(actual).toHaveProperty("status_emoji", ":sleeping:");
  expect(actual).toHaveProperty("status_text", "asleep");

  expect(parseUntilMock).toHaveBeenCalled();
  expect(parseUntilMock.mock.calls[0][0]).toEqual({ until: "7 am" });
});


test("at the office all day", () => {
  const actual = parseText(expect.getState().currentTestName);
  expect(actual).toHaveProperty("status_text", "at the office");

  expect(parseUntilMock).toHaveBeenCalled();
  expect(parseUntilMock.mock.calls[0][0]).toEqual({ until: "end-of-day" });
});

test("I'll be here all week", () => {
  const actual = parseText(expect.getState().currentTestName);
  expect(actual).toHaveProperty("status_text", "I'll be here");

  expect(parseUntilMock).toHaveBeenCalled();
  expect(parseUntilMock.mock.calls[0][0]).toEqual({ until: "end-of-week" });
});

test("I'll be here all week all day", () => {
  const actual = parseText(expect.getState().currentTestName);
  expect(actual).toHaveProperty("status_text", "I'll be here all week");

  expect(parseUntilMock).toHaveBeenCalled();
  expect(parseUntilMock.mock.calls[0][0]).toEqual({ until: "end-of-day" });
});

test("at my country villa today", () => {
  const actual = parseText(expect.getState().currentTestName);
  expect(actual).toHaveProperty("status_text", "at my country villa today");

  expect(parseUntilMock).toHaveBeenCalled();
  expect(parseUntilMock.mock.calls[0][0]).toEqual({ until: "end-of-day" });
});

test("going out tonight", () => {
  const actual = parseText(expect.getState().currentTestName);
  expect(actual).toHaveProperty("status_text", "going out tonight");

  expect(parseUntilMock).toHaveBeenCalled();
  expect(parseUntilMock.mock.calls[0][0]).toEqual({ until: "end-of-day" });
});

test("going outtonight", () => {
  // no space before tonight should fail
  const actual = parseText(expect.getState().currentTestName);
  expect(actual).toHaveProperty("status_text", "going outtonight");

  expect(parseForMock).toHaveBeenCalled();
  expect(parseForMock.mock.calls[0][0]).toEqual({ for: "1hr" });
});

test(":hourglass: On this call forever", () => {
  const actual = parseText(expect.getState().currentTestName);

  expect(actual).toHaveProperty("status_emoji", ":hourglass:");
  expect(actual).toHaveProperty("status_text", "On this call");

  expect(parseUntilMock).toHaveBeenCalled();
  expect(parseUntilMock.mock.calls[0][0]).toEqual({ until: "forever" });
});

test("status followed by forever and ever arrrgh", () => {
  const actual = parseText(expect.getState().currentTestName);

  expect(actual).toHaveProperty("status_text", "status followed by");

  expect(parseUntilMock).toHaveBeenCalled();
  expect(parseUntilMock.mock.calls[0][0]).toEqual({ until: "forever" });
});

test(":dog: no keywords", () => {
  const actual = parseText(expect.getState().currentTestName);
  expect(actual).toHaveProperty("status_text", "no keywords");
  expect(parseForMock).toHaveBeenCalled();
  expect(parseForMock.mock.calls[0][0]).toEqual({ for: "1hr" });
});

// Only use last keyword
test(":robot: all day until midnight or forever for 3 hours til noon", () => {
  const actual = parseText(expect.getState().currentTestName);
  expect(actual).toHaveProperty(
    "status_text",
    "all day until midnight or forever for 3 hours"
  );

  expect(parseUntilMock).toHaveBeenCalled();
  expect(parseUntilMock.mock.calls[0][0]).toEqual({ until: "noon" });
});

test("timestamp is a string", () => {
  const actual = parseText(expect.getState().currentTestName, "12345");
  expect(actual).toHaveProperty("status_text", "timestamp is a string");

  expect(parseForMock).toHaveBeenCalled();
  expect(parseForMock.mock.calls[0][0]).toEqual({ for: "1hr" });
});
