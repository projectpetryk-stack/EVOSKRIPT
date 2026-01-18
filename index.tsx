
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
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
  AlertCircle,
  Timer as TimerIcon, 
  Play, 
  Pause, 
  RotateCcw
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
enum Category {
  CLIENT_TYPE = 'Тип клієнта',
  PRODUCT = 'Продукт',
  STAGE = 'Етап продажу'
}

interface ScriptStep {
  id: string;
  label: string;
  content: string;
  hint?: string;
}

interface Script {
  id: string;
  title: string;
  category: Category;
  tags: string[];
  steps: ScriptStep[];
}

interface Note {
  id: string;
  timestamp: number;
  content: string;
  isKeyPoint: boolean;
}

interface UserSettings {
  fontSize: number;
  highContrast: boolean;
}

// --- CONSTANTS ---
const INITIAL_SCRIPTS: Script[] = [
  {
    id: '1',
    title: 'Холодний дзвінок (B2B)',
    category: Category.STAGE,
    tags: ['Холодний', 'B2B', 'Перший контакт'],
    steps: [
      {
        id: '1-1',
        label: 'Привітання',
        content: 'Добрий день! Мене звати [Ім’я], компанія SalesFlow. Я телефоную, щоб запропонувати рішення для вашої команди продажів...',
        hint: 'Говоріть впевнено, не робіть довгих пауз.'
      },
      {
        id: '1-2',
        label: 'Кваліфікація',
        content: 'Скажіть, будь ласка, скільки менеджерів зараз працює у вашому відділі? Як ви зараз контролюєте виконання скриптів?',
        hint: 'Слухайте уважно, не перебивайте.'
      },
      {
        id: '1-3',
        label: 'Призначення зустрічі',
        content: 'Пропоную провести коротку 15-хвилинну демонстрацію у вівторок або середу. Який час вам зручніший?',
        hint: 'Пропонуйте два варіанти на вибір (техніка вибору без вибору).'
      }
    ]
  },
  {
    id: '2',
    title: 'Презентація продукту Pro',
    category: Category.PRODUCT,
    tags: ['Презентація', 'Pro', 'Демо'],
    steps: [
      {
        id: '2-1',
        label: 'Проблема',
        content: 'Більшість компаній втрачають до 30% лідів через те, що менеджери забувають ключові аргументи під час розмови...',
        hint: 'Акцентуйте на болю клієнта.'
      },
      {
        id: '2-2',
        label: 'Рішення',
        content: 'Наш інструмент дозволяє миттєво адаптуватися до реакції клієнта. Ви бачите підказки прямо перед очима.',
        hint: 'Покажіть вигоду, а не лише функцію.'
      }
    ]
  }
];

// --- AI SERVICE ---
const getAIHint = async (currentContext: string, lastUserResponse: string) => {
  try {
    // В браузерному середовищі process.env може бути недоступний без поліфілів,
    // тому використовуємо безпечний доступ
    const apiKey = (window as any).process?.env?.API_KEY || "";
    if (!apiKey) return "Помилка: API ключ не знайдено.";

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Ти - досвідчений коуч з продажів. 
      Поточний скрипт: "${currentContext}". 
      Остання фраза клієнта: "${lastUserResponse}". 
      Дай одну коротку, дієву пораду (до 15 слів), що сказати або як змінити тактику прямо зараз.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    });
    return response.text?.trim() || "Продовжуйте за скриптом.";
  } catch (error) {
    console.error("AI Hint Error:", error);
    return "Спробуйте перевести розмову на наступний етап.";
  }
};

// --- COMPONENTS ---

const Timer: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 font-mono text-xl font-bold text-blue-600">
        <TimerIcon size={20} />
        {formatTime(seconds)}
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button 
          onClick={() => {setSeconds(0); setIsActive(false);}}
          className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [scripts] = useState<Script[]>(INITIAL_SCRIPTS);
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

  const isApiKeyMissing = !(window as any).process?.env?.API_KEY;

  const filteredScripts = useMemo(() => {
    if (!searchQuery) return scripts;
    const q = searchQuery.toLowerCase();
    return scripts.filter(s => s.title.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q)));
  }, [scripts, searchQuery]);

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

  const handleExportNotes = () => {
    const content = notes
      .map(n => `[${new Date(n.timestamp).toLocaleTimeString()}] ${n.isKeyPoint ? '[КЛЮЧОВЕ] ' : ''}${n.content}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_notes.txt`;
    link.click();
  };

  const requestAIHint = async () => {
    if (!activeScript) return;
    setIsAiLoading(true);
    const step = activeScript.steps[activeStepIndex];
    const hint = await getAIHint(step.content, currentNote || "Клієнт слухає...");
    setAiHint(hint);
    setIsAiLoading(false);
  };

  return (
    <div className={`h-screen flex flex-col ${settings.highContrast ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`h-16 flex items-center justify-between px-6 border-b shrink-0 z-10 ${settings.highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
          <h1 className="text-xl font-bold tracking-tight hidden md:block">SalesFlow Pro</h1>
        </div>
        <div className="flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Пошук скриптів..."
            className={`w-full pl-10 pr-4 py-2 rounded-full border outline-none ${settings.highContrast ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-transparent'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <Timer />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setSettings(s => ({...s, highContrast: !s.highContrast}))}>
            {settings.highContrast ? <Sun size={24} /> : <Moon size={24} className="text-gray-500" />}
          </button>
        </div>
      </header>

      {isApiKeyMissing && (
        <div className="bg-red-50 border-b border-red-100 px-6 py-1.5 flex items-center justify-center gap-2 text-red-600 text-xs font-medium">
          <AlertCircle size={14} />
          <span>API ключ не налаштовано. AI-підказки недоступні.</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <aside className={`w-80 border-r flex flex-col shrink-0 ${settings.highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Star size={18} className="text-amber-500" /> Скрипти
            </h2>
            <div className="space-y-1">
              {filteredScripts.map(s => (
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
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {!activeScript ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
              <Zap size={64} className="mb-4 opacity-20" />
              <p className="text-xl font-medium">Оберіть скрипт для початку</p>
            </div>
          ) : (
            <>
              <div className={`p-6 border-b flex items-center justify-between ${settings.highContrast ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <h2 className="text-2xl font-bold">{activeScript.title}</h2>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setSettings(s => ({ ...s, fontSize: Math.max(12, s.fontSize - 2) }))} className="p-1.5 hover:bg-white rounded"><TypeIcon size={16} /></button>
                    <span className="px-2 font-mono text-sm font-bold">{settings.fontSize}px</span>
                    <button onClick={() => setSettings(s => ({ ...s, fontSize: Math.min(32, s.fontSize + 2) }))} className="p-1.5 hover:bg-white rounded"><TypeIcon size={16} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-3xl mx-auto" style={{ fontSize: `${settings.fontSize}px` }}>
                  <div className={`p-8 rounded-2xl shadow-sm border ${settings.highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                    {activeScript.steps[activeStepIndex].content}
                  </div>
                  {aiHint && (
                    <div className="mt-6 p-4 border-l-4 bg-blue-50 border-blue-400 text-blue-800 text-sm rounded-r-lg">
                      <Zap className="inline mr-2 fill-blue-500" size={18} />
                      <strong>AI Порада:</strong> {aiHint}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <button disabled={activeStepIndex === 0} onClick={() => setActiveStepIndex(i => i - 1)} className="px-6 py-3 rounded-xl border-2 disabled:opacity-30">Назад</button>
                  <button disabled={activeStepIndex === activeScript.steps.length - 1} onClick={() => setActiveStepIndex(i => i + 1)} className="px-6 py-3 rounded-xl bg-gray-800 text-white disabled:opacity-30">Далі</button>
                </div>
                <button onClick={requestAIHint} disabled={isAiLoading || isApiKeyMissing} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-2 disabled:bg-gray-400">
                  <Zap size={18} className={isAiLoading ? 'animate-pulse' : ''} />
                  {isAiLoading ? 'Аналіз...' : 'Адаптувати (AI)'}
                </button>
              </div>
            </>
          )}
        </main>

        <aside className={`w-96 border-l flex flex-col shrink-0 ${settings.highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2"><MessageSquare size={18} /> Нотатки</h2>
            <button onClick={handleExportNotes} className="text-xs font-bold text-gray-500 flex items-center gap-1"><Download size={14} /> Експорт</button>
          </div>
          <div className="p-4 border-b space-y-3">
            <textarea placeholder="Введіть нотатку..." className="w-full p-3 rounded-xl border resize-none h-24 text-sm bg-gray-50" value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} />
            <button onClick={() => handleAddNote(false)} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm">Зберегти</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {notes.map(note => (
              <div key={note.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm">{note.content}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
