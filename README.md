# Discord Avatar Cloudflare Worker

Get a user's Discord avatar by their ID.

### Usage

```https://your.workers.dev/(id)```

### Optional parameters

| Parameter  | Default |
|------------|---------|
| format     | png     |
| resolution | 1024    |

### Deployment

This project uses Upstash Redis to cache the avatars. You can get a free account [here](https://upstash.com/).

- Create a new Upstash Redis instance, and save the URL and password.
- Create a Discord bot and save the token. No intents are required.
- Fork this repository, and deploy it to Cloudflare Workers.
- Go to the Worker settings and add the following secrets:
  - `UPSTASH_REDIS_URL`: The URL of the Upstash Redis instance.
  - `UPSTASH_REDIS_TOKEN`: The password of the Upstash Redis instance.
  - `DISCORD_TOKEN`: The token of the Discord bot.
- Redeploy the Worker, and optionally set up Workers Builds.
- Enjoy!