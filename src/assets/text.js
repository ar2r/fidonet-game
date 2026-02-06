export const GAME_MANUAL = `
========================================
      FIDONET SIMULATOR v1.0 MANUAL
========================================

[ INTRODUCTION ]
Welcome to the year 1995. You are a SysOp (System Operator)
running your own BBS (Bulletin Board System) from your bedroom.
The goal is simple: Build the best node in the net, upgrade your
hardware, and become a Point or even a Coordinator.

[ VITAL STATISTICS ]
1. SANITY (MENTAL)
   Running a BBS is stressful. Trolls, glitches, and bad connects
   drain your sanity.

2. MOM'S PATIENCE
   You live with your parents. You use the family phone line.
   If patience hits 0, she pulls the plug. GAME OVER.

[ BASIC COMMANDS ]
- HELP / MANUAL : Show this help file.
- AT...         : Modem commands.
- DIAL <number> : Dial a BBS.
- DIR           : List files in current directory.
- CD <path>     : Change directory.
- TYPE <file>   : Display file contents.
- CLS           : Clear screen.
- EXIT          : Close connection.

[ CONFIGURATION ]
After downloading T-Mail and GoldED from The Nexus BBS,
you need to configure them:

1. Launch T-MAIL.EXE to edit T-Mail configuration.
   Required fields:
   - FidoNet Address (ask the SysOp)
   - Session Password (ask the SysOp)
   - Boss Node Address (your uplink)
   - Boss Node Phone (BBS phone number)
   - Inbound/Outbound directories

2. Read C:\\FIDO\\README.1ST for setup instructions.

3. Once configured, you can poll your boss node
   and start exchanging mail!

========================================
`;

export const README_FIDO = `
╔═══════════════════════════════════════════════════════════╗
║            FIDONET POINT SETUP GUIDE v1.0                 ║
║                    README.1ST                             ║
╚═══════════════════════════════════════════════════════════╝

Поздравляем с загрузкой софта FidoNet!

ШАГ 1: НАСТРОЙКА T-MAIL
------------------------
T-Mail — это тоссер, программа для обработки входящей
и исходящей почты FidoNet.

Запустите T-MAIL.EXE для редактирования конфигурации.

Вам понадобятся следующие данные:

  * FidoNet Address — ваш адрес в сети (формат: Z:NNNN/NNN.PP)
    Узнайте его у Сисопа вашей BBS.

  * Session Password — пароль для соединения с босс-нодой.
    Сисоп предоставит вам пароль.

  * Boss Node Address — адрес вашей босс-ноды (формат: Z:NNNN/NNN)
    Это нода, к которой вы подключаетесь.

  * Boss Node Phone — телефон босс-ноды (например: 555-3389)

  * Inbound Directory — куда складывать входящие пакеты
    Рекомендуется: C:\\FIDO\\INBOUND

  * Outbound Directory — откуда брать исходящие пакеты
    Рекомендуется: C:\\FIDO\\OUTBOUND

ШАГ 2: НАСТРОЙКА GOLDED
------------------------
GoldED — это редактор эхопочты. После настройки T-Mail
запустите GOLDED.EXE для конфигурации редактора.

Укажите ваше имя, адрес и Origin (подпись в конце писем).

ШАГ 3: ПЕРВЫЙ ПОЛЛ
-------------------
После настройки обоих программ выполните команду:

  T-MAIL POLL

Это запустит сеанс связи с босс-нодой. Если всё настроено
правильно, вы получите первые письма из эхоконференций!

Удачи в Сети!

═══════════════════════════════════════════════════════════
`;
