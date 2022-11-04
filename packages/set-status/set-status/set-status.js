import parseText from "./lib/parse-text.js";

export function main(args) {
  const AUTH_TOKEN = process.env.SLACK_USER_OAUTH_TOKEN;

  const user = args.user_id;
  const { text } = args;
  const timestamp = args["x-slack-request-timestamp"];

  const status = parseText(text, timestamp);

  const payload = {
    user,
    profile: status,
  };

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Bearer ${AUTH_TOKEN}`,
  };

  console.log({ args, status });

  return fetch("https://slack.com/api/users.profile.set", {
    method: "POST",
    body: JSON.stringify(payload),
    headers,
  })
    .then((response) => response.text())
    .then((body) => console.log(JSON.parse(body)))
    .catch((error) => console.error(error));
}
