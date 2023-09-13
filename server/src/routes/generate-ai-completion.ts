import { FastifyInstance } from "fastify";
import { prisma } from "../db/prisma";
import { z } from "zod"
import { createReadStream } from "fs";
import { openai } from "../lib/openai";

export async function generateAiCompletion(app: FastifyInstance) {
    app.post("/ai/complete", async (req, reply) => {

        const bodyScrema = z.object({
            videoId: z.string().uuid(),
            template: z.string(),
            temperature: z.number().max(1).default(0.5)
        });


        const { videoId, template, temperature } = bodyScrema.parse(req.body);


        const video = await prisma.video.findFirstOrThrow({
            where:{
                id: videoId
            }
        });

        if(!video.transcription){
            return reply.status(400).send({error: "Vídeo transcription was not generated yet."});
        }

        const promptMessage = template.replace("{transcription}", video.transcription);

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            temperature,
            messages: [
                {
                    role: 'user', content: promptMessage
                }
            ]

        });

        return response

    });
}