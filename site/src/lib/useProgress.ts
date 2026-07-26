import { useEffect, useState } from "react";
import { CourseProgress, readProgress } from "./progress";

export function useProgress() {
  const [progress, setProgress] = useState<CourseProgress>(() => readProgress());

  useEffect(() => {
    const sync = () => setProgress(readProgress());
    window.addEventListener("storage", sync);
    window.addEventListener("dub-siren-progress", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("dub-siren-progress", sync);
    };
  }, []);

  return progress;
}
