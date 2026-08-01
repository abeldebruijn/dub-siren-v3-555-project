import { useEffect, useMemo, useState } from "react";
import { HomePage } from "./components/course/HomePage";
import { LessonShell } from "./components/course/LessonShell";
import { BreadboardPrototypePage } from "./components/breadboard/BreadboardPrototypePage";
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

  const routePath = path.split("?")[0];

  const lesson = useMemo(() => {
    const match = routePath.match(/^\/lessons\/([^/]+)$/);
    if (!match) return undefined;
    return lessons.find((item) => item.slug === match[1]);
  }, [routePath]);

  if (routePath === "/breadboard") {
    return <BreadboardPrototypePage />;
  }

  if (lesson?.Component) {
    return <LessonShell lesson={lesson} />;
  }

  return <HomePage />;
}
