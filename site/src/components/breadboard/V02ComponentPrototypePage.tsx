// PROTOTYPE — V0.2 component scale and magnification in the existing playground shell.
import { ArrowLeft, ArrowRight, Box, Code2, Eye, Info, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type VariantKey = "A" | "B" | "C";
type Part = "led" | "capacitor" | "resistor" | "button" | "potentiometer" | "switch";

const variants: Array<{ key: VariantKey; name: string; note: string }> = [
  { key: "A", name: "Trimmer + slider", note: "Compact enclosed controls that read as single physical components." },
  { key: "B", name: "Cartridge + rotary", note: "A warm cartridge potentiometer paired with a tiny rotary selector." },
  { key: "C", name: "Panel + rocker", note: "Dark panel controls with clear mechanical state." },
];

const source = `breadboard Stage rows 15 columns 5

led D1 from LP1 to LT-R5C1 {
  color red
  on true
}

capacitor C1 from LT-R3C2 to LT-R6C2 {
  type electrolytic
  capacitance 100
  max-voltage 16
  displayed capacitance max-voltage
}

resistor R1 from LT-R9C1 to RT-R9C1 { value 10k }
button S1 { on false } at R7
potentiometer P1 { value 0.25 } at R11 outside
switch SW1 { options 3 value 2 } at R9 outside`;

function getVariant(): VariantKey {
  const choice = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("variant")?.toUpperCase();
  return choice === "B" || choice === "C" ? choice : "A";
}

export function V02ComponentPrototypePage() {
  const [variant, setVariant] = useState<VariantKey>(getVariant);
  const active = variants.find((item) => item.key === variant)!;

  const select = (next: VariantKey) => {
    window.location.hash = `/prototype/v02-components?variant=${next}`;
    setVariant(next);
  };

  useEffect(() => {
    const sync = () => setVariant(getVariant());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, [contenteditable='true']") || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      const index = variants.findIndex((item) => item.key === variant);
      select(variants[(index + (event.key === "ArrowRight" ? 1 : -1) + variants.length) % variants.length].key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [variant]);

  return (
    <main className="breadboard-lab flex h-dvh min-h-[34rem] flex-col overflow-hidden bg-[#080b0f] text-slate-100">
      <header className="relative z-30 flex min-h-16 flex-wrap items-center gap-3 border-b border-white/10 bg-[#090c10]/95 px-3 py-3 backdrop-blur md:px-5">
        <a href="#/" className="group flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-black text-white shadow-[0_0_28px_rgba(242,62,30,.24)]">BB</span>
          <span className="min-w-0"><span className="block truncate font-display text-lg font-bold leading-tight md:text-xl">Breadboard canvas</span><span className="block truncate text-xs text-slate-400">V0.2 component prototype</span></span>
        </a>
        <div className="ml-auto flex items-center gap-2 text-xs font-semibold text-slate-300"><Sparkles className="h-4 w-4 text-orange-300" /> Click a component to magnify it</div>
      </header>

      <section className="relative flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-[min(31rem,42vw)] shrink-0 border-r border-white/10 bg-[#0b0f14]/98 lg:block">
          <div className="flex h-14 items-center justify-between border-b border-white/10 px-5"><div><h2 className="font-display text-lg font-bold">main.bb</h2><p className="text-xs text-slate-500">Prototype source</p></div><Code2 className="h-4 w-4 text-slate-500" /></div>
          <pre className="h-full overflow-auto p-5 font-mono text-[13px] leading-6 text-slate-300"><code>{source}</code></pre>
        </aside>

        <div className="breadboard-stage relative min-w-0 flex-1 overflow-hidden bg-[#10171f]">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4 md:p-5">
            <span className="rounded-full border border-emerald-400/35 bg-[#0b0f14]/95 px-3 py-2 font-mono text-[11px] font-bold text-emerald-200 shadow-lg">● valid · prototype</span>
            <span className="hidden rounded-full border border-white/10 bg-[#0b0f14]/95 px-3 py-2 text-xs text-slate-300 shadow-lg md:block">{active.note}</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center px-4 pb-14 pt-20 md:px-10">
            <PreviewBoard variant={variant} />
          </div>
        </div>
      </section>
      <PrototypeSwitcher current={variant} onSelect={select} />
    </main>
  );
}

function PreviewBoard({ variant }: { variant: VariantKey }) {
  return (
    <div className="relative aspect-[1.62/1] w-full max-w-[1050px]">
      <svg viewBox="0 0 1000 620" className="h-full w-full" role="img" aria-label="Breadboard with tiny V0.2 component glyphs">
        <defs><filter id="board-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="7" stdDeviation="8" floodColor="#000" floodOpacity=".28" /></filter></defs>
        <rect x="209" y="60" width="582" height="500" rx="20" fill="#f5f2eb" stroke="#b9ad8d" strokeWidth="5" filter="url(#board-shadow)" />
        <g className="fill-[#48443d] text-[14px] font-black"><text x="265" y="92">LP +</text><text x="297" y="92">LG −</text><text x="407" y="92">LT</text><text x="573" y="92">RT</text><text x="679" y="92">RP +</text><text x="711" y="92">RG −</text></g>
        <g className="fill-[#5d584f] text-[11px] font-bold"><text x="361" y="113">5</text><text x="417" y="113">3</text><text x="473" y="113">1</text><text x="527" y="113">1</text><text x="583" y="113">3</text><text x="639" y="113">5</text></g>
        <rect x="495" y="102" width="10" height="430" rx="5" fill="#dfd5b9" />
        {Array.from({ length: 15 }, (_, row) => <g key={row}>{[279, 307, 361, 389, 417, 445, 473, 527, 555, 583, 611, 639, 693, 721].map((x) => <circle key={x} cx={x} cy={130 + row * 28} r="6" fill="#d1ccc3" />)}{[4, 9, 14].includes(row) ? <><text x="323" y={134 + row * 28} className="fill-[#6f695f] text-[10px] font-bold">{row + 1}</text><text x="666" y={134 + row * 28} className="fill-[#6f695f] text-[10px] font-bold">{row + 1}</text></> : null}</g>)}
        <line x1="279" y1="130" x2="279" y2="522" stroke="#ed6861" strokeWidth="5" /><line x1="307" y1="130" x2="307" y2="522" stroke="#383838" strokeWidth="5" /><line x1="693" y1="130" x2="693" y2="522" stroke="#ed6861" strokeWidth="5" /><line x1="721" y1="130" x2="721" y2="522" stroke="#383838" strokeWidth="5" />

        <path d="M279 214 H361 V242 H417" fill="none" stroke="#de5147" strokeWidth="5" strokeLinecap="round" /><path d="M473 270 V326 H495" fill="none" stroke="#1979b8" strokeWidth="5" strokeLinecap="round" /><path d="M505 326 H515" fill="none" stroke="#e6a91c" strokeWidth="5" strokeLinecap="round" /><path d="M577 326 V354 H639" fill="none" stroke="#e6a91c" strokeWidth="5" strokeLinecap="round" /><path d="M721 270 H639 V242 H527" fill="none" stroke="#5e9a54" strokeWidth="5" strokeLinecap="round" />

        <g><path d="M417 242 L426 251" stroke="#de5147" strokeWidth="5" strokeLinecap="round" /><path d="M436 261 L445 270" stroke="#1979b8" strokeWidth="5" strokeLinecap="round" /><circle cx="431" cy="256" r="7" fill="#e6483f" stroke="#8d2d29" strokeWidth="1.5" /><path d="M428 252 l6 4 -6 4z" fill="white" transform="rotate(45 431 256)" /><text x="409" y="226" className="fill-[#4f4b45] text-[7px] font-bold">D1 +</text><text x="441" y="286" className="fill-[#4f4b45] text-[7px] font-bold">−</text><circle cx="417" cy="242" r="4" fill="#f5f2eb" stroke="#de5147" strokeWidth="2.5" /><circle cx="445" cy="270" r="4" fill="#f5f2eb" stroke="#1979b8" strokeWidth="2.5" /></g>
        <g><path d="M447 158 H463 M481 158 H497" stroke="#746f67" strokeWidth="4" strokeLinecap="round" /><circle cx="447" cy="158" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><circle cx="497" cy="158" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><rect x="463" y="149" width="18" height="18" rx="4" fill="#2f90b5" stroke="#1a546b" strokeWidth="1.5" /><path d="M468 152 V164 M473 152 V164 M478 152 V164" stroke="#b8e1ec" strokeWidth="1" /><text x="451" y="137" className="fill-[#4f4b45] text-[7px] font-bold">C1 100µF</text></g>
        <g><path d="M515 326 H527 M565 326 H577" stroke="#e6a91c" strokeWidth="4" strokeLinecap="round" /><circle cx="515" cy="326" r="4" fill="#f5f2eb" stroke="#e6a91c" strokeWidth="2.5" /><circle cx="577" cy="326" r="4" fill="#f5f2eb" stroke="#e6a91c" strokeWidth="2.5" /><rect x="527" y="320" width="38" height="12" rx="6" fill="#d8b47e" stroke="#8d704a" strokeWidth="1" />{["#7b3f26", "#1c1d21", "#e89f23", "#d4af37"].map((color, index) => <rect key={color} x={534 + index * 6} y="320" width="3" height="12" fill={color} />)}<text x="527" y="309" className="fill-[#4f4b45] text-[7px] font-bold">R1 10k</text></g>
        <g><path d="M473 242 H486 M473 270 H486 M514 242 H527 M514 270 H527" stroke="#746f67" strokeWidth="4" strokeLinecap="round" /><circle cx="473" cy="242" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><circle cx="473" cy="270" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><circle cx="527" cy="242" r="3.5" fill="#f5f2eb" stroke="#5e9a54" strokeWidth="2" /><circle cx="527" cy="270" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><rect x="486" y="232" width="28" height="38" rx="5" fill="#454f5a" stroke="#242a31" strokeWidth="1.5" /><circle cx="500" cy="245" r="7" fill="#f3eee4" stroke="#c9c1b6" strokeWidth="1.5" /><text x="486" y="219" className="fill-[#4f4b45] text-[7px] font-bold">S1 off</text></g>

        <g aria-label="Outside component islands">
          <rect x="810" y="300" width="80" height="108" rx="10" fill="#f5f2eb" stroke="#b9ad8d" strokeWidth="3" filter="url(#board-shadow)" />
          {[326, 354, 382].map((y) => <circle key={`switch-${y}`} cx="829" cy={y} r="6" fill="#d1ccc3" />)}
          <rect x="905" y="356" width="80" height="108" rx="10" fill="#f5f2eb" stroke="#b9ad8d" strokeWidth="3" filter="url(#board-shadow)" />
          {[382, 410, 438].map((y) => <circle key={`pot-${y}`} cx="924" cy={y} r="6" fill="#d1ccc3" />)}
        </g>
        <PotentiometerGlyph variant={variant} /><SwitchGlyph variant={variant} />
      </svg>

      <ComponentPopover part="led" variant={variant} className="left-[43.1%] top-[41.3%]" /><ComponentPopover part="capacitor" variant={variant} className="left-[47.2%] top-[25.5%]" /><ComponentPopover part="resistor" variant={variant} className="left-[54.6%] top-[52.6%]" /><ComponentPopover part="button" variant={variant} className="left-[50%] top-[40.5%]" /><ComponentPopover part="potentiometer" variant={variant} className="left-[95.7%] top-[66.1%]" /><ComponentPopover part="switch" variant={variant} className="left-[85.7%] top-[57.1%]" />
    </div>
  );
}

function PotentiometerGlyph({ variant }: { variant: VariantKey }) {
  if (variant === "A") return <g transform="translate(274 -56)"><path d="M650 438 H668 M650 466 H668 M650 494 H668" stroke="#746f67" strokeWidth="4" strokeLinecap="round" /><circle cx="650" cy="438" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><circle cx="650" cy="466" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><circle cx="650" cy="494" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><rect x="668" y="432" width="30" height="68" rx="5" fill="#347ca0" stroke="#1d526b" strokeWidth="1.5" /><circle cx="683" cy="466" r="10" fill="#d8e4e8" stroke="#2d5769" /><path d="M677 472 L689 460" stroke="#2d5769" strokeWidth="2" /><text x="659" y="422" className="fill-[#4f4b45] text-[7px] font-bold">P1 25%</text></g>;
  if (variant === "B") return <g transform="translate(274 -56)"><path d="M650 438 H668 M650 466 H668 M650 494 H668" stroke="#746f67" strokeWidth="4" strokeLinecap="round" /><circle cx="650" cy="438" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><circle cx="650" cy="466" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><circle cx="650" cy="494" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><rect x="668" y="432" width="42" height="68" rx="5" fill="#c7a878" stroke="#7d6542" strokeWidth="1.5" /><rect x="676" y="445" width="26" height="10" rx="5" fill="#8d704a" /><path d="M689 484 L696 457" stroke="#334c61" strokeWidth="2" /><path d="M693 463 l3 -6 -5 4" fill="#334c61" /><text x="659" y="422" className="fill-[#4f4b45] text-[7px] font-bold">P1 25%</text></g>;
  return <g transform="translate(274 -56)"><path d="M650 438 H668 M650 466 H668 M650 494 H668" stroke="#746f67" strokeWidth="4" strokeLinecap="round" /><circle cx="650" cy="438" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><circle cx="650" cy="466" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><circle cx="650" cy="494" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><rect x="668" y="432" width="34" height="68" rx="7" fill="#4a5e70" stroke="#1d2d3b" strokeWidth="1.5" /><circle cx="685" cy="466" r="12" fill="#334c61" stroke="#f2eee8" strokeWidth="1" /><circle cx="685" cy="466" r="3" fill="#f2eee8" /><path d="M685 466 L692 459" stroke="#f2eee8" strokeWidth="1.5" /><text x="659" y="422" className="fill-[#4f4b45] text-[7px] font-bold">P1 25%</text></g>;
}

function SwitchGlyph({ variant }: { variant: VariantKey }) {
  if (variant === "A") return <g transform="translate(71 -56)"><path d="M758 382 H772 M758 410 H772 M758 438 H772" stroke="#746f67" strokeWidth="4" strokeLinecap="round" /><circle cx="758" cy="382" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><circle cx="758" cy="410" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><circle cx="758" cy="438" r="3.5" fill="#f5f2eb" stroke="#746f67" strokeWidth="2" /><rect x="772" y="374" width="28" height="72" rx="5" fill="#3f4852" stroke="#242a31" strokeWidth="1.5" /><rect x="780" y="382" width="12" height="56" rx="6" fill="#242a31" /><circle cx="786" cy="410" r="5" fill="#f3eee4" /><text x="767" y="364" className="fill-[#4f4b45] text-[7px] font-bold">SW1 2</text></g>;
  if (variant === "B") return <g transform="translate(71 -56)"><path d="M758 382 H772 M758 410 H772 M758 438 H772" stroke="#746f67" strokeWidth="4" strokeLinecap="round" /><circle cx="790" cy="410" r="25" fill="#445463" stroke="#242a31" strokeWidth="1.5" /><circle cx="790" cy="392" r="3" fill="#f3eee4" /><circle cx="806" cy="418" r="3" fill="#f3eee4" /><circle cx="774" cy="418" r="3" fill="#f3eee4" /><path d="M790 410 L806 418" stroke="#f4b84f" strokeWidth="3" strokeLinecap="round" /><text x="767" y="364" className="fill-[#4f4b45] text-[7px] font-bold">SW1 2</text></g>;
  return <g transform="translate(71 -56)"><path d="M758 382 H772 M758 410 H772 M758 438 H772" stroke="#746f67" strokeWidth="4" strokeLinecap="round" /><rect x="772" y="374" width="32" height="72" rx="5" fill="#d9d4cb" stroke="#8b857b" strokeWidth="1.5" /><rect x="777" y="380" width="22" height="16" rx="3" fill="#b9b3a9" /><rect x="777" y="402" width="22" height="16" rx="3" fill="#334c61" /><rect x="777" y="424" width="22" height="16" rx="3" fill="#b9b3a9" /><text x="767" y="364" className="fill-[#4f4b45] text-[7px] font-bold">SW1 2</text></g>;
}

function ComponentPopover({ part, variant, className }: { part: Part; variant: VariantKey; className: string }) {
  const details: Record<Part, { name: string; note: string }> = {
    led: { name: "D1 · LED", note: "Its + and − legs land in separate electrical rows." }, capacitor: { name: "C1 · Electrolytic capacitor", note: "The production glyph prints selected values only." }, resistor: { name: "R1 · 10 kΩ resistor", note: "Tiny colour bands carry the value in the canonical diagram." }, button: { name: "S1 · Button", note: "The neutral body shows on/off through mechanical state." }, potentiometer: { name: "P1 · Potentiometer", note: "One cohesive housing contains the value indicator and three terminals." }, switch: { name: "SW1 · Three-way switch", note: "One enclosed body shows the selected mechanical position." },
  };
  const detail = details[part];
  return <Popover><PopoverTrigger asChild><button type="button" className={`group absolute z-10 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-transparent bg-white/0 text-transparent transition hover:border-orange-400 hover:bg-orange-400/20 focus:border-orange-300 focus:bg-orange-400/25 focus:outline-none ${className}`} aria-label={`Magnify ${detail.name}`}><Eye className="h-3.5 w-3.5 text-orange-200 opacity-0 transition group-hover:opacity-100" /></button></PopoverTrigger><PopoverContent className="w-80 border-slate-600 bg-[#101820] p-4"><div className="mb-3 flex items-center gap-2 text-orange-200"><Box className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[.16em]">Magnified component</span></div><MagnifiedGlyph part={part} variant={variant} /><h3 className="mt-3 font-display text-xl font-bold">{detail.name}</h3><p className="mt-1 text-sm leading-5 text-slate-300">{detail.note}</p><p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400"><Info className="h-3.5 w-3.5" /> Prototype only — click elsewhere to close.</p></PopoverContent></Popover>;
}

function MagnifiedGlyph({ part, variant }: { part: Part; variant: VariantKey }) {
  const potentiometer = variant === "A"
    ? <><line x1="30" y1="40" x2="58" y2="40" stroke="#a8a29b" strokeWidth="4" /><line x1="30" y1="75" x2="58" y2="75" stroke="#a8a29b" strokeWidth="4" /><line x1="30" y1="110" x2="58" y2="110" stroke="#a8a29b" strokeWidth="4" /><rect x="58" y="22" width="84" height="106" rx="12" fill="#347ca0" stroke="#1d526b" strokeWidth="4" /><circle cx="100" cy="75" r="25" fill="#d8e4e8" stroke="#2d5769" strokeWidth="3" /><path d="M84 91 L116 59" stroke="#2d5769" strokeWidth="6" strokeLinecap="round" /></>
    : variant === "B"
      ? <><line x1="30" y1="40" x2="58" y2="40" stroke="#a8a29b" strokeWidth="4" /><line x1="30" y1="75" x2="58" y2="75" stroke="#a8a29b" strokeWidth="4" /><line x1="30" y1="110" x2="58" y2="110" stroke="#a8a29b" strokeWidth="4" /><rect x="58" y="22" width="100" height="106" rx="12" fill="#c7a878" stroke="#7d6542" strokeWidth="4" /><rect x="75" y="42" width="66" height="20" rx="10" fill="#8d704a" /><path d="M108 108 L126 67" stroke="#334c61" strokeWidth="6" strokeLinecap="round" /><path d="M117 78 l9 -11 -2 14" fill="#334c61" /></>
      : <><line x1="30" y1="40" x2="58" y2="40" stroke="#a8a29b" strokeWidth="4" /><line x1="30" y1="75" x2="58" y2="75" stroke="#a8a29b" strokeWidth="4" /><line x1="30" y1="110" x2="58" y2="110" stroke="#a8a29b" strokeWidth="4" /><rect x="58" y="20" width="90" height="110" rx="14" fill="#4a5e70" stroke="#1d2d3b" strokeWidth="4" /><circle cx="103" cy="75" r="31" fill="#334c61" stroke="#f2eee8" strokeWidth="3" /><circle cx="103" cy="75" r="7" fill="#f2eee8" /><path d="M103 75 L122 56" stroke="#f2eee8" strokeWidth="5" strokeLinecap="round" /></>;
  const switchGlyph = variant === "A"
    ? <><line x1="38" y1="38" x2="64" y2="38" stroke="#a8a29b" strokeWidth="4" /><line x1="38" y1="75" x2="64" y2="75" stroke="#a8a29b" strokeWidth="4" /><line x1="38" y1="112" x2="64" y2="112" stroke="#a8a29b" strokeWidth="4" /><rect x="64" y="18" width="72" height="114" rx="12" fill="#3f4852" stroke="#242a31" strokeWidth="4" /><rect x="84" y="31" width="32" height="88" rx="16" fill="#242a31" /><circle cx="100" cy="75" r="13" fill="#f3eee4" stroke="#c9c1b6" strokeWidth="3" /></>
    : variant === "B"
      ? <><line x1="31" y1="38" x2="58" y2="38" stroke="#a8a29b" strokeWidth="4" /><line x1="31" y1="75" x2="58" y2="75" stroke="#a8a29b" strokeWidth="4" /><line x1="31" y1="112" x2="58" y2="112" stroke="#a8a29b" strokeWidth="4" /><circle cx="103" cy="75" r="48" fill="#445463" stroke="#242a31" strokeWidth="4" /><circle cx="103" cy="42" r="6" fill="#f3eee4" /><circle cx="133" cy="89" r="6" fill="#f3eee4" /><circle cx="73" cy="89" r="6" fill="#f3eee4" /><path d="M103 75 L133 89" stroke="#f4b84f" strokeWidth="7" strokeLinecap="round" /></>
      : <><line x1="38" y1="38" x2="64" y2="38" stroke="#a8a29b" strokeWidth="4" /><line x1="38" y1="75" x2="64" y2="75" stroke="#a8a29b" strokeWidth="4" /><line x1="38" y1="112" x2="64" y2="112" stroke="#a8a29b" strokeWidth="4" /><rect x="64" y="18" width="80" height="114" rx="12" fill="#d9d4cb" stroke="#8b857b" strokeWidth="4" /><rect x="76" y="28" width="56" height="28" rx="6" fill="#b9b3a9" /><rect x="76" y="61" width="56" height="28" rx="6" fill="#334c61" /><rect x="76" y="94" width="56" height="28" rx="6" fill="#b9b3a9" /><text x="99" y="81" className="fill-white text-[16px] font-black">2</text></>;
  const glyphs: Record<Part, ReactNode> = {
    led: <><line x1="18" y1="38" x2="64" y2="59" stroke="#a8a29b" strokeWidth="4" /><circle cx="96" cy="75" r="25" fill="#e6483f" stroke="#8d2d29" strokeWidth="4" /><path d="M84 62 l22 13 -22 13z" fill="white" transform="rotate(24 96 75)" /><path d="M108 58 l16 -7 M112 69 l18 -1" stroke="white" strokeWidth="3" strokeLinecap="round" /><line x1="128" y1="90" x2="182" y2="114" stroke="#a8a29b" strokeWidth="4" /><text x="18" y="28" className="fill-[#f4b84f] text-[16px] font-black">+</text><text x="174" y="136" className="fill-[#f4b84f] text-[16px] font-black">−</text></>,
    capacitor: <><line x1="15" y1="60" x2="64" y2="60" stroke="#a8a29b" strokeWidth="4" /><rect x="64" y="27" width="64" height="66" rx="16" fill="#2f90b5" stroke="#1a546b" strokeWidth="4" /><path d="M80 38 V82 M94 38 V82 M108 38 V82" stroke="#b8e1ec" strokeWidth="3" /><text x="73" y="67" className="fill-white text-[19px] font-black">+</text><line x1="128" y1="60" x2="185" y2="60" stroke="#a8a29b" strokeWidth="4" /></>,
    resistor: <><line x1="15" y1="60" x2="52" y2="60" stroke="#a8a29b" strokeWidth="4" /><rect x="52" y="42" width="96" height="36" rx="18" fill="#d8b47e" stroke="#8d704a" strokeWidth="3" />{["#7b3f26", "#1c1d21", "#e89f23", "#d4af37"].map((color, index) => <rect key={color} x={76 + index * 17} y="42" width="9" height="36" fill={color} />)}<line x1="148" y1="60" x2="185" y2="60" stroke="#a8a29b" strokeWidth="4" /></>,
    button: <><rect x="67" y="21" width="66" height="78" rx="11" fill="#454f5a" stroke="#242a31" strokeWidth="4" /><circle cx="100" cy="48" r="18" fill="#f3eee4" stroke="#c9c1b6" strokeWidth="4" /><line x1="67" y1="42" x2="18" y2="42" stroke="#a8a29b" strokeWidth="4" /><line x1="67" y1="77" x2="18" y2="77" stroke="#a8a29b" strokeWidth="4" /><line x1="133" y1="42" x2="182" y2="42" stroke="#a8a29b" strokeWidth="4" /><line x1="133" y1="77" x2="182" y2="77" stroke="#a8a29b" strokeWidth="4" /></>,
    potentiometer,
    switch: switchGlyph,
  };
  return <svg viewBox="0 0 200 150" className="w-full rounded-xl bg-[#f5f2eb]">{glyphs[part]}</svg>;
}

function PrototypeSwitcher({ current, onSelect }: { current: VariantKey; onSelect: (key: VariantKey) => void }) {
  const index = variants.findIndex((item) => item.key === current); const change = (offset: number) => onSelect(variants[(index + offset + variants.length) % variants.length].key);
  return <nav className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-[#090f15]/95 px-3 py-2 shadow-2xl shadow-black/50 backdrop-blur" aria-label="Prototype variants"><button onClick={() => change(-1)} className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/10" aria-label="Previous variant"><ArrowLeft className="h-4 w-4" /></button><span className="min-w-44 text-center text-xs font-bold text-white"><span className="text-orange-300">{current}</span> — {variants[index].name}</span><button onClick={() => change(1)} className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/10" aria-label="Next variant"><ArrowRight className="h-4 w-4" /></button></nav>;
}
