import { FileVideo, Upload } from "lucide-react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { api } from "@/lib/axios";
import { CounterClockwiseClockIcon } from "@radix-ui/react-icons";


type Status = 'waiting' | 'converting' | 'uploading' | 'generating' | 'success';

const statusMessages = {
  converting: "Convertendo...",
  generating: "Transcrevendo...",
  uploading: "Carregando...",
  success: "Sucesso"
}

interface VideoInputFormProps {
  onVideoUploaded: (id: string) => void
}

export function VideoInputForm(props: VideoInputFormProps) {

  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [status, setStatus] = useState<Status>('waiting');

  const promptInputRef = useRef<HTMLTemplateElement>(null);


  async function convertVideoToAudio(video: File) {
    console.log("Convert started");

    const ffmpeg = await getFFmpeg();

    await ffmpeg.writeFile('input.mp4', await fetchFile(video));

    // ffmpeg.on('log', log => console.log(log))

    ffmpeg.on('progress', progress => {
      console.log("Convertprogress: " + Math.round(progress.progress * 100))
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3'
    ]);

    const data = await ffmpeg.readFile('output.mp3');

    const audioFileBlob = new Blob([data], { type: "audio/mpeg" });

    const audioFile = new File([audioFileBlob], 'audio.mp3', {
      type: 'audio/mpeg'
    })

    console.log('Convert Finished')

    return audioFile
  }


  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {

    const { files } = event.currentTarget;

    if (!files) return

    const selectedFile = files[0];

    setVideoFile(selectedFile);

  }



  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = promptInputRef.current?.value;

    if (!videoFile) return

    setStatus('converting')

    // Converter vídeo em áudio (será feita com biblioteca pára WebAssembly, que permite executar tecnologias que não foram feitas para a web na web, como python, PHP, entre outros)
    const audioFile = await convertVideoToAudio(videoFile);

    const data = new FormData();

    data.append('file', audioFile);

    setStatus('uploading')

    const response = await api.post('/videos', data);

    const videoId = response.data.video.id;

    console.log("Audio")

    setStatus('generating')

    await api.post(`/videos/${videoId}/transcription`, {
      prompt
    });

    setStatus('success')

    props.onVideoUploaded(videoId)

  }

  // Só vai resetar previewURL se videoFile mudar
  const previewURL = useMemo(() => {

    if (!videoFile) return null

    // Cria URL de pré visualização
    return URL.createObjectURL(videoFile);

  }, [videoFile]);

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label
        className="relative flex border rounded-md aspect-video cursor-pointer border-dashed text-small flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
        htmlFor="video">

        {
          videoFile ?
            <video src={previewURL} controls={false} className="pointer-events-none absolute inset-0" />
            :
            <>
              <FileVideo className="w-8 h-8" />
              Selecione um vídeo
            </>
        }

      </label>

      <input type="file" id="video" accept="video/mp4" className="sr-only" onChange={handleFileSelected} />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">
          Prompt de transcrição
        </Label>
        <Textarea
          disabled={status !== 'waiting'}
          ref={promptInputRef} id="transcription_prompt" className="h-20 leading-relaxed"
          placeholder="Inclua palavras chave mencionadas no vídeo separadas por vírgula">

        </Textarea>
      </div>

      <Button 
      data-success={status=='success'}
      disabled={status !== 'waiting'} type="submit" className="w-full data-[success=true]:bg-emerald-400">
        {
          status == 'waiting' ?
            <>
              Carregar vídeo
              <Upload className="w-4 h-4 ml-2"></Upload></>
            :
            statusMessages[status]
        }
      </Button>
    </form>
  )
}