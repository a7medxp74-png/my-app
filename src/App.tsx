import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  CircleCheck,
  CircleDashed,
  Coins,
  Flame,
  History,
  ImagePlus,
  LayoutDashboard,
  LockKeyhole,
  Minus,
  Moon,
  Play,
  RotateCcw,
  Settings2,
  ShieldAlert,
  Sparkles,
  Sun,
  Target,
  Timer,
  Trash2,
  Trophy,
  Upload,
  X,
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const STORAGE_KEY = 'commit-local-state-v2';
const THEME_STORAGE_KEY = 'commit-theme';
const LANGUAGE_STORAGE_KEY = 'commit-language';

type TaskStatus = 'active' | 'running' | 'proof' | 'completed' | 'failed';
type TransactionType = 'earned' | 'lost' | 'starting';
type Language = 'ar' | 'en';
type View = 'dashboard' | 'create' | 'running' | 'proof' | 'completed' | 'failed' | 'history' | 'settings';

type User = {
  points: number;
  startingPoints: number;
};

type Task = {
  id: string;
  title: string;
  durationMinutes: number;
  riskPoints: number;
  status: TaskStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  proofImageDataUrl?: string;
  verificationStatus?: 'pending' | 'passed';
};

type PointTransaction = {
  id: string;
  amount: number;
  type: TransactionType;
  label: string;
  createdAt: string;
  taskId?: string;
};

type LocalState = {
  user: User;
  tasks: Task[];
  transactions: PointTransaction[];
};

const translations = {
  ar: {
    brandName: 'التزام',
    brandNote: 'مساحتك للتركيز',
    sidebarSection: 'مساحتي',
    navToday: 'نظرة اليوم',
    navCompleted: 'المكتملة',
    navFailed: 'المتعثرة',
    navHistory: 'سجل النقاط',
    navSettings: 'الإعدادات',
    balance: 'رصيد الالتزام',
    currentBalance: 'رصيدك الحالي',
    resetData: 'إعادة ضبط بياناتي',
    addTask: 'إضافة مهمة',
    quickNav: 'التنقل السريع',
    mobileToday: 'اليوم',
    mobileCompleted: 'مكتملة',
    mobileNew: 'مهمة جديدة',
    mobileHistory: 'النقاط',
    mobileSettings: 'الإعدادات',
    welcome: 'أهلاً بك. ماذا ستلتزم به اليوم؟',
    todayPromise: 'وعد اليوم',
    promiseQuestion: 'المهمة التي اخترت أن تحمي وقتك لها',
    startNow: 'ابدأ الآن',
    returnToSession: 'العودة إلى الجلسة',
    attachProof: 'إرفاق الإثبات',
    noPromiseTitle: 'اجعل نيتك مرئية.',
    noPromiseDescription: 'مهمة واحدة واضحة تكفي لبدء يوم مختلف. اكتب وعدك، حدّد وقته، ودع الالتزام يتكلم.',
    writeNewPromise: 'اكتب وعداً جديداً',
    todayTasks: 'مهام اليوم',
    waitingForYou: 'بانتظارك',
    atStake: 'على المحك',
    points: 'نقاط',
    rhythm: 'إيقاعك حتى الآن',
    steady: 'أنت تتحرك بثبات',
    firstStep: 'أول خطوة هي الأهم',
    recordedTasks: 'من مجموع مهامك المسجلة',
    done: 'منجزة',
    failed: 'فاشلة',
    quietSpace: 'المساحة هادئة الآن',
    noPendingPromises: 'لا توجد وعود معلقة. أضف مهمة صغيرة تحب أن تراها منجزة.',
    addSmallTask: 'إضافة مهمة',
    start: 'ابدأ',
    resume: 'تابع',
    noProof: 'أرفق الإثبات',
    stumbledAt: 'تعثر في',
    backToToday: 'العودة إلى اليوم',
    createTitle: 'ما وعدك لهذا اليوم؟',
    createDescription: 'اكتب شيئاً محدداً يمكن إنجازه في جلسة واحدة. الوضوح يجعل البدء أخف.',
    task: 'المهمة',
    example: 'مثال: قراءة 10 صفحات',
    taskPlaceholder: 'ما الذي ستنجزه؟',
    focusTime: 'وقت التركيز',
    durationHint: 'يمكنك استخدام الدقائق أو الساعات',
    timeUnit: 'وحدة الوقت',
    minute: 'دقيقة',
    hour: 'ساعة',
    commitmentPoints: 'نقاط الالتزام',
    riskHint: 'تُخصم إذا لم تكتمل المهمة',
    lightPromise: 'وعد خفيف',
    balancedSession: 'جلسة متوازنة',
    deepFocus: 'تركيز عميق',
    bigChallenge: 'تحدٍ كبير',
    riskNote: 'إذا تراجعت، تُخصم هذه النقاط. ليس للعقاب؛ فقط لتشعر أن الوعد حقيقي.',
    lockPromise: 'تثبيت الوعد',
    cancel: 'إلغاء',
    leaveTimerRunning: 'اترك المؤقت يعمل',
    focusSession: 'جلسة تركيز جارية',
    breathe: 'خذ نفساً. لا تحتاج أن تنجز كل شيء الآن، فقط ابقَ مع هذه الجلسة.',
    finishSession: 'أنهِ الجلسة الآن',
    breakPromise: 'تراجع عن الوعد',
    showUs: 'أرِنا ما أنجزت',
    proofDescription: 'أرفق صورة سريعة كإشارة لنفسك أنك أوفيت بالوعد.',
    proofAlt: 'إثبات المهمة',
    chooseImage: 'اضغط لاختيار صورة',
    imageHint: 'من ملاحظاتك أو شاشة ما عملت عليه',
    demoReview: 'مراجعة تجريبية: يمرّ الإثبات فوراً بعد إرفاق صورة.',
    backToTimer: 'عودة للمؤقت',
    confirmCompletion: 'تأكيد الإنجاز',
    completedTitle: 'المهام المكتملة',
    completedSubtitle: 'كل جلسة أوفيت بوعدها لنفسك.',
    failedTitle: 'المهام المتعثرة',
    failedSubtitle: 'لا بأس. راجع ما حدث وابدأ بوعد أصغر.',
    noCompleted: 'لم توثّق إنجازاً بعد',
    noCompletedDescription: 'ابدأ بمهمة قصيرة، ثم أرفق إثباتك لتحتفل بإنجازك الأول.',
    noFailed: 'لا توجد تعثرات',
    noFailedDescription: 'هذا خبر جيد. حافظ على وعودك الصغيرة.',
    pointsHistory: 'سجل النقاط',
    historyDescription: 'كل نقطة هنا تذكير صغير بأنك تفعل ما قلت إنك ستفعله.',
    recentActivity: 'الحركة الأخيرة',
    operations: 'عمليات',
    sinceBeginning: 'منذ البداية',
    availablePoints: 'نقطة متاحة الآن. المهمة المكتملة تحمي رصيدك، والتراجع يخصم قيمة الوعد.',
    noHistory: 'لا يوجد سجل بعد',
    noHistoryDescription: 'ابدأ بأول وعد ليبدأ سجل نقاطك.',
    settingsTitle: 'الإعدادات',
    settingsDescription: 'خصص Commit بالطريقة التي تناسبك.',
    languageTitle: 'اللغة',
    languageDescription: 'اختر اللغة التي تفضل استخدامها في التطبيق.',
    arabic: 'العربية',
    english: 'English',
    appearanceTitle: 'المظهر',
    appearanceDescription: 'اختر الطريقة التي تريح عينيك أثناء الدراسة.',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع العادي',
    darkModeDescription: 'ألوان داكنة مناسبة لجلسات المساء.',
    lightModeDescription: 'ألوان فاتحة وواضحة لجلسات النهار.',
    savedLocally: 'تُحفظ اختياراتك على هذا الجهاز.',
    resetTitle: 'إعادة ضبط المساحة؟',
    resetDescription: 'سيتم حذف تقدمك المحلي الحالي وإعادة بيانات العرض التجريبية. لا يمكن التراجع عن هذه الخطوة.',
    confirmReset: 'نعم، أعد الضبط',
  },
  en: {
    brandName: 'Commit',
    brandNote: 'Your focus space',
    sidebarSection: 'My space',
    navToday: 'Today',
    navCompleted: 'Completed',
    navFailed: 'Failed',
    navHistory: 'Points history',
    navSettings: 'Settings',
    balance: 'Commitment balance',
    currentBalance: 'Current balance',
    resetData: 'Reset my data',
    addTask: 'Add task',
    quickNav: 'Quick navigation',
    mobileToday: 'Today',
    mobileCompleted: 'Done',
    mobileNew: 'New task',
    mobileHistory: 'Points',
    mobileSettings: 'Settings',
    welcome: 'Welcome back. What will you commit to today?',
    todayPromise: "Today's promise",
    promiseQuestion: 'The task you chose to protect time for',
    startNow: 'Start now',
    returnToSession: 'Return to session',
    attachProof: 'Attach proof',
    noPromiseTitle: 'Make your intention visible.',
    noPromiseDescription: 'One clear task is enough to start a different day. Write your promise, set the time, and let commitment speak.',
    writeNewPromise: 'Write a new promise',
    todayTasks: "Today's tasks",
    waitingForYou: 'waiting for you',
    atStake: 'at stake',
    points: 'points',
    rhythm: 'Your rhythm so far',
    steady: 'You are moving steadily',
    firstStep: 'The first step matters most',
    recordedTasks: 'of your recorded tasks',
    done: 'Done',
    failed: 'Failed',
    quietSpace: 'A quiet space for now',
    noPendingPromises: 'No pending promises. Add a small task you would love to see completed.',
    addSmallTask: 'Add a task',
    start: 'Start',
    resume: 'Resume',
    noProof: 'Attach proof',
    stumbledAt: 'Stumbled on',
    backToToday: 'Back to today',
    createTitle: 'What is your promise for today?',
    createDescription: 'Write something specific you can finish in one session. Clarity makes starting lighter.',
    task: 'Task',
    example: 'Example: Read 10 pages',
    taskPlaceholder: 'What will you accomplish?',
    focusTime: 'Focus time',
    durationHint: 'Use minutes or hours',
    timeUnit: 'Time unit',
    minute: 'minute',
    hour: 'hour',
    commitmentPoints: 'Commitment points',
    riskHint: 'Deducted if the task is not completed',
    lightPromise: 'Light promise',
    balancedSession: 'Balanced session',
    deepFocus: 'Deep focus',
    bigChallenge: 'Big challenge',
    riskNote: 'If you step back, these points are deducted. Not as punishment; just to make the promise real.',
    lockPromise: 'Lock in promise',
    cancel: 'Cancel',
    leaveTimerRunning: 'Leave timer running',
    focusSession: 'Focus session in progress',
    breathe: 'Take a breath. You do not need to finish everything now, just stay with this session.',
    finishSession: 'Finish session now',
    breakPromise: 'Break the promise',
    showUs: 'Show us what you did',
    proofDescription: 'Attach a quick image as a signal to yourself that you kept the promise.',
    proofAlt: 'Task proof',
    chooseImage: 'Click to choose an image',
    imageHint: 'From your notes or the screen you worked on',
    demoReview: 'Demo review: proof passes immediately after an image is attached.',
    backToTimer: 'Back to timer',
    confirmCompletion: 'Confirm completion',
    completedTitle: 'Completed tasks',
    completedSubtitle: 'Every session you kept was a promise to yourself.',
    failedTitle: 'Failed tasks',
    failedSubtitle: 'It is okay. Review what happened and start with a smaller promise.',
    noCompleted: 'No completed proof yet',
    noCompletedDescription: 'Start a short task, then attach proof to celebrate your first win.',
    noFailed: 'No failed tasks',
    noFailedDescription: 'That is good news. Keep your small promises.',
    pointsHistory: 'Points history',
    historyDescription: 'Every point is a small reminder that you do what you said you would.',
    recentActivity: 'Recent activity',
    operations: 'operations',
    sinceBeginning: 'Since the beginning',
    availablePoints: 'points available now. Completed tasks protect your balance; stepping back costs the value of the promise.',
    noHistory: 'No history yet',
    noHistoryDescription: 'Start your first promise to begin your points history.',
    settingsTitle: 'Settings',
    settingsDescription: 'Customize Commit to fit the way you work.',
    languageTitle: 'Language',
    languageDescription: 'Choose the language you prefer for the app.',
    arabic: 'العربية',
    english: 'English',
    appearanceTitle: 'Appearance',
    appearanceDescription: 'Choose what feels easiest on your eyes while studying.',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    darkModeDescription: 'Darker colors for evening study sessions.',
    lightModeDescription: 'Bright, clear colors for daytime study.',
    savedLocally: 'Your choices are saved on this device.',
    resetTitle: 'Reset your space?',
    resetDescription: 'Your local progress will be deleted and the demo data restored. This cannot be undone.',
    confirmReset: 'Yes, reset it',
  },
} as const;

type TranslationKey = keyof typeof translations.ar;
const getCopy = (language: Language) => translations[language];

const formatDate = (date: string | Date, language: Language, withTime = false) =>
  new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    day: 'numeric',
    month: language === 'ar' ? 'short' : 'short',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(new Date(date));

const arabicDate = (date: string | Date, withTime = false) =>
  formatDate(date, 'ar', withTime);

const todayLabel = (language: Language) =>
  new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const seedData = (): LocalState => {
  const now = Date.now();
  const yesterday = new Date(now - 1000 * 60 * 60 * 20).toISOString();
  const twoDaysAgo = new Date(now - 1000 * 60 * 60 * 44).toISOString();
  const completedId = 'seed-completed';
  const failedId = 'seed-failed';
  return {
    user: { points: 22, startingPoints: 25 },
    tasks: [
      {
        id: 'seed-active',
        title: 'تلخيص الفصل الثاني من علم النفس',
        durationMinutes: 12,
        riskPoints: 5,
        status: 'active',
        createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: completedId,
        title: 'حلّ 15 مسألة في التفاضل',
        durationMinutes: 25,
        riskPoints: 8,
        status: 'completed',
        createdAt: twoDaysAgo,
        startedAt: twoDaysAgo,
        completedAt: yesterday,
        verificationStatus: 'passed',
      },
      {
        id: failedId,
        title: 'مراجعة بطاقات اللغة الإنجليزية',
        durationMinutes: 10,
        riskPoints: 3,
        status: 'failed',
        createdAt: twoDaysAgo,
        completedAt: yesterday,
      },
    ],
    transactions: [
      {
        id: 'seed-starting',
        amount: 25,
        type: 'starting',
        label: 'رصيد البداية',
        createdAt: twoDaysAgo,
      },
      {
        id: 'seed-loss',
        amount: -3,
        type: 'lost',
        label: 'عدم إتمام: مراجعة البطاقات',
        createdAt: yesterday,
        taskId: failedId,
      },
    ],
  };
};

const loadState = (): LocalState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LocalState;
  } catch {
    // A malformed local value should never block the app.
  }
  return seedData();
};

const formatDuration = (minutes: number, language: Language = 'ar') => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (language === 'en') return rest ? `${hours}h ${rest}m` : `${hours}h`;
    return rest ? `${hours} س و ${rest} د` : `${hours} س`;
  }
  return language === 'en' ? `${minutes}m` : `${minutes} د`;
};

const getDurationMinutes = (value: string, unit: 'minutes' | 'hours') => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;
  const rawMinutes = unit === 'hours' ? numericValue * 60 : numericValue;
  if (rawMinutes < 1 || rawMinutes > 180) return null;
  const minutes = Math.round(rawMinutes);
  return minutes >= 1 && minutes <= 180 ? minutes : null;
};

const getRiskPoints = (durationMinutes: number) => Math.ceil(durationMinutes / 5);

const formatClock = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remaining = safeSeconds % 60;
  return `${hours ? `${String(hours).padStart(2, '0')}:` : ''}${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
};

const getTaskSecondsLeft = (task: Task, at = Date.now()) =>
  task.startedAt
    ? Math.max(0, Math.round(task.durationMinutes * 60 - (at - new Date(task.startedAt).getTime()) / 1000))
    : 0;

function NavIcon({ view }: { view: View }) {
  if (view === 'dashboard') return <LayoutDashboard size={18} strokeWidth={1.8} />;
  if (view === 'completed') return <CircleCheck size={18} strokeWidth={1.8} />;
  if (view === 'failed') return <ShieldAlert size={18} strokeWidth={1.8} />;
  if (view === 'history') return <History size={18} strokeWidth={1.8} />;
  if (view === 'settings') return <Settings2 size={18} strokeWidth={1.8} />;
  return <Target size={18} strokeWidth={1.8} />;
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state" data-testid="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <strong data-testid="text-empty-title">{title}</strong>
      <p data-testid="text-empty-description">{description}</p>
      {action}
    </div>
  );
}

function CommitApp() {
  const [state, setState] = useState<LocalState>(() => loadState());
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'ar';
    } catch {
      return 'ar';
    }
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const [view, setView] = useState<View>('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('15');
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');
  const [proofImage, setProofImage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.style.direction = language === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Language preference is optional and should never block the app.
    }
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Theme preference is optional and should never block the app.
    }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');
  const copy = getCopy(language);

  const activeTasks = useMemo(
    () => state.tasks.filter((task) => task.status === 'active' || task.status === 'running' || task.status === 'proof'),
    [state.tasks],
  );
  const completedTasks = useMemo(() => state.tasks.filter((task) => task.status === 'completed'), [state.tasks]);
  const failedTasks = useMemo(() => state.tasks.filter((task) => task.status === 'failed'), [state.tasks]);
  const selectedTask = state.tasks.find((task) => task.id === selectedTaskId) ?? null;
  const runningTask = selectedTask?.status === 'running'
    ? selectedTask
    : state.tasks.find((task) => task.status === 'running') ?? null;
  const proofTask = selectedTask?.status === 'proof'
    ? selectedTask
    : state.tasks.find((task) => task.status === 'proof') ?? null;

  useEffect(() => {
    if (view !== 'running' || !runningTask) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [view, runningTask?.id]);

  const secondsLeft = runningTask ? getTaskSecondsLeft(runningTask, now) : 0;

  useEffect(() => {
    if (view === 'running' && runningTask?.startedAt && secondsLeft <= 0) {
      setState((previous) => ({
        ...previous,
        tasks: previous.tasks.map((task) => task.id === runningTask.id ? { ...task, status: 'proof', verificationStatus: 'pending' } : task),
      }));
      setSelectedTaskId(runningTask.id);
      setProofImage(runningTask.proofImageDataUrl ?? null);
      setView('proof');
    }
  }, [secondsLeft, view, runningTask?.id]);

  const navigate = (nextView: View) => {
    setView(nextView);
    if (nextView !== 'proof') setProofImage(null);
  };

  const startTask = (task: Task) => {
    const startedAt = new Date().toISOString();
    setState((previous) => ({
      ...previous,
      tasks: previous.tasks.map((item) => item.id === task.id ? { ...item, status: 'running', startedAt } : item),
    }));
    setSelectedTaskId(task.id);
    setNow(Date.now());
    setView('running');
  };

  const finishTimer = () => {
    if (!runningTask) return;
    const currentSecondsLeft = getTaskSecondsLeft(runningTask);
    if (!runningTask.startedAt || currentSecondsLeft > 0) {
      failTask(runningTask);
      return;
    }
    setState((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) => task.id === runningTask.id ? { ...task, status: 'proof', verificationStatus: 'pending' } : task),
    }));
    setSelectedTaskId(runningTask.id);
    setProofImage(runningTask.proofImageDataUrl ?? null);
    setView('proof');
  };

  const failTask = (task: Task) => {
    setState((previous) => ({
      user: { ...previous.user, points: Math.max(0, previous.user.points - task.riskPoints) },
      tasks: previous.tasks.map((item) => item.id === task.id ? { ...item, status: 'failed', completedAt: new Date().toISOString() } : item),
      transactions: [
        {
          id: makeId('lost'),
          amount: -task.riskPoints,
          type: 'lost',
          label: `عدم إتمام: ${task.title}`,
          createdAt: new Date().toISOString(),
          taskId: task.id,
        },
        ...previous.transactions,
      ],
    }));
    setSelectedTaskId(null);
    navigate('failed');
  };

  const handleProofFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProofImage(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const verifyProof = () => {
    if (!proofTask || !proofImage) return;
    const completedAt = new Date().toISOString();
    setState((previous) => ({
      user: previous.user,
      tasks: previous.tasks.map((task) => task.id === proofTask.id
        ? { ...task, status: 'completed', completedAt, proofImageDataUrl: proofImage, verificationStatus: 'passed' }
        : task),
      transactions: previous.transactions,
    }));
    setSelectedTaskId(null);
    setProofImage(null);
    setView('completed');
  };

  const returnToTimer = () => {
    if (!proofTask) return;
    setState((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) => task.id === proofTask.id ? { ...task, status: 'running' } : task),
    }));
    setSelectedTaskId(proofTask.id);
    setView('running');
  };

  const createTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const minutes = getDurationMinutes(duration, durationUnit);
    if (!cleanTitle || minutes === null) return;
    const task: Task = {
      id: makeId('task'),
      title: cleanTitle,
      durationMinutes: minutes,
      riskPoints: getRiskPoints(minutes),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setState((previous) => ({ ...previous, tasks: [task, ...previous.tasks] }));
    setTitle('');
    setDuration('15');
    setDurationUnit('minutes');
    setSelectedTaskId(task.id);
    setView('dashboard');
  };

  const resetData = () => {
    const fresh = seedData();
    setState(fresh);
    setSelectedTaskId(null);
    setResetOpen(false);
    setView('dashboard');
    setProofImage(null);
  };

  const progress = Math.min(100, Math.round((completedTasks.length / Math.max(1, state.tasks.length)) * 100));
  const currentTaskForHero = runningTask ?? proofTask ?? activeTasks.find((task) => task.status === 'active') ?? null;

  const navItems: { id: View; label: string }[] = [
    { id: 'dashboard', label: copy.navToday },
    { id: 'completed', label: copy.navCompleted },
    { id: 'failed', label: copy.navFailed },
    { id: 'history', label: copy.navHistory },
    { id: 'settings', label: copy.navSettings },
  ];

  return (
    <div className="commit-app" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="app-shell">
        <aside className="side-rail" aria-label={copy.quickNav}>
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true"><LockKeyhole size={20} strokeWidth={2.2} /></div>
            <div>
               <div className="brand-name">{copy.brandName}</div>
               <span className="brand-note">{copy.brandNote}</span>
            </div>
          </div>

           <div className="side-label">{copy.sidebarSection}</div>
          <nav className="nav-stack">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`nav-item ${view === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
                data-testid={`button-nav-${item.id}`}
              >
                <NavIcon view={item.id} />
                <span className="nav-item-text">{item.label}</span>
                {item.id === 'completed' && completedTasks.length > 0 ? <span className="nav-badge">{completedTasks.length}</span> : null}
              </button>
            ))}
          </nav>

          <div className="side-bottom">
            <div className="points-pocket" data-testid="card-sidebar-points">
               <div className="points-pocket-label">{copy.currentBalance}</div>
               <div className="points-pocket-value" data-testid="text-sidebar-points">{state.user.points}<small>{copy.points}</small></div>
            </div>
            <button type="button" className="clear-data" onClick={() => setResetOpen(true)} data-testid="button-reset-data">
               <RotateCcw size={13} /> {copy.resetData}
            </button>
          </div>
        </aside>

        <main className="main-column">
          <header className="topbar">
            <div>
               <div className="welcome-kicker" data-testid="text-today-date">{todayLabel(language)}</div>
               <div className="welcome-title" data-testid="text-welcome">{copy.welcome}</div>
            </div>
            <div className="topbar-meta">
               <div className="points-pill" data-testid="text-header-points"><Coins size={15} /><span>{copy.balance}</span><strong>{state.user.points}</strong></div>
              <button
                type="button"
                className="theme-toggle"
                onClick={toggleTheme}
                 aria-label={theme === 'dark' ? copy.lightMode : copy.darkMode}
                 title={theme === 'dark' ? copy.lightMode : copy.darkMode}
                 aria-pressed={theme === 'dark'}
                data-testid="button-theme-toggle"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button type="button" className="mobile-add" onClick={() => navigate('create')} aria-label="إضافة مهمة" data-testid="button-mobile-add"><Sparkles size={18} /></button>
            </div>
          </header>

          <div className="page-wrap">
            {view === 'dashboard' ? (
              <Dashboard
                currentTask={currentTaskForHero}
                activeTasks={activeTasks}
                completedTasks={completedTasks}
                failedTasks={failedTasks}
                progress={progress}
                onCreate={() => navigate('create')}
                onStart={startTask}
                onResume={(task) => {
                  setSelectedTaskId(task.id);
                  setProofImage(task.proofImageDataUrl ?? null);
                  setView(task.status === 'running' ? 'running' : 'proof');
                }}
                onFail={failTask}
              />
            ) : null}

            {view === 'create' ? (
              <CreateTask
                title={title}
                setTitle={setTitle}
                duration={duration}
                setDuration={setDuration}
                durationUnit={durationUnit}
                setDurationUnit={setDurationUnit}
                onSubmit={createTask}
                onBack={() => navigate('dashboard')}
              />
            ) : null}

            {view === 'running' ? (
              runningTask ? (
                <RunningTask
                  task={runningTask}
                  secondsLeft={secondsLeft}
                  onFinish={finishTimer}
                  onFail={() => failTask(runningTask)}
                  onBack={() => navigate('dashboard')}
                />
              ) : (
                <EmptyState icon={<Timer size={21} />} title="لا توجد جلسة جارية" description="ابدأ مهمة من نظرة اليوم لتظهر هنا." action={<button type="button" className="primary-button" onClick={() => navigate('dashboard')} data-testid="button-back-dashboard">العودة لنظرة اليوم</button>} />
              )
            ) : null}

            {view === 'proof' ? (
              proofTask ? (
                <ProofReview
                  task={proofTask}
                  image={proofImage}
                  onFile={handleProofFile}
                  onVerify={verifyProof}
                  onBack={returnToTimer}
                />
              ) : (
                <EmptyState icon={<ImagePlus size={21} />} title="لا يوجد إثبات بانتظار المراجعة" description="أكمل جلسة تركيز أولاً، ثم أرفق صورة بسيطة لما أنجزته." action={<button type="button" className="primary-button" onClick={() => navigate('dashboard')} data-testid="button-proof-empty-back">العودة</button>} />
              )
            ) : null}

            {view === 'completed' ? <TaskArchive title="المهام المكتملة" subtitle="كل جلسة أوفيت بوعدها لنفسك." tasks={completedTasks} kind="completed" onCreate={() => navigate('create')} /> : null}
            {view === 'failed' ? <TaskArchive title="المهام المتعثرة" subtitle="لا بأس. راجع ما حدث وابدأ بوعد أصغر." tasks={failedTasks} kind="failed" onCreate={() => navigate('create')} /> : null}
            {view === 'history' ? <PointsHistory transactions={state.transactions} points={state.user.points} /> : null}
          </div>
        </main>
      </div>

      <nav className="mobile-nav" aria-label="التنقل السريع">
        <button type="button" className={`mobile-nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('dashboard')} data-testid="button-mobile-dashboard"><LayoutDashboard size={18} /><span>اليوم</span></button>
        <button type="button" className={`mobile-nav-item ${view === 'completed' ? 'active' : ''}`} onClick={() => navigate('completed')} data-testid="button-mobile-completed"><CircleCheck size={18} /><span>مكتملة</span></button>
        <button type="button" className="mobile-nav-item" onClick={() => navigate('create')} data-testid="button-mobile-create"><Sparkles size={18} /><span>مهمة جديدة</span></button>
        <button type="button" className={`mobile-nav-item ${view === 'history' ? 'active' : ''}`} onClick={() => navigate('history')} data-testid="button-mobile-history"><History size={18} /><span>النقاط</span></button>
      </nav>

      {resetOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setResetOpen(false); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="reset-title">
            <h2 id="reset-title">إعادة ضبط المساحة؟</h2>
            <p>سيتم حذف تقدمك المحلي الحالي وإعادة بيانات العرض التجريبية. لا يمكن التراجع عن هذه الخطوة.</p>
            <div className="modal-actions">
              <button type="button" className="danger-button" onClick={resetData} data-testid="button-confirm-reset"><Trash2 size={15} /> نعم، أعد الضبط</button>
              <button type="button" className="secondary-button" onClick={() => setResetOpen(false)} data-testid="button-cancel-reset">إلغاء</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Dashboard({
  currentTask,
  activeTasks,
  completedTasks,
  failedTasks,
  progress,
  onCreate,
  onStart,
  onResume,
  onFail,
}: {
  currentTask: Task | null;
  activeTasks: Task[];
  completedTasks: Task[];
  failedTasks: Task[];
  progress: number;
  onCreate: () => void;
  onStart: (task: Task) => void;
  onResume: (task: Task) => void;
  onFail: (task: Task) => void;
}) {
  const heroAction = currentTask?.status === 'running'
    ? 'العودة إلى الجلسة'
    : currentTask?.status === 'proof'
      ? 'إرفاق الإثبات'
      : 'ابدأ الآن';

  return (
    <section className="dashboard-grid" data-testid="page-dashboard">
      <div>
        <div className="commitment-hero" data-testid="card-today-commitment">
          <div className="hero-topline"><Flame size={15} /><span>وعد اليوم</span></div>
          {currentTask ? (
            <>
              <div className="hero-question">المهمة التي اخترت أن تحمي وقتك لها</div>
              <h1 className="hero-task-title" data-testid="text-current-task">{currentTask.title}</h1>
              <div className="hero-meta"><span>{formatDuration(currentTask.durationMinutes)}</span><span className="meta-dot" /><span>على المحك {currentTask.riskPoints} نقاط</span></div>
              <button type="button" className="hero-action" onClick={() => currentTask.status === 'active' ? onStart(currentTask) : onResume(currentTask)} data-testid="button-hero-start">
                {heroAction} <ChevronLeft size={16} />
              </button>
            </>
          ) : (
            <div className="hero-empty">
              <h1 className="hero-task-title">اجعل نيتك مرئية.</h1>
              <p>مهمة واحدة واضحة تكفي لبدء يوم مختلف. اكتب وعدك، حدّد وقته، ودع الالتزام يتكلم.</p>
              <button type="button" className="hero-action" onClick={onCreate} data-testid="button-hero-create"><Sparkles size={16} /> اكتب وعداً جديداً</button>
            </div>
          )}
        </div>

        <div className="section-heading"><h2>مهام اليوم</h2><span data-testid="text-today-task-count">{activeTasks.length} بانتظارك</span></div>
        <div className="task-list">
          {activeTasks.length ? activeTasks.map((task) => (
            <TaskRow key={task.id} task={task} onStart={onStart} onResume={onResume} onFail={onFail} />
          )) : (
            <EmptyState icon={<CircleDashed size={21} />} title="المساحة هادئة الآن" description="لا توجد وعود معلقة. أضف مهمة صغيرة تحب أن تراها منجزة." action={<button type="button" className="secondary-button" onClick={onCreate} data-testid="button-empty-create">إضافة مهمة</button>} />
          )}
        </div>
      </div>

      <aside className="side-summary" data-testid="card-progress-summary">
        <div className="summary-title">إيقاعك حتى الآن</div>
        <div className="progress-ring-row">
          <div className="progress-ring" style={{ '--progress': `${progress}%` } as CSSProperties} data-testid="progress-ring">
            <span className="progress-ring-value">{progress}%</span>
          </div>
          <div className="progress-copy"><strong>{completedTasks.length ? 'أنت تتحرك بثبات' : 'أول خطوة هي الأهم'}</strong><span>من مجموع مهامك المسجلة</span></div>
        </div>
        <div className="mini-stats">
          <div className="mini-stat"><span className="mini-stat-label">منجزة</span><span className="mini-stat-value" data-testid="text-completed-count">{completedTasks.length}</span></div>
          <div className="mini-stat"><span className="mini-stat-label">متعطلة</span><span className="mini-stat-value" data-testid="text-failed-count">{failedTasks.length}</span></div>
        </div>
      </aside>
    </section>
  );
}

function TaskRow({ task, onStart, onResume, onFail }: { task: Task; onStart: (task: Task) => void; onResume: (task: Task) => void; onFail: (task: Task) => void }) {
  const actionLabel = task.status === 'active' ? 'ابدأ' : task.status === 'running' ? 'تابع' : 'أرفق الإثبات';
  return (
    <div className={`task-row ${task.status}`} data-testid={`card-task-${task.id}`}>
      <div className="task-bullet">{task.status === 'proof' ? <ImagePlus size={16} /> : task.status === 'running' ? <Timer size={16} /> : <BookOpen size={16} />}</div>
      <div className="task-row-copy"><span className="task-row-title" data-testid={`text-task-title-${task.id}`}>{task.title}</span><span className="task-row-sub">{formatDuration(task.durationMinutes)} <span aria-hidden="true">·</span> على المحك {task.riskPoints} نقاط</span></div>
      <button type="button" className="task-row-action" onClick={() => task.status === 'active' ? onStart(task) : onResume(task)} data-testid={`button-task-action-${task.id}`}>{actionLabel}<ChevronLeft size={15} /></button>
      {task.status !== 'proof' ? <button type="button" className="task-row-action" onClick={() => onFail(task)} aria-label={`تعثر في ${task.title}`} data-testid={`button-task-fail-${task.id}`}><X size={15} /></button> : null}
    </div>
  );
}

function CreateTask({
  title,
  setTitle,
  duration,
  setDuration,
  durationUnit,
  setDurationUnit,
  onSubmit,
  onBack,
}: {
  title: string;
  setTitle: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  durationUnit: 'minutes' | 'hours';
  setDurationUnit: (value: 'minutes' | 'hours') => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}) {
  const previewMinutes = getDurationMinutes(duration, durationUnit);
  const previewRiskPoints = previewMinutes === null ? null : getRiskPoints(previewMinutes);

  return (
    <section className="form-page" data-testid="page-create-task">
      <button type="button" className="back-link" onClick={onBack} data-testid="button-create-back"><ArrowLeft size={15} /> العودة إلى اليوم</button>
      <div className="form-intro"><h1>ما وعدك لهذا اليوم؟</h1><p>اكتب شيئاً محدداً يمكن إنجازه في جلسة واحدة. الوضوح يجعل البدء أخف.</p></div>
      <form className="form-card" onSubmit={onSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="task-title">المهمة <span className="form-hint">مثال: قراءة 10 صفحات</span></label>
          <input id="task-title" className="text-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="ما الذي ستنجزه؟" autoFocus data-testid="input-task-title" />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="task-duration">وقت التركيز <span className="form-hint">يمكنك استخدام الدقائق أو الساعات</span></label>
          <div className="duration-controls">
            <input id="task-duration" className="number-input" type="number" min={durationUnit === 'hours' ? '0.1' : '1'} max={durationUnit === 'hours' ? '3' : '180'} step="0.1" value={duration} onChange={(event) => setDuration(event.target.value)} data-testid="input-task-duration" />
            <select className="select-input" value={durationUnit} onChange={(event) => {
              const nextUnit = event.target.value as 'minutes' | 'hours';
              const currentValue = Number(duration);
              setDurationUnit(nextUnit);
              if (!Number.isFinite(currentValue)) {
                setDuration(nextUnit === 'hours' ? '1' : '15');
              } else if (nextUnit === 'hours') {
                setDuration(String(Math.min(3, Math.max(0.1, currentValue / 60))));
              } else {
                setDuration(String(Math.min(180, Math.max(1, Math.round(currentValue * 60)))));
              }
            }} aria-label="وحدة الوقت" data-testid="select-duration-unit">
              <option value="minutes">دقيقة</option>
              <option value="hours">ساعة</option>
            </select>
          </div>
          <div className="duration-presets">
            {[1, 5, 10, 15, 20, 30, 45, 60, 90, 120, 150, 180].map((preset) => <button key={preset} type="button" className={`preset-button ${duration === String(preset) && durationUnit === 'minutes' ? 'selected' : ''}`} onClick={() => { setDuration(String(preset)); setDurationUnit('minutes'); }} data-testid={`button-preset-${preset}`}>{preset} د</button>)}
          </div>
        </div>
        <div className="form-field">
          <div className="form-label">النقاط المعرضة للخسارة <span className="form-hint">تُحسب تلقائياً حسب مدة المهمة</span></div>
          <div className="select-input" aria-live="polite" data-testid="text-calculated-risk-points">
            {previewMinutes === null ? 'أدخل مدة بين 1 و180 دقيقة' : `${getRiskPoints(previewMinutes)} نقطة`}
          </div>
        </div>
        <div className="risk-note"><Target size={16} /><span>إكمال المهمة بنجاح لا يضيف نقاطاً. إذا تراجعت، تُخصم النقاط المحددة للمهمة.</span></div>
        <div className="form-footer"><button type="submit" className="primary-button" disabled={!title.trim()} data-testid="button-create-task"><LockKeyhole size={15} /> تثبيت الوعد</button><button type="button" className="secondary-button" onClick={onBack} data-testid="button-create-cancel">إلغاء</button></div>
      </form>
    </section>
  );
}

function RunningTask({ task, secondsLeft, onFinish, onFail, onBack }: { task: Task; secondsLeft: number; onFinish: () => void; onFail: () => void; onBack: () => void }) {
  const totalSeconds = task.durationMinutes * 60;
  const completion = Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100));
  return (
    <section className="timer-layout" data-testid="page-running-task">
      <button type="button" className="back-link" onClick={onBack} data-testid="button-running-back"><ArrowLeft size={15} /> اترك المؤقت يعمل</button>
      <div className="timer-card">
        <div className="timer-eyebrow"><Timer size={14} /> جلسة تركيز جارية</div>
        <h1 className="timer-title" data-testid="text-running-task-title">{task.title}</h1>
        <div className="timer-display" data-testid="text-timer">{formatClock(secondsLeft)}</div>
        <div className="timer-progress"><span style={{ width: `${completion}%` }} /></div>
        <div className="timer-meta">خذ نفساً. لا تحتاج أن تنجز كل شيء الآن، فقط ابقَ مع هذه الجلسة.</div>
        <div className="timer-actions">
          <button type="button" className="primary-button" onClick={onFinish} data-testid="button-finish-timer"><Check size={16} /> أنهي الجلسة الآن</button>
          <button type="button" className="secondary-button" onClick={onFail} data-testid="button-fail-running"><Minus size={16} /> تراجع عن الوعد</button>
        </div>
      </div>
    </section>
  );
}

function ProofReview({ task, image, onFile, onVerify, onBack }: { task: Task; image: string | null; onFile: (file?: File) => void; onVerify: () => void; onBack: () => void }) {
  return (
    <section className="proof-card" data-testid="page-proof-review">
      <div className="proof-header"><div className="proof-icon"><Upload size={21} /></div><div><h1>أرِنا ما أنجزت</h1><p>أرفق صورة سريعة كإشارة لنفسك أنك أوفيت بالوعد.</p></div></div>
      <div className={`upload-zone ${image ? 'has-image' : ''}`} data-testid="dropzone-proof">
        {image ? <img className="upload-image" src={image} alt="إثبات المهمة" data-testid="img-proof-preview" /> : <div className="upload-placeholder"><ImagePlus size={28} /><strong>اضغط لاختيار صورة</strong><span>من ملاحظاتك أو شاشة ما عملت عليه</span></div>}
        <input className="file-input" type="file" accept="image/*" onChange={(event) => onFile(event.target.files?.[0])} aria-label="رفع صورة الإثبات" data-testid="input-proof-image" />
      </div>
      <div className="proof-actions">
        <span className="demo-note">مراجعة تجريبية: يمرّ الإثبات فوراً بعد إرفاق صورة.</span>
        <div className="modal-actions" style={{ marginTop: 0 }}><button type="button" className="secondary-button" onClick={onBack} data-testid="button-proof-back">عودة للمؤقت</button><button type="button" className="primary-button" onClick={onVerify} disabled={!image} data-testid="button-verify-proof"><CircleCheck size={16} /> اعتماد وإضافة {task.riskPoints} نقاط</button></div>
      </div>
    </section>
  );
}

function TaskArchive({ title, subtitle, tasks, kind, onCreate }: { title: string; subtitle: string; tasks: Task[]; kind: 'completed' | 'failed'; onCreate: () => void }) {
  return (
    <section data-testid={`page-${kind}-tasks`}>
      <div className="view-header"><h1 className="view-title">{title}</h1><p className="view-subtitle">{subtitle}</p></div>
      <div className="task-list">
        {tasks.length ? tasks.map((task) => (
          <div className={`task-row ${kind}`} key={task.id} data-testid={`card-archive-task-${task.id}`}>
            <div className="task-bullet">{kind === 'completed' ? <Trophy size={17} /> : <ShieldAlert size={17} />}</div>
            <div className="task-row-copy"><span className="task-row-title" data-testid={`text-archive-title-${task.id}`}>{task.title}</span><span className="task-row-sub">{formatDuration(task.durationMinutes)} <span aria-hidden="true">·</span> {task.completedAt ? arabicDate(task.completedAt, true) : arabicDate(task.createdAt)}</span></div>
            <span className="transaction-amount" style={{ color: kind === 'completed' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}>{kind === 'completed' ? '+' : '-'}{task.riskPoints}</span>
          </div>
        )) : <EmptyState icon={kind === 'completed' ? <Trophy size={21} /> : <ShieldAlert size={21} />} title={kind === 'completed' ? 'لم توثّق إنجازاً بعد' : 'لا توجد تعثرات' } description={kind === 'completed' ? 'ابدأ بمهمة قصيرة، ثم أرفق إثباتك لتحتفل بأول نقطة.' : 'هذا خبر جيد. حافظ على وعودك الصغيرة.'} action={<button type="button" className="secondary-button" onClick={onCreate} data-testid={`button-${kind}-create`}>مهمة جديدة</button>} />}
      </div>
    </section>
  );
}

function PointsHistory({ transactions, points }: { transactions: PointTransaction[]; points: number }) {
  return (
    <section data-testid="page-point-history">
      <div className="view-header"><h1 className="view-title">سجل النقاط</h1><p className="view-subtitle">كل نقطة هنا تذكير صغير بأنك تفعل ما قلت إنك ستفعله.</p></div>
      <div className="history-layout">
        <div className="transactions-card">
          <div className="card-heading"><h2>الحركة الأخيرة</h2><span>{transactions.length} عمليات</span></div>
          {transactions.length ? <div className="transaction-list">{transactions.map((transaction) => (
            <div className="transaction-row" key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
              <div className={`transaction-icon ${transaction.type}`}><Coins size={16} /></div>
              <div className="transaction-copy"><span className="transaction-label" data-testid={`text-transaction-label-${transaction.id}`}>{transaction.label}</span><span className="transaction-date">{arabicDate(transaction.createdAt, true)}</span></div>
              <span className={`transaction-amount ${transaction.type}`} data-testid={`text-transaction-amount-${transaction.id}`}>{transaction.amount > 0 ? '+' : ''}{transaction.amount}</span>
            </div>
          ))}</div> : <EmptyState icon={<Coins size={21} />} title="لا يوجد سجل بعد" description="أكمل أول وعد ليبدأ سجل نقاطك." />}
        </div>
        <div className="stat-card" data-testid="card-points-total">
          <div className="card-heading"><h2>رصيد الالتزام</h2><span>منذ البداية</span></div>
          <div className="big-stat" data-testid="text-points-total">{points}</div>
          <p>نقطة متاحة الآن. كل مهمة مكتملة تضيف رصيداً، وكل تراجع يذكّرك بقيمة الوعد.</p>
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <CommitApp />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;