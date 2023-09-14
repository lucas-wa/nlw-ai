import { Separator } from "./components/ui/separator";
import { Button } from "./components/ui/button";
import { Github, Upload, Wand2 } from "lucide-react";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Slider } from "./components/ui/slider";
import { VideoInputForm } from "./components/video-input-form";
import { PromptSelect } from "./components/prompt-select";
import { useState } from "react";
import {useCompletion} from "ai/react"

export function App() {

  const [temperature, setTemperature] = useState(0.5);
  const [videoId, setVideoId] = useState<string | null>(null);

  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading
  } = useCompletion({
    api: "http://localhost:3333/ai/complete",
    body: {
      videoId,
      temperature    
    },
    headers:{
      "Content-type": "application/json"
    }
  });



  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="px-6 py-3 flex items-center justify-between border-b">
          <h1 className="text-xl font-bold">upload.ai</h1>

          <div className="flex items-center gap-3">
            <span className="text-small text-muted-foreground">
              Desenvolvido com amor no NLW da RocketSeat
            </span>


            <Separator orientation="vertical" className="h-6"></Separator>

            <Button
              variant="outline"
            >
              <Github
                className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>
        </div>

        <main className="flex-1 p-6 flex gap-6">

          <div className="flex flex-col flex-1 gap-4">
            <div className="grid grid-rows-2 gap-4 flex-1">
              <Textarea placeholder="Inclua o prompt para a IA" 
              value={input}
              onChange={handleInputChange}
              className="resize-none p-4 leading-relaxed" />

              <Textarea placeholder="Resultado gerado pela IA" 
              value={completion}className="resize-none p-4 leading-relaxed" />
            </div>

            <p className="text-small text-muted-foreground">
              Lembre-se: Você pode utilizar a variável <code className="text-violet-400">{"{transcription}"}</code> no seu prompt para adicionar o conteúdo da transcrição do vídeo selecionado
            </p>
          </div>

          <aside className="w-80 space-y-6">

            <VideoInputForm onVideoUploaded={setVideoId}></VideoInputForm>

            <Separator></Separator>



            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-2">

                <Label>
                  Prompt
                </Label>

                <PromptSelect onPromptSelected={setInput}></PromptSelect>

                <span className="block text-xs text-muted-foreground italic">Você poderá customizar essa opção em breve</span>
              </div>

              <div className="space-y-2">

                <Label>
                  Modelo
                </Label>

                <Select disabled defaultValue="gpt-3.5">
                  <SelectTrigger>
                    <SelectValue></SelectValue>
                  </SelectTrigger>


                  <SelectContent>
                    <SelectItem value="gpt-3.5">GPT 3.5-turbo 16k</SelectItem>
                  </SelectContent>
                </Select>
                <span className="block text-xs text-muted-foreground italic">Você poderá customizar essa opção em breve</span>
              </div>

              <Separator></Separator>


              <div className="space-y-2">

                <Label>
                  Temperatura
                </Label>

                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={value => setTemperature[value[0]]}></Slider>

                <span className="block text-xs text-muted-foreground italic leading-relaxed">Valores mais altos tendem a deixar o resultado mais criativo e com possíveis erros</span>

                <Separator></Separator>

                <Button disabled={isLoading} className="w-full">
                  Executar
                  <Wand2 className="w-4 h-4 ml-2"></Wand2>
                </Button>
              </div>


            </form>
          </aside>
        </main>
      </div>
    </>
  )
}

