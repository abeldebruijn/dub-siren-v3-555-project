import { Copy, MessageSquareOff } from "lucide-react";
import { useMemo, useState } from "react";
import { File, type LineAnnotation } from "@pierre/diffs/react";
import { Button } from "@/components/ui/button";

type LineNote = {
  title: string;
  body: string;
};

type Props = {
  code: string;
  fileName: string;
  lineNotes: Record<number, LineNote>;
};

export function CodeLesson({ code, fileName, lineNotes }: Props) {
  const [showComments, setShowComments] = useState(true);
  const lineAnnotations = useMemo(
    () =>
      Object.entries(lineNotes).map(([lineNumber, note]) => ({
        lineNumber: Number(lineNumber),
        metadata: note,
      })) satisfies LineAnnotation<LineNote>[],
    [lineNotes],
  );

  async function copyCode() {
    await navigator.clipboard.writeText(code);
  }

  return (
    <div className="code-annotation-frame">
      <div className="overflow-hidden border border-slate-700 bg-stone-950 text-stone-50">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="font-mono text-sm text-stone-300">{fileName}</div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments((current) => !current)}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <MessageSquareOff className="h-4 w-4" />
              {showComments ? "Hide comments" : "Show comments"}
            </Button>
            <Button variant="outline" size="sm" onClick={copyCode} className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Copy className="h-4 w-4" />
              Copy code
            </Button>
          </div>
        </div>
        <div className="p-0">
          <div className="diffs-wrapper max-h-[28rem] overflow-auto">
            <File
              file={{ name: fileName, contents: code }}
              lineAnnotations={showComments ? lineAnnotations : []}
              renderAnnotation={showComments ? renderLineAnnotation : undefined}
              options={{
                theme: "github-dark",
                overflow: "scroll",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function renderLineAnnotation(annotation: LineAnnotation<LineNote>) {
  return annotation.metadata ? (
    <p>{annotation.metadata.body}</p>
  ) : null;
}
