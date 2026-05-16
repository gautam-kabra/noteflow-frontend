"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notes as notesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/Logo';
import {
  FileText, Pin, Tag, Search, Plus,
  Trash2, Edit3, Share2, LogOut, X,
  Clock, StickyNote, ChevronLeft, ChevronRight,
  Lock, Unlock, Eye, EyeOff, Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LABELS = ['work', 'personal', 'ideas', 'urgent', 'archive'];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Dashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [notesList, setNotesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [showPinned, setShowPinned] = useState<boolean | null>(null);
  const [showShared, setShowShared] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | 'share' | 'delete' | 'lock' | 'unlock' | 'verify' | null>(null);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [unlockedNotes, setUnlockedNotes] = useState<string[]>([]);
  const [form, setForm] = useState({ title: '', content: '', label: '', is_pinned: false, is_locked: false, lock_password: '' });
  const [shareEmail, setShareEmail] = useState('');
  const [notePassword, setNotePassword] = useState('');
  const [showNotePassword, setShowNotePassword] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<'view' | 'edit' | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const params: any = { page, per_page: 12 };
      if (activeLabel) params.label = activeLabel;
      if (showPinned !== null) params.pinned = showPinned;
      if (showShared !== null) params.shared_only = showShared;

      let res;
      if (searchQuery.trim()) {
        res = await notesApi.search({ q: searchQuery, page, per_page: 12 });
      } else {
        res = await notesApi.getAll(params);
      }
      setNotesList(res.data.notes);
      setTotalPages(res.data.total_pages);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [page, activeLabel, showPinned, searchQuery, isAuthenticated, showShared]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchNotes();
    } else if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [fetchNotes, isLoading, isAuthenticated, router]);

  useEffect(() => { setPage(1); }, [searchQuery, activeLabel, showPinned, showShared]);

  // Security: Always clear unlocked notes when returning to the dashboard
  useEffect(() => {
    if (modal === null) {
      setUnlockedNotes([]);
      setNotePassword('');
      setShowNotePassword(false);
    }
  }, [modal]);

  const openCreate = () => {
    setForm({ title: '', content: '', label: '', is_pinned: false, is_locked: false, lock_password: '' });
    setModal('create');
  };

  const openEdit = (note: any) => {
    setSelectedNote(note);
    if (note.is_locked && !unlockedNotes.includes(note.id)) {
      setNotePassword('');
      setVerifyTarget('edit');
      setModal('verify');
      return;
    }
    setForm({
      title: note.title,
      content: note.content,
      label: note.label || '',
      is_pinned: note.is_pinned,
      is_locked: note.is_locked,
      lock_password: ''
    });
    setModal('edit');
  };

  const openNote = (note: any) => {
    setSelectedNote(note);
    if (note.is_locked && !unlockedNotes.includes(note.id)) {
      setNotePassword('');
      setVerifyTarget('view');
      setModal('verify');
    } else {
      setModal('view');
    }
  };

  const handleVerify = async () => {
    if (!notePassword) return toast.error('Enter password');
    try {
      const res = await notesApi.verifyLock(selectedNote.id, { password: notePassword });
      const decryptedNote = res.data;

      // Update the local list with the real content
      setNotesList(prev => prev.map(n => n.id === decryptedNote.id ? decryptedNote : n));
      setSelectedNote(decryptedNote);

      setUnlockedNotes([...unlockedNotes, decryptedNote.id]);
      if (verifyTarget === 'edit') {
        setForm({
          title: decryptedNote.title,
          content: decryptedNote.content,
          label: decryptedNote.label || '',
          is_pinned: decryptedNote.is_pinned,
          is_locked: decryptedNote.is_locked,
          lock_password: ''
        });
        setModal('edit');
      } else {
        setModal('view');
      }
      setVerifyTarget(null);
    } catch {
      toast.error('Incorrect password');
    }
  };

  const closeViewModal = () => {
    if (selectedNote?.is_locked) {
      setUnlockedNotes(prev => prev.filter(id => id !== selectedNote.id));
    }
    setModal(null);
  };

  const handleLock = async () => {
    if (!notePassword) return toast.error('Enter password');
    try {
      await notesApi.lock(selectedNote.id, { password: notePassword });
      toast.success('Note locked');
      setModal(null);
      fetchNotes();
    } catch { toast.error('Failed to lock'); }
  };

  const handleUnlock = async () => {
    if (!notePassword) return toast.error('Enter password');
    try {
      await notesApi.unlock(selectedNote.id, { password: notePassword });
      toast.success('Note unlocked');
      setModal(null);
      fetchNotes();
    } catch { toast.error('Incorrect password'); }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return toast.error('Title and content required');
    setSaving(true);
    try {
      const data = { ...form, label: form.label || null };
      if (modal === 'create') {
        await notesApi.create(data);
        toast.success('Note created');
      } else {
        await notesApi.update(selectedNote.id, data);
        toast.success('Note updated');
      }
      setModal(null);
      fetchNotes();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (note: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNote(note);
    setModal('delete');
  };

  const confirmDelete = async () => {
    try {
      await notesApi.delete(selectedNote.id);
      toast.success('Note deleted');
      setModal(null);
      fetchNotes();
    } catch { toast.error('Failed to delete'); }
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) return toast.error('Enter an email');
    setSaving(true);
    try {
      await notesApi.share(selectedNote.id, { share_with_email: shareEmail });
      toast.success(`Shared with ${shareEmail}`);
      setModal(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to share');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePin = async (note: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notesApi.update(note.id, { is_pinned: !note.is_pinned });
      toast.success(note.is_pinned ? 'Unpinned' : 'Pinned');
      fetchNotes();
    } catch { toast.error('Failed to update'); }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col hidden md:flex shrink-0">
        <Link href="/" className="p-4 px-6 flex items-center gap-3 font-bold text-xl tracking-tight mb-4 h-20 shrink-0 border-b border-zinc-900/50 hover:opacity-80 transition-opacity cursor-pointer">
          <Logo className="w-8 h-8" />
          NoteFlow
        </Link>

        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => { setActiveLabel(null); setShowPinned(null); setShowShared(null); setSearchQuery(''); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${!activeLabel && showPinned === null && showShared === null ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
          >
            <FileText className="w-4 h-4" /> All Notes
          </button>
          <button
            onClick={() => { setShowPinned(true); setActiveLabel(null); setShowShared(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${showPinned === true ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
          >
            <Pin className="w-4 h-4" /> Pinned
          </button>
          <button
            onClick={() => { setShowShared(true); setActiveLabel(null); setShowPinned(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${showShared === true ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
          >
            <Users className="w-4 h-4" /> Shared with me
          </button>

          <div className="pt-8 pb-3 px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.1em]">
            Labels
          </div>
          {LABELS.map(l => (
            <button
              key={l}
              onClick={() => { setActiveLabel(activeLabel === l ? null : l); setShowPinned(null); setShowShared(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${activeLabel === l ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
            >
              <Tag className="w-4 h-4 opacity-50" /> {l}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-900 flex items-center justify-between bg-zinc-950 shrink-0">
          <div className="flex flex-col truncate pr-4">
            <span className="text-sm font-bold truncate text-zinc-100">{user?.email?.split('@')[0]}</span>
            <span className="text-[10px] text-zinc-600 truncate">{user?.email}</span>
          </div>
          <button onClick={logout} className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-zinc-900 px-8 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-xl font-bold capitalize tracking-tight text-zinc-100">
            {activeLabel ? activeLabel : showPinned ? 'Pinned Notes' : showShared ? 'Shared with me' : 'All Notes'}
          </h1>

          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="text"
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus-ring text-zinc-200 placeholder:text-zinc-700 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-zinc-100 text-zinc-950 px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3px]" /> <span>Create</span>
            </button>
          </div>
        </header>

        {/* Note Grid */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-700">
              <div className="animate-spin w-8 h-8 border-2 border-zinc-800 border-t-zinc-100 rounded-full mb-4"></div>
              <p className="text-xs font-bold tracking-widest uppercase">Synchronizing</p>
            </div>
          ) : notesList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-zinc-900 text-zinc-800 rounded-3xl flex items-center justify-center mb-8 border border-zinc-800 shadow-inner">
                <StickyNote className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-3">
                {searchQuery ? 'No results found' : showShared ? 'No shared notes' : 'Start your story'}
              </h3>
              <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                {searchQuery ? 'Try adjusting your search terms.' : showShared ? 'Notes shared with you by others will appear here.' : 'Create your first note to capture your beautiful thoughts.'}
              </p>
              {!searchQuery && !showShared && (
                <button onClick={openCreate} className="bg-zinc-900 border border-zinc-800 text-zinc-100 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-xl flex items-center gap-2 active:scale-95">
                  <Plus className="w-4 h-4 stroke-[3px]" /> Create first note
                </button>
              )}
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
              >
                {/* Inline Create Card - Hidden in Shared view */}
                {!showShared && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={openCreate}
                    className="group bg-zinc-900/30 border-2 border-dashed border-zinc-800/50 rounded-3xl p-6 hover:border-zinc-100/20 hover:bg-zinc-900 transition-all cursor-pointer flex flex-col items-center justify-center h-72 relative shadow-lg active:scale-[0.98]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 group-hover:bg-zinc-100 group-hover:text-zinc-950 group-hover:border-transparent transition-all duration-300 flex items-center justify-center mb-4 shadow-inner">
                      <Plus className="w-6 h-6 stroke-[3px]" />
                    </div>
                    <span className="text-zinc-600 group-hover:text-zinc-100 font-bold tracking-tight transition-colors">Capture Thought</span>
                  </motion.div>
                )}

                {notesList.map((note) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={note.id}
                    onClick={() => openNote(note)}
                    className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all cursor-pointer flex flex-col h-72 relative shadow-lg active:scale-[0.98] overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4 gap-3">
                      <div className="flex flex-col truncate">
                        <h3 className="font-bold text-zinc-100 truncate text-lg leading-tight group-hover:text-white transition-colors">{note.title}</h3>
                        {note.owner_id !== user?.id && (
                          <span className="text-[10px] text-amber-500/60 font-medium truncate mt-1">Shared by {note.owner_email}</span>
                        )}
                      </div>
                      <div className="flex gap-1 items-center">
                        {note.is_locked && (
                          <div className="p-1.5 text-amber-500/80 bg-amber-500/10 rounded-lg">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <button
                          onClick={(e) => handleTogglePin(note, e)}
                          className={`shrink-0 p-1.5 rounded-lg hover:bg-zinc-800 transition-all ${note.is_pinned ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-700 opacity-0 group-hover:opacity-100'}`}
                        >
                          <Pin className="w-4 h-4" fill={note.is_pinned ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    <div className="relative flex-1">
                      <p className={`text-zinc-500 text-sm line-clamp-5 whitespace-pre-wrap leading-relaxed group-hover:text-zinc-400 transition-all duration-500 ${note.is_locked && !unlockedNotes.includes(note.id) ? 'blur-[8px] select-none opacity-40' : ''}`}>
                        {note.content}
                      </p>
                      {note.is_locked && !unlockedNotes.includes(note.id) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/20 rounded-3xl pointer-events-none">
                          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-sm">
                            <Lock className="w-5 h-5 text-amber-500" />
                          </div>
                          <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-[0.2em]">Encrypted Vault</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-5 border-t border-zinc-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {note.label && (
                          <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {note.label}
                          </span>
                        )}
                        <span className="text-zinc-600 text-[10px] font-bold flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> {formatDate(note.updated_at).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        {note.owner_id === user?.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNote(note);
                              setNotePassword('');
                              setModal(note.is_locked ? 'unlock' : 'lock');
                            }}
                            className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all"
                            title={note.is_locked ? 'Unlock Note' : 'Lock Note'}
                          >
                            {note.is_locked ? <Unlock className="w-4 h-4 text-amber-500/80" /> : <Lock className="w-4 h-4" />}
                          </button>
                        )}
                        {note.owner_id === user?.id && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedNote(note); setShareEmail(''); setModal('share'); }} className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all" title="Share">
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openEdit(note); }} className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all" title="Edit">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => handleDelete(note, e)} className="p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 mt-12 mb-8">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-30 active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5 text-zinc-100" />
                  </button>
                  <span className="text-xs font-bold text-zinc-600 tracking-widest uppercase">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-30 active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5 text-zinc-100" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>

            {/* View Modal */}
            {modal === 'view' && selectedNote && (
              <>
                <div className="flex items-start justify-between p-8 border-b border-zinc-800/50 shrink-0">
                  <div className="pr-8">
                    <h2 className="text-2xl font-bold text-zinc-100 mb-4 leading-tight">{selectedNote.title}</h2>
                    <div className="flex items-center gap-4">
                      {selectedNote.is_pinned && <span className="px-3 py-1 bg-zinc-100 text-zinc-950 rounded-lg text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider"><Pin className="w-3 h-3" /> Pinned</span>}
                      {selectedNote.label && <span className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-lg text-[10px] font-bold capitalize tracking-wider uppercase">{selectedNote.label}</span>}
                      <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider italic flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Updated {formatDate(selectedNote.updated_at).toUpperCase()}
                      </span>
                      <span className="text-zinc-700 text-[10px] font-bold uppercase tracking-wider italic">
                        Created {formatDate(selectedNote.created_at).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setModal(null)} className="p-3 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-10 overflow-y-auto whitespace-pre-wrap text-zinc-400 leading-relaxed text-base font-medium selection:bg-zinc-100 selection:text-zinc-950">
                  {selectedNote.content}
                </div>
                <div className="p-6 border-t border-zinc-800/50 bg-zinc-950/50 flex justify-end gap-4 shrink-0">
                  {selectedNote.owner_id === user?.id && (
                    <>
                      <button onClick={() => { setShareEmail(''); setModal('share'); }} className="px-6 py-3 text-sm font-bold border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-all text-zinc-400">Share</button>
                      <button onClick={() => openEdit(selectedNote)} className="px-8 py-3 text-sm font-bold bg-zinc-100 text-zinc-950 rounded-2xl hover:bg-zinc-200 transition-all shadow-lg active:scale-95">Edit Note</button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Create/Edit Modal */}
            {(modal === 'create' || modal === 'edit') && (
              <>
                <div className="flex items-center justify-between p-8 border-b border-zinc-800/50 shrink-0">
                  <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{modal === 'create' ? 'Capture Thought' : 'Edit Thought'}</h2>
                  <button onClick={() => setModal(null)} className="p-3 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-10 overflow-y-auto space-y-8">
                  <input
                    placeholder="The Big Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full text-3xl font-bold placeholder:text-zinc-800 border-0 focus:ring-0 p-0 bg-transparent text-zinc-100 outline-none tracking-tight"
                    autoFocus
                  />
                  <textarea
                    placeholder="Deep dive into your thoughts..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full h-64 resize-none placeholder:text-zinc-800 border-0 focus:ring-0 p-0 bg-transparent text-zinc-400 text-lg leading-relaxed outline-none font-medium custom-scrollbar"
                  />

                  <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-zinc-700" />
                      <select
                        value={form.label}
                        onChange={(e) => setForm({ ...form, label: e.target.value })}
                        className="text-xs font-bold uppercase tracking-widest bg-transparent border-0 text-zinc-500 focus:ring-0 cursor-pointer p-0 outline-none hover:text-zinc-300 transition-colors"
                      >
                        <option value="" className="bg-zinc-900">NO LABEL</option>
                        {LABELS.map(l => <option key={l} value={l} className="bg-zinc-900 capitalize">{l.toUpperCase()}</option>)}
                      </select>
                    </div>

                    <button
                      onClick={() => setForm({ ...form, is_pinned: !form.is_pinned })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${form.is_pinned ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400'}`}
                    >
                      <Pin className="w-4 h-4" fill={form.is_pinned ? 'currentColor' : 'none'} /> {form.is_pinned ? 'Pinned' : 'Pin to top'}
                    </button>
                  </div>
                </div>
                <div className="p-6 border-t border-zinc-800/50 bg-zinc-950/50 flex justify-end gap-4 shrink-0">
                  <button onClick={() => setModal(null)} className="px-6 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-400 transition-colors">Discard</button>
                  <button disabled={saving} onClick={handleSave} className="px-10 py-4 text-sm font-bold bg-zinc-100 text-zinc-950 rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-xl active:scale-95">
                    {saving ? 'Synchronizing...' : 'Save Thought'}
                  </button>
                </div>
              </>
            )}

            {/* Share Modal */}
            {modal === 'share' && selectedNote && (
              <>
                <div className="flex items-center justify-between p-8 border-b border-zinc-800/50 shrink-0">
                  <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Collaborate</h2>
                  <button onClick={() => setModal(null)} className="p-3 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-10">
                  <p className="text-sm text-zinc-500 mb-8 leading-relaxed font-medium">
                    Grant access to &ldquo;<span className="font-bold text-zinc-200">{selectedNote.title}</span>&rdquo; to another registered storyteller.
                  </p>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 ml-1">Recipient Identifier</label>
                    <input
                      type="email"
                      placeholder="colleague@noteflow.ai"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm focus-ring placeholder:text-zinc-800 transition-all"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-zinc-800/50 bg-zinc-950/50 flex justify-end gap-4 shrink-0">
                  <button onClick={() => setModal(null)} className="px-6 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-400">Cancel</button>
                  <button disabled={saving} onClick={handleShare} className="px-10 py-4 text-sm font-bold bg-zinc-100 text-zinc-950 rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center gap-3 active:scale-95 shadow-xl">
                    {saving ? 'Connecting...' : <><Share2 className="w-4 h-4 stroke-[3px]" /> Grant Access</>}
                  </button>
                </div>
              </>
            )}
            {/* Delete Confirmation Modal */}
            {modal === 'delete' && selectedNote && (
              <>
                <div className="flex items-center justify-between p-8 border-b border-zinc-800/50 shrink-0">
                  <h2 className="text-xl font-bold text-red-500 tracking-tight">Delete Thought?</h2>
                  <button onClick={() => setModal(null)} className="p-3 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-10">
                  <p className="text-sm text-zinc-400 mb-2 leading-relaxed font-medium">
                    Are you sure you want to permanently delete &ldquo;<span className="font-bold text-zinc-200">{selectedNote.title}</span>&rdquo;?
                  </p>
                  <p className="text-xs text-zinc-600 font-medium">This action cannot be undone.</p>
                </div>
                <div className="p-6 border-t border-zinc-800/50 bg-zinc-950/50 flex justify-end gap-4 shrink-0">
                  <button onClick={() => setModal(null)} className="px-6 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-400">Cancel</button>
                  <button onClick={confirmDelete} className="px-10 py-4 text-sm font-bold bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all shadow-xl active:scale-95">
                    Delete Permanently
                  </button>
                </div>
              </>
            )}

            {/* Lock Modal */}
            {modal === 'lock' && selectedNote && (
              <>
                <div className="flex items-center justify-between p-8 border-b border-zinc-800/50 shrink-0">
                  <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Lock Note</h2>
                  <button onClick={() => setModal(null)} className="p-3 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-10">
                  <p className="text-sm text-zinc-500 mb-8 leading-relaxed font-medium">
                    Set a password to protect &ldquo;<span className="font-bold text-zinc-200">{selectedNote.title}</span>&rdquo;.
                    Anyone wanting to view this note will need this password.
                  </p>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 ml-1">Note Password</label>
                    <div className="relative">
                      <input
                        type={showNotePassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={notePassword}
                        onChange={(e) => setNotePassword(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm focus-ring placeholder:text-zinc-800 transition-all"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowNotePassword(!showNotePassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        {showNotePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-zinc-800/50 bg-zinc-950/50 flex justify-end gap-4 shrink-0">
                  <button onClick={() => setModal(null)} className="px-6 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-400">Cancel</button>
                  <button onClick={handleLock} className="px-10 py-4 text-sm font-bold bg-zinc-100 text-zinc-950 rounded-2xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Lock Note
                  </button>
                </div>
              </>
            )}

            {/* Unlock Modal (Permanent) */}
            {modal === 'unlock' && selectedNote && (
              <>
                <div className="flex items-center justify-between p-8 border-b border-zinc-800/50 shrink-0">
                  <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Remove Lock</h2>
                  <button onClick={() => setModal(null)} className="p-3 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-10">
                  <p className="text-sm text-zinc-500 mb-8 leading-relaxed font-medium">
                    Enter the password to permanently remove protection from &ldquo;<span className="font-bold text-zinc-200">{selectedNote.title}</span>&rdquo;.
                  </p>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 ml-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showNotePassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={notePassword}
                        onChange={(e) => setNotePassword(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm focus-ring placeholder:text-zinc-800 transition-all"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowNotePassword(!showNotePassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        {showNotePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-zinc-800/50 bg-zinc-950/50 flex justify-end gap-4 shrink-0">
                  <button onClick={() => setModal(null)} className="px-6 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-400">Cancel</button>
                  <button onClick={handleUnlock} className="px-10 py-4 text-sm font-bold bg-zinc-100 text-zinc-950 rounded-2xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                    <Unlock className="w-4 h-4" /> Remove Protection
                  </button>
                </div>
              </>
            )}

            {/* Verify Modal (To View) */}
            {modal === 'verify' && selectedNote && (
              <>
                <div className="flex items-center justify-between p-8 border-b border-zinc-800/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Protected Note</h2>
                  </div>
                  <button onClick={() => setModal(null)} className="p-3 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-10">
                  <p className="text-sm text-zinc-500 mb-8 leading-relaxed font-medium">
                    &ldquo;<span className="font-bold text-zinc-200">{selectedNote.title}</span>&rdquo; is locked.
                    Please enter the password to view its contents.
                  </p>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 ml-1">Enter Password</label>
                    <div className="relative">
                      <input
                        type={showNotePassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={notePassword}
                        onChange={(e) => setNotePassword(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm focus-ring placeholder:text-zinc-800 transition-all"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNotePassword(!showNotePassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        {showNotePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-zinc-800/50 bg-zinc-950/50 flex justify-end gap-4 shrink-0">
                  <button onClick={() => setModal(null)} className="px-6 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-400">Back</button>
                  <button onClick={handleVerify} className="px-10 py-4 text-sm font-bold bg-zinc-100 text-zinc-950 rounded-2xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Reveal Note
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
