import parseText from "./lib/parse-text.js";

export function main(args) {
  const AUTH_TOKEN = process.env.SLACK_USER_OAUTH_TOKEN;

  const user = args.user_id;
  const { text } = args;
  const timestamp =
    args["x-slack-request-timestamp"] ??
    args.__ow_headers["x-slack-request-timestamp"];

  console.log({ date: new Date(), tz: new Date().getTimezoneOffset() });

  if (!text) {
    return {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        body: JSON.stringify({ done: true }),
        Status: 500,
      },
    };
  }
  const status = parseText(text, timestamp);

  const payload = {
    user,
    profile: status,
  };

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Bearer ${AUTH_TOKEN}`,
  };

  return fetch("https://slack.com/api/users.profile.set", {
    method: "POST",
    body: JSON.stringify(payload),
    headers,
  })
    .then((response) => response.text())
    .then((body) => console.log(JSON.parse(body)))
    .catch((error) => console.error(error));
}
