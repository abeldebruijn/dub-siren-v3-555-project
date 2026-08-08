import { useEffect, useState } from "react";
import { BreadboardEditorPage } from "./components/breadboard/BreadboardEditorPage";
import { HomePage } from "./components/course/HomePage";

const SITE_BASE = "/pico-dub-siren";
const PLAYGROUND_PATH = `${SITE_BASE}/breadboard/playground`;

function getHashPath() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/";
}

export function App() {
  const [path, setPath] = useState(getHashPath);
  const pathname = window.location.pathname.replace(/\/$/, "");

  useEffect(() => {
    const onHashChange = () => setPath(getHashPath());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (pathname === PLAYGROUND_PATH || path === "/breadboard") {
    return <BreadboardEditorPage />;
  }

  const lesson = path.match(/^\/lessons\/(lesson-\d{3})$/)?.[1];
  if (lesson) {
    const number = Number(lesson.slice(-3));
    return <CourseRedirect target={`${SITE_BASE}/lessons/lesson${number}.html`} />;
  }

  return <HomePage />;
}

function CourseRedirect({ target }: { target: string }) {
  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f2eb] px-6 text-[#24211d]">
      <p>
        Opening the <a className="font-bold text-[#1c6548] underline" href={target}>Rspress course</a>…
      </p>
    </main>
  );
}
