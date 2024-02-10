import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import cookie from "@fastify/cookie";
import { z } from "zod";
import { createPoll } from "./routes/create-polls";
import { getPoll } from "./routes/get-poll";
import { voteOnPoll } from "./routes/vote-on-poll";
import { pollResults } from "./ws/poll-results";
import websocket from "@fastify/websocket";

const app = fastify();
const port = 3333;

app.register(websocket);

app.register(cookie, {
  secret: "polls-app-nlw",
  hook: "onRequest",
  parseOptions: {},
});

app.register(pollResults);
app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);

app.listen({ port: port }).then(() => {
  console.log("Running on:", port);
});
