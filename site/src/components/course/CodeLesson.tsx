import { Copy, MousePointer2 } from "lucide-react";
import { useMemo, useState } from "react";
import * as PierreDiffsReact from "@pierre/diffs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type LineNote = {
  title: string;
  body: string;
};

type Props = {
  code: string;
  fileName: string;
  lineNotes: Record<number, LineNote>;
};

const FileViewer = (PierreDiffsReact as unknown as { File?: React.ComponentType<Record<string, unknown>> }).File;

export function CodeLesson({ code, fileName, lineNotes }: Props) {
  const [selectedLine, setSelectedLine] = useState<number>(1);
  const lines = useMemo(() => code.split("\n"), [code]);
  const selectedNote = lineNotes[selectedLine];

  async function copyCode() {
    await navigator.clipboard.writeText(code);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Card className="overflow-hidden bg-stone-950 text-stone-50">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="font-mono text-sm text-stone-300">{fileName}</div>
          <Button variant="outline" size="sm" onClick={copyCode} className="border-white/20 bg-white/10 text-white hover:bg-white/20">
            <Copy className="h-4 w-4" />
            Copy code
          </Button>
        </div>
        <CardContent className="p-0">
          {FileViewer ? (
            <div className="diffs-wrapper max-h-[28rem] overflow-auto">
              <FileViewer
                file={{ name: fileName, contents: code }}
                options={{
                  showLineNumbers: true,
                  theme: "github-dark",
                  lineWrapping: false,
                  onLineClick: ({ lineNumber }: { lineNumber: number }) => setSelectedLine(lineNumber),
                }}
              />
            </div>
          ) : (
            <pre className="overflow-auto p-5 font-mono text-sm leading-7">
              <code>
                {lines.map((line, index) => (
                  <button
                    key={index}
                    className="block w-full text-left"
                    type="button"
                    onClick={() => setSelectedLine(index + 1)}
                  >
                    <span className="mr-4 inline-block w-6 text-right text-stone-500">{index + 1}</span>
                    {line}
                  </button>
                ))}
              </code>
            </pre>
          )}
        </CardContent>
      </Card>

      <Card className="bg-amber-50/90">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary">
            <MousePointer2 className="h-4 w-4" />
            Line {selectedLine}
          </div>
          {selectedNote ? (
            <>
              <h3 className="font-display text-2xl font-bold">{selectedNote.title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{selectedNote.body}</p>
            </>
          ) : (
            <p className="leading-7 text-muted-foreground">
              This blank line only separates ideas. It makes the code easier to scan.
            </p>
          )}
          <div className="mt-5 grid grid-cols-4 gap-2">
            {lines.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedLine(index + 1)}
                className={`rounded-full border px-3 py-2 font-mono text-sm font-bold ${
                  selectedLine === index + 1 ? "bg-primary text-primary-foreground" : "bg-white"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
