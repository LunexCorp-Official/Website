import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Bell, Check, CheckCheck, Coins, Gamepad2, MessageCircle, Send, ShieldAlert, Users, Wrench, Phone } from "lucide-react";
import { DEMO_LIMIT, WHATSAPP, waLink } from "../config";
import { useSeo } from "../lib/hooks";
import { Reveal } from "../components/ui";

const FEATURES = [
  { id: "games", icon: Gamepad2, title: "Games", text: "Keep the group active with interactive games played right inside the chat.", items: ["Blind 40", "Russian Roulette", "Interactive group games"] },
  { id: "economy", icon: Coins, title: "Economy", text: "A virtual currency system that gives members something to earn, spend and compete for.", items: ["Virtual currency", "Daily rewards", "Work shifts", "Shop system", "Leaderboards"] },
  { id: "moderation", icon: ShieldAlert, title: "Moderation", text: "Protect the group from scams and spam without constant manual attention.", items: ["Scam detection", "Message filtering", "Automatic warnings", "Repeat-offender management"] },
  { id: "utilities", icon: Wrench, title: "Utilities", text: "Practical tools available to everyone, one command away.", items: ["QR code generation", "Translation", "Voice-note transcription", "Flight lookups", "Interactive commands"] },
  { id: "management", icon: Users, title: "Group management", text: "Run a group properly, with administration that works the way you configure it.", items: ["Automated group administration", "Configurable moderation", "User management", "Administrative commands"] },
];

type Msg = { id: number; from: "me" | "bot"; text: string; time: string; read?: boolean };
const clock = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function reply(raw: string): string {
  const [cmd, ...rest] = raw.trim().split(/\s+/);
  switch (cmd.toLowerCase()) {
    case "#ping": return `Pong. Response time: ${20 + Math.floor(Math.random() * 70)} ms`;
    case "#echo": return rest.length ? rest.join(" ") : "Usage: #echo <text>";
    case "#flip": return Math.random() < 0.5 ? "Heads" : "Tails";
    case "#menu": return FEATURES.map((f) => `*${f.title}*\n${f.items.join(", ")}`).join("\n\n");
    default: return "This command is not part of the demo. Try #ping, #echo hello, #flip or #menu.";
  }
}
const rich = (t: string) => t.split(/(\*[^*\n]+\*)/g).map((p, i) => (p.startsWith("*") && p.endsWith("*") && p.length > 2 ? <b key={i}>{p.slice(1, -1)}</b> : <span key={i}>{p}</span>));

function Demo() {
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: "bot", text: "Hi, I am Lucif. This is a local simulation. Try a command below.", time: clock() }]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [used, setUsed] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const id = useRef(1);
  const left = DEMO_LIMIT - used;
  const locked = left <= 0;

  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing]);

  async function send(cmd: string) {
    const c = cmd.trim();
    if (!c || typing || locked) return;
    const mine = id.current++;
    setUsed((u) => u + 1); setText("");
    setMsgs((m) => [...m, { id: mine, from: "me", text: c, time: clock() }]);
    await wait(350);
    setMsgs((m) => m.map((x) => (x.id === mine ? { ...x, read: true } : x)));
    setTyping(true);
    await wait(700 + Math.random() * 700);
    setTyping(false);
    setMsgs((m) => [...m, { id: id.current++, from: "bot", text: reply(c), time: clock() }]);
  }
  const submit = (e: FormEvent) => { e.preventDefault(); send(text); };

  return (
    <div className="wa mx-auto w-full max-w-[420px] rounded-[18px] overflow-hidden border shadow-[0_40px_120px_-30px_rgba(34,255,68,.25)]" style={{ borderColor: "var(--line2)", background: "var(--wa-bg)" }} role="region" aria-label="Interactive Lucif demo">
      <div className="flex items-center gap-3 px-3 py-2.5" style={{ background: "var(--wa-bar)" }}>
        <img src="/assets/lucif-avatar.webp" alt="" width={40} height={40} className="rounded-full" />
        <div className="flex-1 min-w-0"><p className="font-medium text-[0.95rem] leading-tight" style={{ color: "var(--wa-t)" }}>Lucif</p><p className="text-xs" style={{ color: "var(--wa-m)" }} aria-live="polite">{typing ? "typing…" : "online"}</p></div>
        <span className="text-[0.68rem] font-mono px-2 py-1 rounded" style={{ background: "rgba(0,168,132,.15)", color: "var(--wa-g)" }}>{locked ? "demo ended" : `${left} left`}</span>
      </div>
      <div ref={box} className="wa-chat h-[380px] overflow-y-auto px-3 py-4 flex flex-col gap-1.5" aria-live="polite">
        <div className="self-center text-[0.7rem] px-3 py-1 rounded-md mb-2" style={{ background: "#182229", color: "var(--wa-m)" }}>Simulation. Not the real WhatsApp bot.</div>
        {msgs.map((m) => (
          <div key={m.id} className={`bubble ${m.from === "me" ? "out" : "in"}`}>
            <span className="whitespace-pre-line">{rich(m.text)}</span>
            <span className="meta">{m.time}{m.from === "me" && (m.read ? <CheckCheck size={14} color="#53bdeb" /> : <Check size={14} />)}</span>
          </div>
        ))}
        {typing && <div className="bubble in"><span className="typing-dots" aria-label="Lucif is typing"><i /><i /><i /></span></div>}
      </div>
      {locked ? (
        <div className="p-4 text-center" style={{ background: "var(--wa-bar)" }}>
          <p className="text-sm mb-3" style={{ color: "var(--wa-t)" }}>Demo limit reached. Continue with the real bot on WhatsApp.</p>
          <a href={waLink("#menu")} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">Open Lucif on WhatsApp <ArrowRight size={16} /></a>
        </div>
      ) : (
        <>
          <div className="flex gap-2 px-3 pt-2.5 pb-1 overflow-x-auto" style={{ background: "var(--wa-bg)" }}>
            {["#ping", "#echo hello", "#flip", "#menu"].map((c) => <button key={c} onClick={() => send(c)} disabled={typing} className="shrink-0 font-mono text-xs px-3 h-8 rounded-full border transition hover:bg-white/5 disabled:opacity-40" style={{ borderColor: "rgba(134,150,160,.35)", color: "var(--wa-g)" }}>{c}</button>)}
          </div>
          <form onSubmit={submit} className="flex items-center gap-2 p-2.5" style={{ background: "var(--wa-bg)" }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a command, e.g. #ping" aria-label="Message" maxLength={120} className="flex-1 h-11 px-4 rounded-full text-[0.95rem] outline-none focus-visible:ring-2 ring-[#00a884]" style={{ background: "var(--wa-bar)", color: "var(--wa-t)" }} />
            <button type="submit" aria-label="Send" disabled={!text.trim() || typing} className="w-11 h-11 rounded-full grid place-items-center transition disabled:opacity-40" style={{ background: "var(--wa-g)", color: "#fff" }}><Send size={18} /></button>
          </form>
        </>
      )}
    </div>
  );
}

export default function Lucif() {
  useSeo("Lucif | WhatsApp assistant and group manager", "Lucif is an intelligent WhatsApp assistant combining games, economy, moderation, utilities and group management in one place.", "/lucif");
  return (
    <>
      <section className="relative pt-[calc(var(--hdr)+clamp(40px,8vw,96px))] pb-24 overflow-hidden">
        <div className="grid-bg absolute inset-0 pointer-events-none" aria-hidden />
        <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[720px] h-[420px] rounded-full pointer-events-none" style={{ background: "radial-gradient(closest-side, rgba(34,255,68,.12), transparent)" }} aria-hidden />
        <div className="wrap relative flex flex-col items-center text-center">
          <img src="/assets/lucif.webp" alt="Lucif logo" width={132} height={132} className="w-28 sm:w-32 rounded-full" style={{ boxShadow: "0 0 80px -10px rgba(34,255,68,.5)" }} />
          <p className="eyebrow mt-8 mb-5">Lucif by LunexCorp</p>
          <h1 className="display h1 max-w-4xl">Your WhatsApp group. <span style={{ color: "var(--accent)" }}>Under control.</span></h1>
          <p className="lead mt-7 mx-auto">Meet Lucif. An intelligent WhatsApp assistant combining entertainment, group management, moderation and useful tools in one place.</p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <a href="#features" className="btn btn-primary">Discover Lucif functionality <ArrowRight size={16} /></a>
            <a href="#demo" className="btn">Try interactive demo</a>
            <a href={WHATSAPP.channelUrl} target="_blank" rel="noopener noreferrer" className="btn"><Bell size={16} />Follow Lucif updates</a>
          </div>
        </div>
      </section>

      <section id="features" className="hairline">
        <div className="wrap">
          {FEATURES.map((f, i) => (
            <Reveal key={f.id} className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] py-14 md:py-20 border-b last:border-b-0" >
              <div><span className="font-mono text-xs faint">0{i + 1}</span><div className="flex items-center gap-3 mt-3"><f.icon size={22} style={{ color: "var(--accent)" }} strokeWidth={1.5} /><h2 className="display h2 !text-[clamp(1.7rem,3.4vw,2.6rem)]">{f.title}</h2></div></div>
              <div><p className="lead">{f.text}</p>
                <ul className="mt-6 grid sm:grid-cols-2 gap-x-8">{f.items.map((it) => <li key={it} className="flex items-center gap-3 py-3 border-t text-[0.95rem]" style={{ borderColor: "var(--line)" }}><span className="dot !w-1.5 !h-1.5" style={{ background: "var(--accent)" }} />{it}</li>)}</ul></div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="demo" className="section hairline">
        <div className="wrap grid gap-14 grid-cols-[minmax(0,1fr)] lg:grid-cols-[1fr_auto] items-center">
          <Reveal><p className="eyebrow mb-4">Interactive demo</p><h2 className="display h2">Try Lucif right here.</h2>
            <p className="lead mt-6">Send a command and see how Lucif responds. You have {DEMO_LIMIT} free interactions.</p>
            <p className="mt-6 text-sm muted max-w-md border-l-2 pl-4" style={{ borderColor: "var(--accent)" }}>This is a local simulation that runs in your browser. It is not the actual WhatsApp bot, and nothing you type is sent anywhere.</p>
          </Reveal>
          <Reveal delay={120} className="min-w-0"><Demo /></Reveal>
        </div>
      </section>

      <section id="start" className="section hairline">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <Reveal><p className="eyebrow mb-4">Get Lucif</p><h2 className="display h2">Start on WhatsApp.</h2><p className="lead mt-6">Message the bot directly, or follow the official channel for updates and announcements.</p></Reveal>
          <Reveal delay={100}>
            <div className="border-t" style={{ borderColor: "var(--line)" }}>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 py-6 border-b no-underline group" style={{ borderColor: "var(--line)" }}><span className="flex items-center gap-4"><Phone size={20} style={{ color: "var(--accent)" }} /><span><span className="block font-display font-semibold text-lg">Message the bot</span><span className="block font-mono text-sm faint">{WHATSAPP.display}</span></span></span><ArrowRight size={18} className="transition group-hover:translate-x-1" /></a>
              <a href={WHATSAPP.channelUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 py-6 border-b no-underline group" style={{ borderColor: "var(--line)" }}><span className="flex items-center gap-4"><MessageCircle size={20} style={{ color: "var(--accent)" }} /><span><span className="block font-display font-semibold text-lg">Follow the WhatsApp channel</span><span className="block text-sm faint">Updates and announcements</span></span></span><ArrowRight size={18} className="transition group-hover:translate-x-1" /></a>
            </div>
            <p className="text-xs faint mt-8 leading-relaxed">Lucif is an independent project developed by LunexCorp. It is not affiliated with, authorised by or endorsed by WhatsApp or Meta Platforms, Inc. WhatsApp is a trademark of its respective owner. Lucif's source code is private.</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
