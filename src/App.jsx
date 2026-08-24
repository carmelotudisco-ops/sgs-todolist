import { useState, useEffect, useCallback } from "react";
import { Plus, Check, Archive, Inbox, Trash2, LogOut, Loader2, Pencil, X, ChevronDown, Search } from "lucide-react";
import { supabase } from "./supabaseClient";
import logoSgs from "./assets/logo-sgs.png";

const CATEGORIES = [
  { id: "sito", name: "Sito", color: "#2E5C8A" },
  { id: "logo", name: "Logo", color: "#6B4C7A" },
  { id: "packaging", name: "Packaging", color: "#A6763D" },
  { id: "ean", name: "Ean", color: "#4A6B6F" },
  { id: "scheda-tecnica", name: "Scheda Tecnica", color: "#3D5A50" },
  { id: "promo", name: "Promo", color: "#8A5A44" },
  { id: "catalogo", name: "Catalogo", color: "#5C6B8A" },
  { id: "mailing", name: "Mailing", color: "#7A6B4C" },
  { id: "grafica", name: "Grafica", color: "#8A4C6B" },
  { id: "varie", name: "Varie", color: "#6B6357" },
];

const URGENCY = {
  urgente: { label: "Urgente", color: "#C1443C", rank: 0 },
  normale: { label: "Normale", color: "#D98B3B", rank: 1 },
  "non-urgente": { label: "Non urgente", color: "#4F8F63", rank: 2 },
};

function categoryOf(id) {
  return CATEGORIES.find((c) => c.id === id) || { name: "Varie", color: "#6B6357" };
}

function formatData(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

// dalla email "mario.rossi@sgs.it" mostra solo "mario.rossi", per un'etichetta più discreta
function shortName(email) {
  if (!email) return "";
  return email.split("@")[0];
}

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }
  .ledger-title { font-family: 'Fraunces', serif; }
  .card-enter { animation: cardIn .35s ease both; }
  @keyframes cardIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
  .stamp { animation: stampIn .5s cubic-bezier(.2,1.4,.4,1) both; }
  @keyframes stampIn {
    0% { opacity:0; transform: scale(2.4) rotate(-18deg); }
    60% { opacity:1; transform: scale(0.92) rotate(-14deg); }
    100% { opacity:1; transform: scale(1) rotate(-12deg); }
  }
  .toast-in { animation: toastIn .3s ease both; }
  @keyframes toastIn { from { opacity:0; transform: translate(-50%,10px);} to { opacity:1; transform: translate(-50%,0);} }
  @media (prefers-reduced-motion: reduce) {
    .card-enter, .stamp, .toast-in { animation: none !important; }
  }
  input:focus, button:focus, select:focus, textarea:focus { outline: 2px solid #3D5A50; outline-offset: 2px; }
`;

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div style={{ fontFamily: "'Source Sans 3','Helvetica Neue',sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>
      {session === undefined ? (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#EDEAE3" }}>
          <Loader2 className="animate-spin" size={28} style={{ color: "#2B2822" }} />
        </div>
      ) : session ? (
        <TodoApp session={session} />
      ) : (
        <Login />
      )}
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError("Email o password non corretti.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#EDEAE3" }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border-2 bg-white p-6 sm:p-8"
        style={{ borderColor: "#2B2822" }}
      >
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <img src={logoSgs} alt="Logo SGS" className="h-12 w-auto" />
          <h1 className="ledger-title text-2xl font-semibold" style={{ color: "#2B2822" }}>
            To Do List
          </h1>
          <p className="text-xs" style={{ color: "#6B6357" }}>
            Accedi con le credenziali del team
          </p>
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#6B6357" }}>
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border-2 px-3 py-2 mb-3 text-[15px]"
          style={{ borderColor: "#2B2822" }}
        />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#6B6357" }}>
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border-2 px-3 py-2 mb-4 text-[15px]"
          style={{ borderColor: "#2B2822" }}
        />

        {error && (
          <p className="text-xs mb-3" style={{ color: "#A63D40" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "#2B2822" }}
        >
          {loading ? "Accesso in corso…" : "Accedi"}
        </button>
      </form>
    </div>
  );
}

function TodoApp({ session }) {
  const [tab, setTab] = useState("attivi");
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [catId, setCatId] = useState(CATEGORIES[0].id);
  const [urgency, setUrgency] = useState("normale");
  const [toast, setToast] = useState(null);
  const [stampingId, setStampingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "", urgency: "" });
  const [search, setSearch] = useState("");

  const loadTasks = useCallback(async () => {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    if (!error) setTasks(data || []);
    setLoadingTasks(false);
  }, []);

  useEffect(() => {
    loadTasks();

    // sincronizzazione in tempo reale: ogni modifica di un membro del team
    // aggiorna la lista per tutti gli altri collegati
    const channel = supabase
      .channel("tasks-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        loadTasks();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadTasks]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  async function addTask(e) {
    e.preventDefault();
    const clean = title.trim();
    if (!clean || saving) return;
    setSaving(true);
    const { error } = await supabase.from("tasks").insert({
      title: clean,
      description: description.trim() || null,
      category: catId,
      urgency,
      status: "attivo",
      created_by: session.user.email,
    });
    setSaving(false);
    if (!error) {
      setTitle("");
      setDescription("");
    } else {
      setToast("Errore nel salvataggio del task.");
    }
  }

  async function completeTask(task) {
    setStampingId(task.id);
    setTimeout(async () => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "archiviato", completed_at: new Date().toISOString() })
        .eq("id", task.id);
      setStampingId(null);
      if (!error) setToast(`Completato e archiviato: "${task.title}"`);
    }, 520);
  }

  async function restoreTask(task) {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "attivo", completed_at: null })
      .eq("id", task.id);
    if (!error) setToast(`Riportato tra i task da fare: "${task.title}"`);
  }

  async function deleteTask(task) {
    const ok = window.confirm(`Eliminare definitivamente "${task.title}"? L'azione non è reversibile.`);
    if (!ok) return;
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (!error) setToast(`Task eliminato: "${task.title}"`);
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      description: task.description || "",
      category: task.category,
      urgency: task.urgency,
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(task) {
    const clean = editForm.title.trim();
    if (!clean) return;
    const { error } = await supabase
      .from("tasks")
      .update({
        title: clean,
        description: editForm.description.trim() || null,
        category: editForm.category,
        urgency: editForm.urgency,
        edited_at: new Date().toISOString(),
      })
      .eq("id", task.id);
    if (!error) {
      setEditingId(null);
      setToast(`Task modificato: "${clean}"`);
    } else {
      setToast("Errore nel salvataggio delle modifiche.");
    }
  }

  function toggleExpand(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const visible = tasks
    .filter((t) => (tab === "attivi" ? t.status === "attivo" : t.status === "archiviato"))
    .filter((t) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const diff = (URGENCY[a.urgency]?.rank ?? 1) - (URGENCY[b.urgency]?.rank ?? 1);
      if (diff !== 0) return diff;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const activeCount = tasks.filter((t) => t.status === "attivo").length;
  const archivedCount = tasks.filter((t) => t.status === "archiviato").length;

  return (
    <div className="min-h-screen w-full" style={{ background: "#EDEAE3", color: "#2B2822" }}>
      <header className="border-b-2 px-6 py-6 sm:px-10" style={{ borderColor: "#2B2822" }}>
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-5">
          <div className="w-full flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "#6B6357" }}
            >
              <LogOut size={13} /> {session.user.email} · esci
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <img src={logoSgs} alt="Logo SGS" className="h-12 sm:h-14 w-auto" />
            <p className="text-[11px] tracking-[0.25em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6B6357" }}>
              Registro attività
            </p>
            <h1 className="ledger-title text-2xl sm:text-3xl font-semibold leading-tight">To Do List</h1>
          </div>

          <div className="flex rounded-md overflow-hidden border-2 self-stretch sm:self-auto" style={{ borderColor: "#2B2822" }}>
            <button
              onClick={() => setTab("attivi")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: tab === "attivi" ? "#2B2822" : "transparent",
                color: tab === "attivi" ? "#EDEAE3" : "#2B2822",
              }}
            >
              <Inbox size={15} /> Da fare
              <span
                className="text-xs px-1.5 rounded-full"
                style={{ background: tab === "attivi" ? "#EDEAE3" : "#2B2822", color: tab === "attivi" ? "#2B2822" : "#EDEAE3" }}
              >
                {activeCount}
              </span>
            </button>
            <button
              onClick={() => setTab("archivio")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors border-l-2"
              style={{
                borderColor: "#2B2822",
                background: tab === "archivio" ? "#2B2822" : "transparent",
                color: tab === "archivio" ? "#EDEAE3" : "#2B2822",
              }}
            >
              <Archive size={15} /> Archiviati
              <span
                className="text-xs px-1.5 rounded-full"
                style={{ background: tab === "archivio" ? "#EDEAE3" : "#2B2822", color: tab === "archivio" ? "#2B2822" : "#EDEAE3" }}
              >
                {archivedCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 sm:px-10">
        {tab === "attivi" && (
          <form onSubmit={addTask} className="mb-8 rounded-lg border-2 p-4 sm:p-5 bg-white/60" style={{ borderColor: "#2B2822" }}>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#6B6357" }}>
                  Titolo
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nome del task…"
                  className="w-full rounded-md border-2 px-3 py-2 bg-white text-[15px]"
                  style={{ borderColor: "#2B2822" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#6B6357" }}>
                  Descrizione
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Dettagli, note, riferimenti…"
                  rows={2}
                  className="w-full rounded-md border-2 px-3 py-2 bg-white text-sm resize-none"
                  style={{ borderColor: "#2B2822" }}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#6B6357" }}>
                    Categoria
                  </label>
                  <select
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    className="w-full rounded-md border-2 px-3 py-2 bg-white text-[15px]"
                    style={{ borderColor: "#2B2822" }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#6B6357" }}>
                    Priorità
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full rounded-md border-2 px-3 py-2 bg-white text-[15px] font-medium"
                    style={{ borderColor: URGENCY[urgency].color, color: URGENCY[urgency].color }}
                  >
                    {Object.entries(URGENCY).map(([key, u]) => (
                      <option key={key} value={key} style={{ color: "#2B2822" }}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
                    style={{ background: "#2B2822" }}
                  >
                    <Plus size={16} /> Aggiungi
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9c9385" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca tra i task…"
            className="w-full rounded-md border-2 pl-9 pr-3 py-2 bg-white text-[15px]"
            style={{ borderColor: "#2B2822" }}
          />
        </div>

        {loadingTasks ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin" size={24} style={{ color: "#6B6357" }} />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 rounded-lg border-2 border-dashed" style={{ borderColor: "#c9c3b6" }}>
            <p className="text-sm" style={{ color: "#6B6357" }}>
              {search.trim()
                ? "Nessun task corrisponde alla ricerca."
                : tab === "attivi"
                ? "Nessun task da fare: aggiungine uno qui sopra."
                : "L'archivio è ancora vuoto."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((t) => {
              const u = URGENCY[t.urgency] || URGENCY.normale;
              const cat = categoryOf(t.category);
              const isEditing = editingId === t.id;
              const isExpanded = expandedIds.has(t.id);

              if (isEditing) {
                return (
                  <li
                    key={t.id}
                    className="card-enter rounded-md border-2 bg-white p-4"
                    style={{ borderColor: "#2B2822" }}
                  >
                    <div className="flex flex-col gap-2.5">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        className="w-full rounded-md border-2 px-3 py-2 text-[15px]"
                        style={{ borderColor: "#2B2822" }}
                        placeholder="Titolo"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        rows={2}
                        className="w-full rounded-md border-2 px-3 py-2 text-sm resize-none"
                        style={{ borderColor: "#2B2822" }}
                        placeholder="Descrizione"
                      />
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#6B6357" }}>
                            Categoria
                          </label>
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                            className="w-full rounded-md border-2 px-3 py-2 text-sm"
                            style={{ borderColor: "#2B2822" }}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#6B6357" }}>
                            Priorità
                          </label>
                          <select
                            value={editForm.urgency}
                            onChange={(e) => setEditForm((f) => ({ ...f, urgency: e.target.value }))}
                            className="w-full rounded-md border-2 px-3 py-2 text-sm font-medium"
                            style={{ borderColor: URGENCY[editForm.urgency]?.color || "#2B2822" }}
                          >
                            {Object.entries(URGENCY).map(([key, uu]) => (
                              <option key={key} value={key}>
                                {uu.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold"
                          style={{ color: "#6B6357" }}
                        >
                          <X size={14} /> Annulla
                        </button>
                        <button
                          onClick={() => saveEdit(t)}
                          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white"
                          style={{ background: "#2B2822" }}
                        >
                          <Check size={14} /> Salva
                        </button>
                      </div>
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={t.id}
                  className="card-enter relative flex items-center justify-between gap-3 rounded-md border-2 bg-white pl-3 pr-4 py-3 overflow-hidden"
                  style={{ borderColor: "#2B2822", borderLeft: `6px solid ${u.color}` }}
                >
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleExpand(t.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-[15px] font-medium ${isExpanded ? "whitespace-normal break-words" : "truncate"}`}
                        style={{ color: "#2B2822" }}
                      >
                        {t.title}
                      </p>
                      {t.created_by && (
                        <span className="shrink-0 text-xs font-medium" style={{ color: "#8A5A44" }}>
                          — {shortName(t.created_by)}
                        </span>
                      )}
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                        style={{ background: u.color }}
                      >
                        {u.label}
                      </span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                        style={{ background: cat.color }}
                      >
                        {cat.name}
                      </span>
                      {(t.description) && (
                        <ChevronDown
                          size={13}
                          className="shrink-0 transition-transform"
                          style={{ color: "#9c9385", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      )}
                    </div>
                    {t.description && (
                      <p
                        className={`text-sm mt-0.5 ${isExpanded ? "whitespace-pre-line break-words" : "truncate"}`}
                        style={{ color: "#4A453C" }}
                      >
                        {t.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9c9385" }}>
                        {tab === "attivi" ? `creato il ${formatData(t.created_at)}` : `completato il ${formatData(t.completed_at)}`}
                      </p>
                      {t.edited_at && (
                        <p className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9c9385" }}>
                          · modificato il {formatData(t.edited_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  {tab === "attivi" ? (
                    <div className="shrink-0 flex items-center gap-1.5">
                      <button
                        onClick={() => startEdit(t)}
                        title="Modifica"
                        className="p-1.5 rounded-md hover:bg-black/5"
                        style={{ color: "#6B6357" }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteTask(t)}
                        title="Elimina"
                        className="p-1.5 rounded-md hover:bg-black/5"
                        style={{ color: "#A63D40" }}
                      >
                        <Trash2 size={15} />
                      </button>
                      <button
                        onClick={() => completeTask(t)}
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                        style={{ background: cat.color }}
                      >
                        <Check size={14} /> Fatto
                      </button>
                    </div>
                  ) : (
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => restoreTask(t)}
                        className="text-xs font-medium underline decoration-dotted"
                        style={{ color: "#6B6357" }}
                      >
                        riattiva
                      </button>
                      <button
                        onClick={() => deleteTask(t)}
                        className="p-1.5 rounded-md hover:bg-black/5"
                        style={{ color: "#A63D40" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  {stampingId === t.id && (
                    <div
                      className="stamp pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 select-none rounded border-4 px-3 py-1 text-sm font-black tracking-wider"
                      style={{ borderColor: "#A63D40", color: "#A63D40" }}
                    >
                      ARCHIVIATO
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {toast && (
        <div
          className="toast-in fixed bottom-6 left-1/2 z-50 flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg"
          style={{ background: "#2B2822" }}
        >
          <Check size={16} style={{ color: "#8FBF9F" }} />
          {toast}
        </div>
      )}
    </div>
  );
}
