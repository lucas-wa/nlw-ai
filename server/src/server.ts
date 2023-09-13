import {fastify} from "fastify"
import {fastifyCors} from "@fastify/cors"
import { getAllPrompts } from "./routes/get-allprompts";
import { uploadVideo } from "./routes/upload-video";
import { createTranscription } from "./routes/create-transcription";
import { generateAiCompletion } from "./routes/generate-ai-completion";

const app = fastify();

app.register(fastifyCors, {
    origin: "*"
});

app.register(getAllPrompts);
app.register(uploadVideo);
app.register(createTranscription);
app.register(generateAiCompletion);

app.listen({
    port: 3333
})
.then(() => {
    console.log("Server is running!")
});