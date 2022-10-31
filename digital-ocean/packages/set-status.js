import { DateTime } from "luxon";

export function main(args) {
  const user = args.user_id ?? "U8Z7P2G0H"; // TODO: test ID in playground workspace
  const timestamp = args["x-slack-request-timestamp"] ?? new Date().getTime();
  const emojis = [
    ":burrito:",
    ":wolf:",
    ":desert_island:",
    ":strawberry:",
    ":technologist:",
  ];
  const status = {
    status_text: args.text ?? "default text",
    status_emoji: [...emojis].sort(() => Math.random() - 0.5)[0],
    status_expiration: "1665415353",
  };

  const payload = {
    user,
    profile: status,
  };

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Bearer ${process.env.SLACK_USER_OAUTH_TOKEN}`,
  };

  const date = new Date();
  // const timestamp = new Date().getTime();
  console.log({ args, date, timestamp, status });

  return fetch("https://slack.com/api/users.profile.set", {
    method: "POST",
    body: JSON.stringify(payload),
    headers,
  })
    .then((response) => console.log(response))
    .catch((error) => console.error(error));

  // return;
}
