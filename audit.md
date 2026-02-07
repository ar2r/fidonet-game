# Аудит проекта (code review + проверки)

Дата: 2026-02-07

## Findings (по убыванию критичности)

1. **High**: Конфликт глобальных keyboard-listener'ов между окнами.
Проблема: несколько окон одновременно подписываются на `window.addEventListener('keydown', ...)`, из-за чего ввод может обрабатываться сразу несколькими UI-модулями.
Доказательства: `src/components/TerminalWindow.jsx:181`, `src/components/TUI/ConfigEditor.jsx:176`, `src/components/TUI/GoldEDConfig.jsx:170`, `src/features/quests/QuestJournal.jsx:144`.
Риск: двойная обработка Enter/Escape, непредсказуемые переходы состояния, случайное выполнение терминальных команд при работе в других окнах.
Рекомендация: централизовать ввод через `windowManager.activeWindow` и единую точку диспетчеризации клавиатуры.

2. **Medium**: Журнал квестов не отслеживает реальный прогресс шагов.
Проблема: используется заглушка `new Set()` для `completedSteps`, прогресс-бар всегда считается от пустого множества.
Доказательства: `src/features/quests/QuestJournal.jsx:133`, `src/features/quests/QuestJournal.jsx:134`, `src/features/quests/QuestJournal.jsx:153`.
Риск: игрок получает недостоверный UX (шаги визуально не завершаются).
Рекомендация: хранить `completedSteps` в Redux (или derivation из доменных событий) и рендерить активный шаг из фактического состояния.

3. **Medium**: Несоответствие контракта наград между schema и runtime.
Проблема: schema поддерживает `item/stat/money`, но движок применяет только `skill`.
Доказательства: `src/domain/quests/schema.js:19`, `src/domain/quests/schema.js:23`, `src/engine/questEngine.js:25`.
Риск: контент с нескилловыми наградами будет «принят» валидатором, но фактически не изменит состояние игрока.
Рекомендация: реализовать обработку всех заявленных типов наград в `questEngine` либо ограничить schema до реально поддерживаемых типов.

4. **Medium**: `updateStat` ограничивает все статы диапазоном 0..100, включая `money`.
Проблема: в `player.stats` хранится `money: 50000`, но универсальный редьюсер `updateStat` жестко clamp'ит значения до 100.
Доказательства: `src/engine/store.js:71`, `src/engine/store.js:84`, `src/engine/store.js:87`.
Риск: при включении экономики любое изменение денег через `updateStat` даст некорректный результат.
Рекомендация: вынести деньги в отдельный редьюсер (`updateMoney`) без clamp 0..100, либо делать clamp по типу конкретного стата.

5. **Medium**: Event-driven обработчики квестов не подключены к runtime.
Проблема: есть модуль инициализации listeners, но в коде нет вызова `initializeQuestEventListeners(...)`.
Доказательства: `src/domain/quests/eventHandlers.js:16` (декларация), по проекту нет использования функции вне модуля.
Риск: поддерживаются два конкурирующих подхода прогрессии (ручные вызовы и event-driven), что повышает связность и риск регрессий.
Рекомендация: выбрать один источник истины (предпочтительно event-driven) и подключить listeners в точке инициализации приложения.

6. **Low**: В репозитории остаются legacy-модули, не участвующие в runtime.
Проблема: дублирующий квестовый контент и старый event-движок существуют отдельно от текущего пайплайна.
Доказательства: `src/engine/quests.js:1`, `src/engine/events.js:3` (прямых импортов в актуальный runtime нет).
Риск: путаница при разработке, ложные правки «не того» слоя.
Рекомендация: удалить или явно пометить как deprecated/архив.

7. **Low**: `README.md` не отражает фактический проект.
Проблема: корневой README остается шаблоном Vite.
Доказательство: `README.md:1`.
Риск: онбординг и внешняя поддержка проекта затруднены.
Рекомендация: заменить на проектный README (запуск, архитектура, геймплей, тесты, roadmap status).

## Результаты проверок

- `npm run test -- --run`: ✅ успешно, 9/9 test files, 139/139 tests.
- `npm run lint`: ✅ успешно.
- `npm run build`: ✅ успешно, production bundle собран.

## Scope/исключения

По вашей инструкции в findings **не включались** проблемы из незакомиченных файлов.
На момент аудита незакомиченными были:
- `src/App.jsx`
- `src/content/quests/act2.js`
- `src/content/quests/index.js`
- `src/domain/command/handlers/apps.js`
- `src/domain/events/types.js`
- `src/engine/commandParser.js`
- `src/content/messages/` (untracked)
- `src/content/quests/act3.js` (untracked)
- `src/domain/quests/listener.js` (untracked)
