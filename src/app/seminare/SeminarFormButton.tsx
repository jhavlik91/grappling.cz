"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ?? "";

const inputCls =
  "w-full rounded-lg bg-white/[0.06] border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#A855F7]/60 focus:bg-white/[0.08] transition text-sm";
const labelCls = "block text-sm text-gray-400 mb-1.5";

interface FormState {
  name: string;
  instructor: string;
  date: string;
  time: string;
  location: string;
  logoUrl: string;
  url: string;
  registrationFee: string;
  description: string;
  submitterEmail: string;
}

const EMPTY: FormState = {
  name: "", instructor: "", date: "", time: "", location: "",
  logoUrl: "", url: "", registrationFee: "", description: "", submitterEmail: "",
};

function SeminarFormModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!SCRIPT_URL) return;
    setStatus("sending");
    try {
      const params = new URLSearchParams({ action: "submit", ...form });
      await fetch(`${SCRIPT_URL}?${params}`);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const modal = (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-[#111113] border border-white/[0.06] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
          aria-label="Zavřít"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h2 className="font-display text-2xl font-bold text-white mb-1">Přidat seminář</h2>
        <p className="text-sm text-gray-500 mb-6">Seminář se zobrazí po schválení administrátorem.</p>

        {status === "done" ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">✓</div>
            <p className="text-white font-semibold text-lg">Odesláno!</p>
            <p className="text-gray-400 text-sm mt-2">Seminář jsme přijali a brzy ho schválíme.</p>
            <button onClick={onClose} className="mt-6 btn-outline rounded-lg px-6 py-2.5 text-sm font-bold">
              Zavřít
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Název semináře *</label>
              <input required type="text" placeholder="např. No-Gi Fundamentals" className={inputCls} value={form.name} onChange={field("name")} />
            </div>
            <div>
              <label className={labelCls}>Lektor / instructor *</label>
              <input required type="text" placeholder="Jméno lektora" className={inputCls} value={form.instructor} onChange={field("instructor")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Datum *</label>
                <input required type="date" className={inputCls} value={form.date} onChange={field("date")} />
              </div>
              <div>
                <label className={labelCls}>Čas</label>
                <input type="time" className={inputCls} value={form.time} onChange={field("time")} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Místo konání *</label>
              <input required type="text" placeholder="Město, klub" className={inputCls} value={form.location} onChange={field("location")} />
            </div>
            <div>
              <label className={labelCls}>URL obrázku / loga</label>
              <input type="url" placeholder="https://..." className={inputCls} value={form.logoUrl} onChange={field("logoUrl")} />
            </div>
            <div>
              <label className={labelCls}>Link na registraci</label>
              <input type="url" placeholder="https://..." className={inputCls} value={form.url} onChange={field("url")} />
            </div>
            <div>
              <label className={labelCls}>Registrační poplatek</label>
              <input type="text" placeholder="např. 500 Kč nebo zdarma" className={inputCls} value={form.registrationFee} onChange={field("registrationFee")} />
            </div>
            <div>
              <label className={labelCls}>Popis semináře</label>
              <textarea
                rows={3}
                placeholder="Co se budeme učit, na koho je seminář zaměřen…"
                className={inputCls + " resize-none"}
                value={form.description}
                onChange={field("description")}
              />
            </div>
            <div>
              <label className={labelCls}>Váš email *</label>
              <input required type="email" placeholder="vas@email.cz" className={inputCls} value={form.submitterEmail} onChange={field("submitterEmail")} />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-sm">Odeslání se nezdařilo. Zkuste to prosím znovu.</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-2 rounded-lg bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-3 text-sm transition disabled:opacity-50"
            >
              {status === "sending" ? "Odesílám…" : "Odeslat seminář"}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}

export function SeminarFormButton() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="shrink-0 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 px-4 py-2.5 text-sm font-bold text-white transition flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Přidat seminář
      </button>
      {showForm && <SeminarFormModal onClose={() => setShowForm(false)} />}
    </>
  );
}
