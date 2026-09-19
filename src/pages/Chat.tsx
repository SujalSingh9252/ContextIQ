import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Upload,
  Send,
  FileText,
  Loader2,
  Clock,
  LogOut,
  Plus,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { uploadPdf, askQuery, getDocuments } from "@/lib/api";
import { Logo } from "@/components/Logo";

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  latency?: number;
  timestamp: Date;
}

interface Document {
  filename?: string;
  name?: string;
  [key: string]: any;
}

// ── Chat Page ────────────────────────────────────────────────────────────────

export default function Chat() {
  const navigate = useNavigate();
  const { user, session, isAuthenticated, isLoading: authLoading, signOut } = useAuth();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // ── State ────────────────────────────────────────────────────────────────

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchDocuments = useCallback(async () => {
    try {
      setLoadingDocs(true);
      const data = await getDocuments();
      setDocuments(data.documents ?? []);
    } catch (err: any) {
      toast.error("Failed to load documents");
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchDocuments();
  }, [isAuthenticated, fetchDocuments]);

  // ── Scroll to bottom on new messages ─────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadPdf(file);
      toast.success(`Uploaded ${result.filename}`);
      await fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    const trimmed = query.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setSending(true);

    try {
      const result = await askQuery(trimmed);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.answer,
        sources: result.sources,
        latency: result.latency,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      toast.error(err.message || "Failed to get answer");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // ── Loading / guard ──────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0f]">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex flex-col border-r border-white/[0.06] bg-[#0c0c14] overflow-hidden shrink-0"
          >
            {/* Sidebar header */}
            <div className="p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <Logo className="w-6 h-6 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)] flex-shrink-0" />
                <span className="text-sm font-semibold tracking-tight text-white/90">ContextIQ </span>
                <button
                  id="sidebar-collapse-btn"
                  onClick={() => setSidebarOpen(false)}
                  className="ml-auto p-1.5 rounded-md hover:bg-white/[0.06] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-white/40" />
                </button>
              </div>

              {/* Upload button */}
              <input
                ref={fileInputRef}
                id="pdf-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                id="upload-pdf-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm h-9 rounded-lg font-medium transition-colors"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {uploading ? "Uploading…" : "Upload PDF"}
              </Button>
            </div>

            {/* Document list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-widest text-white/25 px-2 mb-2">
                Documents
              </p>
              {loadingDocs ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-4 w-4 animate-spin text-white/20" />
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/20">
                  <Upload className="h-8 w-8 mb-3 opacity-40" />
                  <p className="text-xs text-center leading-relaxed">
                    No documents yet.
                    <br />
                    Upload a PDF to get started.
                  </p>
                </div>
              ) : (
                documents.map((doc, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group cursor-default"
                  >
                    <div className="w-7 h-7 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <FileText className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span className="text-xs text-white/60 truncate group-hover:text-white/80 transition-colors">
                      {doc.filename || doc.name || `Document ${i + 1}`}
                    </span>
                  </motion.div>
                ))
              )}
            </div>

            {/* User footer */}
            <div className="p-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 px-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {user?.email?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <span className="text-xs text-white/50 truncate flex-1">
                  {user?.email ?? "User"}
                </span>
                <button
                  id="sign-out-btn"
                  onClick={handleSignOut}
                  className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5 text-white/30 hover:text-white/60" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main chat area ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 flex items-center gap-3 px-4 border-b border-white/[0.06] shrink-0">
          {!sidebarOpen && (
            <button
              id="sidebar-expand-btn"
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-white/40" />
            </button>
          )}
          <MessageSquare className="h-4 w-4 text-blue-400/60" />
          <span className="text-sm font-medium text-white/70">Chat</span>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-5">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center pt-24 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/10 flex items-center justify-center mb-5">
                  <Sparkles className="h-6 w-6 text-blue-400/60" />
                </div>
                <h2 className="text-lg font-semibold text-white/80 mb-2">
                  Ask your documents anything
                </h2>
                <p className="text-sm text-white/30 max-w-sm leading-relaxed">
                  Upload PDFs in the sidebar, then ask questions. Answers are
                  grounded in your indexed documents.
                </p>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white/[0.05] border border-white/[0.08] text-white/85 rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/[0.08]">
                        {msg.sources.map((src, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 font-medium cursor-default hover:bg-blue-500/15 transition-colors"
                          >
                            <FileText className="h-2.5 w-2.5" />
                            {src}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Latency */}
                    {msg.latency != null && (
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-white/25">
                        <Clock className="h-2.5 w-2.5" />
                        {(msg.latency * 1000).toFixed(0)}ms
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Thinking indicator */}
            {sending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                  <span className="text-xs text-white/40">Thinking…</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-md">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question…"
                disabled={sending}
                className="w-full h-11 pl-4 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50"
              />
              <Button
                id="send-btn"
                size="icon-sm"
                onClick={handleSend}
                disabled={!query.trim() || sending}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-white/[0.06] disabled:text-white/20 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
