import { Hono } from "hono";
import { cors } from "hono/cors";
import { Redis } from "@upstash/redis/cloudflare";
import { type Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.use(cors());

app.get("/", (c) => {
    return c.redirect("https://github.com/mikndotdev/discord-avatar", 302);
});

app.get("/:id", async (c) => {
    const id = c.req.param("id");
    const resolution = c.req.query("resolution") || "1024";
    const format = c.req.query("format") || "png";

    const redis = new Redis({
        url: c.env.UPSTASH_REDIS_URL,
        token: c.env.UPSTASH_REDIS_TOKEN,
    });

    const get = async (id: string) => {
        const cacheRes = await redis.get(`user-${id}`);
        if (cacheRes) {
            return cacheRes;
        } else {
            const res = await fetch(`https://discord.com/api/v10/users/${id}`, {
                headers: {
                    Authorization: `Bot ${c.env.DISCORD_TOKEN}`,
                },
            });
            if (!res.ok) {
                return null;
            }
            const data = (await res.json()) as { avatar: string };
            const avatar = data.avatar;
            await redis.set(`user-${id}`, avatar, { ex: 60 });
            return avatar;
        }
    };
    const avatar = await get(id);
    if (!avatar) {
        return c.json({ error: "User not found" }, { status: 404 });
    }
    return c.redirect(
        `https://cdn.discordapp.com/avatars/${id}/${avatar}.${format}?size=${resolution}`,
        302,
    );
});

app.get("/server/:id", async (c) => {
    const id = c.req.param("id");
    const resolution = c.req.query("resolution") || "1024";
    const format = c.req.query("format") || "png";

    const redis = new Redis({
        url: c.env.UPSTASH_REDIS_URL,
        token: c.env.UPSTASH_REDIS_TOKEN,
    });

    const get = async (id: string) => {
        const cacheRes = await redis.get(`server-${id}`);
        if (cacheRes) {
            return cacheRes;
        } else {
            const res = await fetch(
                `https://discord.com/api/v10/guilds/${id}/preview`,
                {
                    headers: {
                        Authorization: `Bot ${c.env.DISCORD_TOKEN}`,
                    },
                },
            );
            if (!res.ok) {
                return null;
            }
            const data = (await res.json()) as { icon: string };
            const avatar = data.icon;
            await redis.set(`server-${id}`, avatar, { ex: 60 });
            return avatar;
        }
    };
    const avatar = await get(id);
    if (!avatar) {
        return c.json({ error: "Server not found" }, { status: 404 });
    }
    return c.redirect(
        `https://cdn.discordapp.com/icons/${id}/${avatar}.${format}?size=${resolution}`,
        302,
    );
});

export default app;
