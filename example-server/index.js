const fastify = require("fastify")({ logger: true });
const crypto = require("crypto");
const url = require("url");
const querystring = require("querystring");

const allowedStreamAccessTokens = ["xxx-yyy"];
const allowedViewAccessTokens = ["xxx-yyy-view"];

fastify.route({
  method: "POST",
  url: "/streaming-server",
  schema: {
    body: {
      type: "object",
      properties: {},
    },
  },
  handler: (request, reply) => {
    console.log("Headers=", JSON.stringify(request.headers));
    console.log("Body=", JSON.stringify(request.body));

    const expectedSignature = crypto
      .createHmac("sha1", "83e6efc7-d7c2-4a4c-be64-bb99e2ee096b")
      .update(JSON.stringify(request.body))
      .digest("base64url");

    const signature = request.headers["x-ome-signature"];

    console.log(
      `expectedSignature=${expectedSignature} siganture=${signature}`
    );

    if (signature !== expectedSignature) {
      reply.code(401);
      return {};
    }

    const urlParsed = url.parse(request.body.request.url);
    const qsParsed = querystring.parse(urlParsed.query);
    const accessToken = qsParsed.access_token;

    const allowedTokens = request.body.request.direction === "incoming" ? allowedStreamAccessTokens : allowedViewAccessTokens;

    if (allowedTokens.includes(accessToken)) {
      return { allowed: true };
    }

    reply.code(401);
    return {};
  },
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();


// ws://localhost:3333/app/test?access_token=xxx-yyy-view
http://demo.ovenplayer.com/