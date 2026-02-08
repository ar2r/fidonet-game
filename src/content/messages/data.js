/**
 * Mock Data for BBS Echo Areas
 */

export const ECHO_AREAS = [
    {
        id: 'netmail',
        name: 'NETMAIL',
        description: 'Личная почта',
        msgs: 0,
        unread: 0,
    },
    {
        id: 'su_general',
        name: 'SU.GENERAL',
        description: 'Общее общение',
        msgs: 7,
        unread: 7,
    },
    {
        id: 'su_flame',
        name: 'SU.FLAME',
        description: 'Споры и флейм',
        msgs: 7,
        unread: 7,
    },
];

export const MESSAGES = {
    'su_flame': [
        {
            id: 'msg_f1',
            from: 'Moderator',
            to: 'All',
            subj: 'Rules v1.0 (ЧИТАТЬ ВСЕМ!)',
            date: '07 Feb 1995',
            body: `Hi All!

ПРАВИЛА ЭХОКОНФЕРЕНЦИИ SU.FLAME

1. Запрещен мат (звездочки не спасают).
2. Оверквотинг (цитирование всего письма) карается плюсометом.
3. Никакой политики. Мы тут про технологии спорим.
4. Запрещено обсуждение действий модератора.

Незнание правил не освобождает от ответственности.
Нарушители будут отключены от эхи (read-only mode). 
Dixi.
`,
            origin: 'FidoNet Police Station (2:5020/999)',
            read: false,
        },
        {
            id: 'msg_f2',
            from: 'Linuxoid',
            to: 'All',
            subj: 'Windows 95 MUST DIE',
            date: '07 Feb 1995',
            body: `Hello All,

Народ, вы видели эту "новую" систему от Мелкомягких?
Это же тихий ужас! Глючит, падает, требует 8 МЕГАБАЙТ памяти (вы где столько видели?!).
Реестр пухнет, DLL-hell процветает.
Короче, OS/2 Warp или Linux — вот выбор настоящего джедая.
Там хоть многозадачность вытесняющая, а не кооперативное недоразумение.
`,
            origin: 'Linux 1.2.13 at 486DX2-66 (2:5020/10.1)',
            read: false,
        },
        {
            id: 'msg_f3',
            from: 'Gamer95',
            to: 'Linuxoid',
            subj: 'Re: Windows 95 MUST DIE',
            date: '07 Feb 1995',
            body: `Hi Linuxoid,

> Короче, OS/2 Warp или Linux — вот выбор настоящего джедая.

Ага, и красноглазить ночами, пересобирая ядро под новую звуковуху?
Зато под виндой DOOM идет без бубна. И новый Warcraft обещают.
А под полуось игр нет и не будет. Система для банкоматов.
`,
            origin: 'DOOM II Rulez Forever! (2:5020/666)',
            read: false,
        },
        {
            id: 'msg_f4',
            from: 'Troll.Master',
            to: 'All',
            subj: 'Re: Windows 95 MUST DIE',
            date: '07 Feb 1995',
            body: `Hello All,

Все фигня. AMIGA рулит.
Писишки — отстой для бухгалтеров. У вас даже спрайтов аппаратных нет.
Копите на нормальное железо, ламеры.
`,
            origin: 'Amiga 1200 / Motorola 68020 (2:5020/1337)',
            read: false,
        },
        {
            id: 'msg_f5',
            from: 'BudgetGamer',
            to: 'All',
            subj: 'Cyrix 5x86 - убийца Пентиума?',
            date: '08 Feb 1995',
            body: `Hi All,

Купил себе Cyrix 5x86-100. В Quake дает почти столько же кадров, сколько первый Пень!
А стоит копейки. Intel зажрались со своими ценами.
AMD и Cyrix - выбор народа! А на сэкономленные деньги я лучше SIMM-ов докуплю.
`,
            origin: 'Cyrix Inside (2:5020/555)',
            read: false,
        },
        {
            id: 'msg_f6',
            from: 'IntelFan',
            to: 'BudgetGamer',
            subj: 'Re: Cyrix 5x86 - убийца Пентиума?',
            date: '08 Feb 1995',
            body: `Hello BudgetGamer,

Не смеши мои тапочки. Твой Cyrix греется как утюг, а FPU (сопроцессор) у него дохлый.
Попробуй в 3D Studio что-нибудь отрендерить или MP3 послушать - все тормозит.
Intel Inside - это надежность и совместимость. А остальное - компромиссы для нищебродов.
`,
            origin: 'Intel Pentium 90 - The Power (2:5020/1)',
            read: false,
        },
        {
            id: 'msg_f7',
            from: 'Purist',
            to: 'All',
            subj: 'GoldED стал слишком жирным',
            date: '08 Feb 1995',
            body: `Hi All,

GoldED стал попсой. Куча ненужных фич, цвета эти попугайские, конфиг на 10 страниц.
Настоящие фидошники используют msged под DOS.
Текстовый режим должен быть черно-белым, а софт - маленьким и быстрым!
А этот ваш GoldED скоро как Windows грузиться будет.
`,
            origin: 'MS-DOS 6.22 & GoldED (2:5020/2)',
            read: false,
        },
    ],
    'su_general': [
        {
            id: 'msg_g1',
            from: 'Vasia Pupkin',
            to: 'All',
            subj: 'Где взять DOOM2??',
            date: '06 Feb 1995',
            body: `Hi All!

Пацаны, слышал про вторую часть Дума, говорят чума!
Двустволка решает! Где качнуть можно?
Обзвонил все BBS в районе, везде только первая шароварная версия.
`,
            origin: 'Vasia\'s Station (2:5020/123.45)',
            read: false,
        },
        {
            id: 'msg_g2',
            from: 'SysOp',
            to: 'Vasia Pupkin',
            subj: 'Re: Где взять DOOM2??',
            date: '06 Feb 1995',
            body: `Hello Vasia,

Вася, во-первых, читай FAQ.
Во-вторых, у нас в файловой области GAMES все лежит (DOOM2.WAD).
Только учти, там архив на 5 дискет порезан, качать на 2400 будешь до утра.
И рейтинг нужен, просто так не отдаст. Залей что-нибудь полезное сначала.
`,
            origin: 'The Nexus BBS (2:5020/123)',
            read: false,
        },
        {
            id: 'msg_g3',
            from: 'Alexey',
            to: 'All',
            subj: 'Проблема с модемом US Robotics',
            date: '06 Feb 1995',
            body: `Hi All,

Купил по случаю Courier V.Everything, а он коннектится только на 9600.
Строка инициализации AT&F1. Линия вроде нормальная, шумов нет.
Что я делаю не так? Может прошивка старая?
`,
            origin: 'US Robotics Courier V.Everything (2:5020/777)',
            read: false,
        },
        {
            id: 'msg_g4',
            from: 'Guru',
            to: 'Alexey',
            subj: 'Re: Проблема с модемом US Robotics',
            date: '06 Feb 1995',
            body: `Hello Alexey,

> Строка инициализации AT&F1.

Попробуй S-регистры покрутить. S11=50 для начала (скорость набора).
И проверь, не включено ли сжатие MNP5 на плохой линии, оно только тормозит.
А вообще RTFM, там целая книга в коробке идет.
`,
            origin: 'Read The F***ing Manual (2:5020/42)',
            read: false,
        },
        {
            id: 'msg_g5',
            from: 'Trader',
            to: 'All',
            subj: 'Продам 386DX-40',
            date: '07 Feb 1995',
            body: `Hi All,

Продам мамку с процем 386DX-40 и 4Mb RAM.
Цена договорная. Возможен обмен на видеокарту SVGA 512Kb (Trident или Cirrus Logic).
Звонить после 22:00, спросить Сергея. Телефон: 555-12-34.
Или пишите в нетмейл.
`,
            origin: 'Second Hand Hardware Shop (2:5020/9000)',
            read: false,
        },
        {
            id: 'msg_g6',
            from: 'Newbie',
            to: 'All',
            subj: 'Как выйти из Vim?',
            date: '07 Feb 1995',
            body: `Hi All,

Поставил этот ваш Линукс (Slackware), запустил редактор vi.
Теперь не могу выйти. Перезагрузка ресетом помогает, но это не дело.
Ctrl-C, Ctrl-D, Ctrl-Z пробовал - не помогает или просто сворачивает.
Подскажите команду, плиз!
`,
            origin: 'Help me! (2:5020/100)',
            read: false,
        },
        {
            id: 'msg_g7',
            from: 'UnixGuru',
            to: 'Newbie',
            subj: 'Re: Как выйти из Vim?',
            date: '07 Feb 1995',
            body: `Hello Newbie,

Добро пожаловать в мир боли :)

1. Нажми ESC (чтобы выйти в командный режим, если ты что-то печатал).
2. Набери :q! (двоеточие, ку, восклицательный знак) и нажми Enter - это выход без сохранения.
3. Или :wq - сохранить и выйти.

И учи матчасть (man vi).
`,
            origin: 'FreeBSD 2.0 (2:5020/8080)',
            read: false,
        }
    ]
};
