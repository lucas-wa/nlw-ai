import { FastifyInstance } from "fastify";
import { prisma } from "../db/prisma";
import { z } from "zod"
import { createReadStream } from "fs";
import { openai } from "../lib/openai";

export async function createTranscription(app: FastifyInstance) {
    app.post("/videos/:videoId/transcription", async (req) => {
        // Verificação de parâmetros que vem na URL
        // Verifica se há um parâmetro videoId, string com o formato uuid
        const paramsScchema = z.object({
            videoId: z.string().uuid(),
        });


        const { videoId } = paramsScchema.parse(req.params);

        // Verifica body para pegar os prompts

        const bodyScrema = z.object({
            prompt: z.string()
        });


        const { prompt } = bodyScrema.parse(req.body);

        const video = await prisma.video.findUniqueOrThrow({
            where: {
                id: videoId,
            }
        });


        const videoPath = video.path;

        const audioReadStream = createReadStream(videoPath);


        const response = await openai.audio.transcriptions.create({
            file: audioReadStream,
            model: 'whisper-1',
            language: 'pt',
            response_format: 'json',
            temperature: 0,
            prompt
        });

        const transcription = response.text;

        await prisma.video.update({
            where: {
                id: videoId
            },
            data: {
                transcription
            }
        });

        return { transcription }

    });
}