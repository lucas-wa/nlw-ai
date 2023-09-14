import {FFmpeg} from "@ffmpeg/ffmpeg";

// / carrega o arquivo somente quando necessário/usado
import coreURL from "../ffmpeg/ffmpeg-core.js?url"
import wasmURL from "../ffmpeg/ffmpeg-core.wasm?url"
import workerURL from "../ffmpeg/ffmpeg-worker.js?url"

// Só carrega caso usada
let ffmpeg: FFmpeg | null;

export async function getFFmpeg(){
    if(ffmpeg) return ffmpeg;

    ffmpeg = new FFmpeg();

    // Força carregamento
    if(!ffmpeg.loaded){
        await ffmpeg.load({
            coreURL,
            wasmURL,
            workerURL
        });
    }

    return ffmpeg;
}