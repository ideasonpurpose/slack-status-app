# IOP Slack Status Bot

This Slack App interprets slash commands and sets statuses for users who send messages.

The basic syntax looks like this:

<code>/iam <strong>:emoji:</strong> My Status Message <strong>until</strong> 3:30</code>

<code>/iam <strong>:emoji:</strong> Another status message <strong>for</strong> 20 minutes</code>

For a status that will never expire, end it with forever:

<code>/iam <strong>:emoji:</strong> Making client edits <strong>forever</strong></code>

## Examples

These all work:

- /iam at IOP all day
- /iam focused for 3 (hours)
- /iam focused for 15 (minutes)
- /iam focused until noon
- /iam eating for 1:20
- /iam on a call for 1:15:33
- /iam :walking: taking a walk for 20 minutes (also 20m, 20 mins, 20 min, etc.)
- /iam making client edits until the end of time (no expiration)
- /iam fixing WordPress stuff forever (no expiration)

Even crazy stuff like this will work:

- /iam eating for :5 (five minutes)
- /iam eating for 15:

## Slack Slash Command documentation

Slash commands: https://api.slack.com/interactivity/slash-commands
`user.profile.set` status API: https://api.slack.com/methods/users.profile.set

## AWS Lambda or Digital Ocean Function (instead of AWS Lambda)

1. Log the request (to see what we're getting, can't find it in docs)

### Digital Ocean Function Notes

## Notes

Days and weeks start with the current day. Eg. On Monday at 11:30 AM, setting a status for four days will count Monday, so the status will expire on Thursday at midnight.

Additional supported time formats:

- 11:42 (times with colons are treated as 12-hour times, maps to nearest future hour)
- 1142 (times without colons are always treated as 24-hour time)

### Timezones

Slack's API appears to operate on either the invoking user's timezone (`x-slack-request-timestamp`) or on the workspace timezone. There's no indication of user timezone in the provided data, so if that's wrong, we would need to query the user for their local timezone before calculating expirations. (I tested from the same timezone as the workspace)

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
