
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Settings as SettingsIcon, 
  Plus, 
  ChevronRight, 
  MessageSquare, 
  Zap, 
  FileText, 
  Download, 
  Star,
  Type as TypeIcon,
  Sun,
  Moon,
  Trash2,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { Script, Category, Note, UserSettings, ScriptStep } from './types';
import { INITIAL_SCRIPTS } from './constants';
import { Timer } from './components/Timer';
import { getAIHint } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [scripts, setScripts] = useState<Script[]>(INITIAL_SCRIPTS);
  const [activeScript, setActiveScript] = useState<Script | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    fontSize: 18,
    highContrast: false
  });

  const isApiKeyMissing = !process.env.API_KEY;

  // Filtering
  const filteredScripts = useMemo(() => {
    if (!searchQuery) return scripts;
    const lowerQuery = searchQuery.toLowerCase();
    return scripts.filter(s => 
      s.title.toLowerCase().includes(lowerQuery) || 
      s.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }, [scripts, searchQuery]);

  const quickAccessScripts = useMemo(() => scripts.slice(0, 4), [scripts]);

  // Actions
  const handleSelectScript = (script: Script) => {
    setActiveScript(script);
    setActiveStepIndex(0);
    setAiHint(null);
  };

  const handleAddNote = (isKeyPoint: boolean = false) => {
    if (!currentNote.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      content: currentNote,
      isKeyPoint
    };
    setNotes([newNote, ...notes]);
    setCurrentNote('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleExportNotes = () => {
    const content = notes
      .map(n => `[${new Date(n.timestamp).toLocaleTimeString()}] ${n.isKeyPoint ? '[КЛЮЧОВЕ] ' : ''}${n.content}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_notes_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const requestAIHint = async () => {
    if (!activeScript) return;
    if (isApiKeyMissing) {
      setAiHint("Помилка: API ключ не знайдено. Будь ласка, налаштуйте оточення.");
      return;
    }
    setIsAiLoading(true);
    const step = activeScript.steps[activeStepIndex];
    const hint = await getAIHint(step.content, currentNote || "Клієнт слухає...");
    setAiHint(hint);
    setIsAiLoading(false);
  };

  return (
    <div className={`h-screen flex flex-col ${settings.highContrast ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Header */}
      <header className={`h-16 flex items-center justify-between px-6 border-b shrink-0 z-10 ${settings.highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden md:block">SalesFlow Pro</h1>
        </div>

        <div className="flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Пошук скриптів за назвою або тегами..."
            className={`w-full pl-10 pr-4 py-2 rounded-full border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${settings.highContrast ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-transparent text-gray-900'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <Timer />
          <div className="flex border rounded-lg overflow-hidden h-10">
            <button 
              onClick={() => setSettings({ ...settings, highContrast: false })}
              className={`px-3 flex items-center justify-center ${!settings.highContrast ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              <Sun size={18} />
            </button>
            <button 
              onClick={() => setSettings({ ...settings, highContrast: true })}
              className={`px-3 flex items-center justify-center ${settings.highContrast ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              <Moon size={18} />
            </button>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <SettingsIcon size={24} className="text-gray-500" />
          </button>
        </div>
      </header>

      {/* API Key Warning Bar */}
      {isApiKeyMissing && (
        <div className="bg-red-50 border-b border-red-100 px-6 py-1.5 flex items-center justify-center gap-2 text-red-600 text-xs font-medium animate-in slide-in-from-top duration-500">
          <AlertCircle size={14} />
          <span>API ключ не налаштовано. AI-підказки будуть недоступні. Перегляньте README.md для інструкцій.</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Scripts Selection */}
        <aside className={`w-80 border-r flex flex-col shrink-0 ${settings.highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Star size={18} className="text-amber-500" /> Швидкий доступ
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickAccessScripts.map(s => (
                <button 
                  key={s.id}
                  onClick={() => handleSelectScript(s)}
                  className={`p-3 text-xs font-medium rounded-lg text-left transition-all border-2 ${activeScript?.id === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className="line-clamp-2">{s.title}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <div className="space-y-6">
              {Object.values(Category).map(cat => {
                const catScripts = filteredScripts.filter(s => s.category === cat);
                if (catScripts.length === 0) return null;
                return (
                  <div key={cat}>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{cat}</h3>
                    <div className="space-y-1">
                      {catScripts.map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleSelectScript(s)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeScript?.id === s.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                          <span className="text-sm font-medium truncate">{s.title}</span>
                          <ChevronRight size={14} className={activeScript?.id === s.id ? 'text-blue-200' : 'text-gray-400'} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="m-4 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2 transition-all">
            <Plus size={20} />
            <span className="font-medium">Новий скрипт</span>
          </button>
        </aside>

        {/* Center: Script Viewer */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {!activeScript ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
              <Zap size={64} className="mb-4 opacity-20" />
              <p className="text-xl font-medium">Оберіть скрипт для початку роботи</p>
              <p className="text-sm max-w-xs mt-2">Використовуйте панель швидкого доступу або пошук ліворуч.</p>
            </div>
          ) : (
            <>
              <div className={`p-6 border-b flex items-center justify-between ${settings.highContrast ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div>
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">
                    <FileText size={14} /> {activeScript.category}
                  </div>
                  <h2 className="text-2xl font-bold">{activeScript.title}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button 
                      onClick={() => setSettings(s => ({ ...s, fontSize: Math.max(12, s.fontSize - 2) }))}
                      className="p-1.5 hover:bg-white rounded shadow-sm transition-all"
                    >
                      <TypeIcon size={16} /> <span className="text-[10px]">-</span>
                    </button>
                    <span className="px-2 font-mono text-sm font-bold">{settings.fontSize}px</span>
                    <button 
                      onClick={() => setSettings(s => ({ ...s, fontSize: Math.min(32, s.fontSize + 2) }))}
                      className="p-1.5 hover:bg-white rounded shadow-sm transition-all"
                    >
                      <TypeIcon size={16} /> <span className="text-[10px]">+</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center bg-gray-100 p-2 gap-1 overflow-x-auto shrink-0 no-scrollbar border-b">
                {activeScript.steps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => {setActiveStepIndex(idx); setAiHint(null);}}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeStepIndex === idx ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {idx + 1}. {step.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div 
                  className="max-w-3xl mx-auto leading-relaxed whitespace-pre-wrap"
                  style={{ fontSize: `${settings.fontSize}px` }}
                >
                  <div className={`p-8 rounded-2xl shadow-sm border ${settings.highContrast ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800'}`}>
                    {activeScript.steps[activeStepIndex].content}
                  </div>
                  
                  {activeScript.steps[activeStepIndex].hint && (
                    <div className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800 text-sm flex items-start gap-3 rounded-r-lg">
                      <Lightbulb className="shrink-0 mt-0.5" size={18} />
                      <div>
                        <span className="font-bold block mb-1">Методична підказка:</span>
                        {activeScript.steps[activeStepIndex].hint}
                      </div>
                    </div>
                  )}

                  {aiHint && (
                    <div className={`mt-6 p-4 border-l-4 text-sm flex items-start gap-3 rounded-r-lg animate-in fade-in slide-in-from-left-4 duration-300 ${aiHint.startsWith('Помилка') ? 'bg-red-50 border-red-400 text-red-800' : 'bg-blue-50 border-blue-400 text-blue-800'}`}>
                      {aiHint.startsWith('Помилка') ? <AlertCircle className="shrink-0 mt-0.5" size={18} /> : <Zap className="shrink-0 mt-0.5 fill-blue-500" size={18} />}
                      <div>
                        <span className="font-bold block mb-1">{aiHint.startsWith('Помилка') ? 'Помилка Конфігурації:' : 'AI-Адаптація:'}</span>
                        {aiHint}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button 
                    disabled={activeStepIndex === 0}
                    onClick={() => {setActiveStepIndex(i => i - 1); setAiHint(null);}}
                    className="px-6 py-3 rounded-xl font-bold border-2 border-gray-300 text-gray-600 disabled:opacity-30 hover:bg-gray-100 transition-all"
                  >
                    Назад
                  </button>
                  <button 
                    disabled={activeStepIndex === activeScript.steps.length - 1}
                    onClick={() => {setActiveStepIndex(i => i + 1); setAiHint(null);}}
                    className="px-6 py-3 rounded-xl font-bold bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700 transition-all flex items-center gap-2"
                  >
                    Наступний крок <ChevronRight size={18} />
                  </button>
                </div>

                <button 
                  onClick={requestAIHint}
                  disabled={isAiLoading}
                  className={`px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 shadow-lg ${isApiKeyMissing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                >
                  <Zap size={18} className={isAiLoading ? 'animate-pulse' : ''} />
                  {isAiLoading ? 'Аналізуємо...' : 'Адаптувати розмову (AI)'}
                </button>
              </div>
            </>
          )}
        </main>

        {/* Right Sidebar: Notes & Key Points */}
        <aside className={`w-96 border-l flex flex-col shrink-0 ${settings.highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2 text-gray-700">
              <MessageSquare size={18} className="text-blue-500" /> Нотатки розмови
            </h2>
            <button 
              onClick={handleExportNotes}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 flex items-center gap-1 text-xs font-bold"
            >
              <Download size={14} /> Експорт
            </button>
          </div>

          <div className="p-4 border-b space-y-3">
            <textarea 
              placeholder="Введіть нотатку або заперечення клієнта..."
              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24 text-sm ${settings.highContrast ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50'}`}
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleAddNote(false);
              }}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => handleAddNote(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all"
              >
                Зберегти
              </button>
              <button 
                onClick={() => handleAddNote(true)}
                className="flex-1 py-2 bg-amber-100 text-amber-700 rounded-lg font-bold text-sm hover:bg-amber-200 transition-all flex items-center justify-center gap-1"
              >
                <Zap size={14} /> Ключове
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center">Ctrl + Enter для швидкого збереження</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
            {notes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm opacity-50">
                <MessageSquare size={32} className="mb-2" />
                <p>Немає нотаток</p>
              </div>
            ) : (
              notes.map((note) => (
                <div 
                  key={note.id} 
                  className={`p-4 rounded-xl border-l-4 group relative transition-all shadow-sm ${note.isKeyPoint ? 'bg-amber-50 border-amber-400' : 'bg-gray-50 border-gray-300'}`}
                >
                  <button 
                    onClick={() => handleDeleteNote(note.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono font-bold text-gray-400">
                      {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {note.isKeyPoint && (
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded uppercase tracking-tighter">Ключове</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
      
      {/* Footer / Status bar */}
      <footer className="h-8 bg-gray-800 text-gray-400 flex items-center justify-between px-6 text-[10px] font-medium shrink-0">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Zap size={12} className={isApiKeyMissing ? 'text-gray-500' : 'text-green-500'} /> {isApiKeyMissing ? 'AI Вимкнено' : 'AI Активний'}</span>
          <span className="flex items-center gap-1"><Sun size={12} /> Світла тема</span>
        </div>
        <div className="flex gap-4">
          <span>Скриптів у базі: {scripts.length}</span>
          <span>© 2024 SalesFlow Enterprise</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
