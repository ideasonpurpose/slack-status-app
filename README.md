# IOP Slack Status Bot

#### Version 1.0.0

This project adds an `/iam` slash command to Slack for setting user status with more flexible expiration times.

### Example commands

The basic syntax looks like this:

<code>/iam <strong>:emoji:</strong> My Status Message <strong>until</strong> 3:30</code>

<code>/iam <strong>:emoji:</strong> Another status message <strong>for</strong> 20 minutes</code>

For a status that will never expire, end it with forever:

<code>/iam <strong>:emoji:</strong> Making client edits <strong>forever</strong></code>

Statuses set without an expiration will expire by default after 1 hour.

Expiration times are very flexible, these will all work:

- /iam at IOP all day
- /iam focused for 3 (hours)
- /iam focused for 15 (minutes)
- /iam focused until noon
- /iam eating for 1:20
- /iam on a call for 1:15:33
- /iam :walking: taking a walk for 20 minutes (also 20m, 20 mins, 20 min, etc.)
- /iam making client edits until the end of time (no expiration)
- /iam fixing WordPress stuff forever (no expiration)

Even crazy stuff like this:

- /iam eating for :5 (five minutes)
- /iam eating for 15:

## Slack Slash Command documentation

Slash commands: https://api.slack.com/interactivity/slash-commands
`user.profile.set` status API: https://api.slack.com/methods/users.profile.set

### Slack API Scopes

`users.profile:write` for writing the new status.

If we decide to try implementing adaptive local times like sunrise and sunset, we would also need the `users:read` scope to get timezones. Timezones are the most specific location data included in [Slack API user objects](https://api.slack.com/types/user), so timing local solar events would not be especially accurate.

## Working with Digital Ocean Functions

The backend of this project is running on a [Digital Ocean serverless function](https://www.digitalocean.com/products/functions). This can be deployed using the [`doctl` CLI tool](https://docs.digitalocean.com/reference/doctl/).

After installing and [connecting `doctl` to our account](https://docs.digitalocean.com/reference/doctl/how-to/install/). Run `doctl serverless watch .` to automatically deploy the function after every change.

Make sure to define `SLACK_USER_OAUTH_TOKEN` in a **.env** file. The token's value is the User OAuth Token found in the App's [OAuth & Permissions](https://api.slack.com/apps/A0451T229U5/oauth?) page.

## TODO

- Always [return a 200](https://api.slack.com/interactivity/slash-commands#responding_to_commands) to try and prevent timeouts? Is this a code issue or DO Functions having a slow start?
- Handle connection errors (check response for `ok = false`) and report to users. Currently it's only logged.
- Could we send 3-5 really quick profile updates with random or sequential emojis, then arrive at the final one?
- Even though `/active` and `/away` both work to toggle Active/Away state, we could add these, with expirations. eg. `/iam away for 15 minutes`

## Notes

_this one screwed me over for a while..._

When using `doctl serverless watch` to rapidly iterate on functions, _be very careful_ to define the project's Environment variables in the .env file. If those are not set, or if there is no environment defined in **project.yml** any environment variables defined on the DO site will be silently eliminated after deploying every update.

After realizing this, I added a [templated environment variable](https://docs.digitalocean.com/products/functions/reference/project-configuration/#with-templating) to **project.yml** which makes deploys no longer work unless the variable is set in **.env** (or the environment?)

Days and weeks start with the current day. Eg. On Monday at 11:30 AM, setting a status for four days will count Monday, so the status will expire on Thursday at midnight.

Additional supported time formats:

- 11:42 (times with colons are treated as 12-hour times, maps to nearest future hour)
- 1142 (times without colons are always treated as 24-hour time)

### Timezones

Wrong. Use users.info to retrieve the timezone. ~Slack's API appears to operate on either the invoking user's timezone (`x-slack-request-timestamp`) or on the workspace timezone. There's no indication of user timezone in the provided data, so if that's wrong, we would need to query the user for their local timezone before calculating expirations. (I tested from the same timezone as the workspace)~

### TODO

Commands that would also be nice to have

`/iam away`
`/iam here`
`/iam back`

Would those be presence apart from status? Or should we try to come up with some sort of magical logic for setting active/away while also setting/clearing status?

Note that `/active` and `/away` already work, but not everyone knows those exist?

Query user for time-zone data to enable more organic stuff like `until sunset` `until dawn` and `for the night`. These would be somewhat approximate since the only location data we have is the timezone.

### Stupid note about Jest ESM Mocks

The _vast_ majority of time spent on this project was burned trying mock the parse-time.js file. This is partly due to my own incomplete understanding of various import strategies, as well as Jest's sparse documentation. What ended up working was a combination of [`jest.unstable_mockmodule`](https://jestjs.io/docs/ecmascript-modules#module-mocking-in-esm) and `async` imports, since the mock has to exist before the module containing it is imported.

I've got a better understanding now, but it's sad that more time was spent trying to mock two functions than was spent on the entire rest of the project.
