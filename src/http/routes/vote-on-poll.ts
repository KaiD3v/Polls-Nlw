import fastify, { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";

export async function voteOnPoll(app: FastifyInstance) {
  app.post("/polls/:pollId/votes", async (req, res) => {
    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid(),
    });

    const voteOnPollParams = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = voteOnPollParams.parse(req.params);
    const { pollOptionId } = voteOnPollBody.parse(req.body);

    let sessionId = req.cookies.sessionId;

    if (sessionId) {
      const usePreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId,
          },
        },
      });

      if (
        usePreviousVoteOnPoll &&
        usePreviousVoteOnPoll.pollOptionId !== pollOptionId
      ) {
        // Apagar o voto anterior
        // Criar um novo

        await prisma.vote.delete({
          where: {
            id: usePreviousVoteOnPoll.id,
          },
        });
      } else if (usePreviousVoteOnPoll) {
        return res
          .status(400)
          .send({ message: "You already voted on this polls." });
      }
    }

    if (!sessionId) {
      sessionId = randomUUID();

      res.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        signed: true,
        httpOnly: true,
      });
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId,
      },
    });

    return res.status(201).send();
  });
}
