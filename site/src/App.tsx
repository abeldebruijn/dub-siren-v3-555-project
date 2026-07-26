import { useEffect, useMemo, useState } from "react";
import { HomePage } from "./components/course/HomePage";
import { LessonShell } from "./components/course/LessonShell";
import { lessons } from "./lessons";

function getHashPath() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/";
}

export function App() {
  const [path, setPath] = useState(getHashPath);

  useEffect(() => {
    const onHashChange = () => setPath(getHashPath());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const lesson = useMemo(() => {
    const match = path.match(/^\/lessons\/([^/]+)$/);
    if (!match) return undefined;
    return lessons.find((item) => item.slug === match[1]);
  }, [path]);

  if (lesson?.Component) {
    return <LessonShell lesson={lesson} />;
  }

  return <HomePage />;
}
