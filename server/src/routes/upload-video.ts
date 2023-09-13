import { FastifyInstance } from "fastify";
import { prisma } from "../db/prisma";
import { fastifyMultipart } from "@fastify/multipart"
import path from "path";
import fs from "fs"
import { randomUUID } from "crypto";
import { pipeline } from "stream";
import { promisify } from "util";

// Transforma pipelina para lidar com ela com await
const pump = promisify(pipeline);

export async function uploadVideo(app: FastifyInstance) {

    app.register(fastifyMultipart,
        {
            limits: {
                fileSize: 1_048_576 * 25 // 25MB
            }
        });

    app.post("/videos", async (request, reply) => {
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ error: "Missing file input!" })
        }

        const extension = path.extname(data.filename);

        // Já vou receber o vídeo como áudio para transcrever
        if (extension !== '.mp3') {
            return reply.status(400).send({ error: "Invalid input type. Please upload a MP3" })
        }


        // Evita salvar arquivos com mesmo nome
        const fileBaseName = path.basename(data.filename, extension);

        const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;

        const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName);

        // Stream para salvar o arquivo (salvo em partes para não sobrecarregar memória)
        await pump(data.file, fs.createWriteStream(uploadDestination));

        const video = await prisma.video.create({
            data:{
                name: data.filename,
                path: uploadDestination
            }
        })

        return {
            video
        }
    });
}