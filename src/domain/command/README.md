## Command Registry

Декларативная система обработки команд по режимам терминала.

## Архитектура

```
User Input → commandParser → registry.execute(mode, command, context)
                                        ↓
                              Find matching handler
                                        ↓
                              Execute handler → return result
```

### Преимущества

1. **Separation of Concerns** — каждый режим = свой модуль
2. **Testability** — handlers изолированы, легко тестировать
3. **Extensibility** — новая команда = новый handler, без правок в parser
4. **Type Safety** — типизированные контракты для handlers
5. **Documentation** — handlers документируют команды автоматически

## Использование

### Регистрация команды

```javascript
import { commandRegistry } from './registry';
import { TerminalMode } from './types';

// Простая команда (exact match)
commandRegistry.register(TerminalMode.IDLE, 'VER', ({ appendOutput }) => {
    appendOutput('MS-DOS Version 6.22');
    return { handled: true };
});

// Команда с аргументами (startsWith match)
commandRegistry.register(TerminalMode.IDLE, 'TYPE', ({ command, appendOutput, fileSystem }) => {
    const path = command.substring(5).trim(); // После 'TYPE '
    const result = fileSystem.cat(path);
    appendOutput(result.ok ? result.content : result.error);
    return { handled: true };
});

// Regex pattern
commandRegistry.register(TerminalMode.IDLE, /^DIR/, ({ command, appendOutput, fileSystem }) => {
    const path = command.match(/^DIR\s+(.+)/)?.[1] || '';
    // ... logic
    return { handled: true };
});
```

### Global handlers

Работают в **любом** режиме:

```javascript
// CLS работает везде
commandRegistry.registerGlobal('CLS', () => {
    return { signal: 'CLEAR', handled: true };
});

// HELP работает везде
commandRegistry.registerGlobal('HELP', ({ appendOutput }) => {
    appendOutput(GAME_MANUAL);
    return { handled: true };
});
```

### Command Context

Каждый handler получает контекст:

```javascript
{
  command: string,              // Raw command ('dir c:\\')
  normalizedCommand: string,     // Uppercase, trimmed ('DIR C:\\')
  gameState: Object,            // Current Redux state
  dispatch: Function,           // Redux dispatch
  actions: Object,              // Redux actions
  appendOutput: Function,       // Output function
  fileSystem: Object,           // FileSystem instance
}
```

### Handler Result

Handler возвращает:

```javascript
{
  handled: boolean,             // Была ли команда обработана
  signal?: string,              // Специальный сигнал ('CLEAR', 'EXIT')
  output?: string[],            // Опционально: строки вывода
  statePatches?: Object[],      // Опционально: Redux patches
  events?: Object[],            // Опционально: domain events
}
```

## Структура файлов

```
src/domain/command/
├── types.js              ← Типы и константы
├── registry.js           ← Command Registry класс
├── registry.test.js      ← Тесты registry
└── handlers/
    ├── idle.js           ← IDLE mode handlers
    ├── bbsMenu.js        ← BBS_MENU mode handlers
    ├── bbsFiles.js       ← BBS_FILES mode handlers
    └── bbsChat.js        ← BBS_CHAT mode handlers
```

## Режимы терминала

### IDLE
DOS терминал. Команды:
- `DIR`, `CD`, `TYPE`, `TREE`, `VER`, `DATE`, `TIME`
- `TERMINAL` — запуск terminal program
- `ATZ`, `DIAL` — modem commands (требуют TERMINAL.EXE)
- `EXIT`, `QUIT` — disconnect from BBS

### BBS_MENU
Главное меню BBS:
- `F` — File area
- `M` — Message area
- `C` — Chat with SysOp
- `G` — Goodbye (disconnect)

### BBS_FILES
Файловая область:
- `1` — Download T-Mail
- `2` — Download GoldED
- `3` — Download DOOM2.WAD (virus!)
- `4` — Download AIDSTEST
- `Q` — Quit to menu

### BBS_CHAT
Чат с SysOp:
- Любая клавиша → return to menu

## Пример handler модуля

```javascript
// handlers/bbsMenu.js
import { BBS_FILES } from '../../../assets/ascii';

export function handleFilesCommand({ dispatch, actions, appendOutput }) {
    dispatch(actions.setTerminalMode('BBS_FILES'));
    appendOutput(BBS_FILES);
    return { handled: true };
}

export function handleGoodbyeCommand({ dispatch, actions, appendOutput }) {
    dispatch(actions.disconnect());
    dispatch(actions.setTerminalMode('IDLE'));
    appendOutput('До свидания!');
    appendOutput('NO CARRIER');
    return { handled: true };
}
```

## Миграция из commandParser

### Шаг 1: Создать handler

```javascript
// handlers/idle.js
export function handleVerCommand({ appendOutput }) {
    appendOutput('MS-DOS Version 6.22');
    return { handled: true };
}
```

### Шаг 2: Зарегистрировать

```javascript
// В commandParser.js или отдельном setup файле
import { handleVerCommand } from './handlers/idle';
commandRegistry.register(TerminalMode.IDLE, 'VER', handleVerCommand);
```

### Шаг 3: Использовать в commandParser

```javascript
export function processCommand(cmd, gameState, dispatch, actions, appendOutput) {
    const command = cmd.trim().toUpperCase();
    const mode = gameState.network?.terminalMode || 'IDLE';

    const context = { command, normalizedCommand: command, gameState, dispatch, actions, appendOutput, fileSystem: fs };

    // Try registry first
    const result = commandRegistry.execute(mode, command, context);
    if (result?.handled) {
        return result.signal; // 'CLEAR', 'EXIT', etc.
    }

    // Fall back to old code for non-migrated commands
    if (command === 'VER') {
        appendOutput('MS-DOS Version 6.22');
    }
    // ... etc
}
```

## Testing

```javascript
import { CommandRegistry } from './registry';
import { TerminalMode } from './types';

describe('VER command', () => {
    it('outputs DOS version', () => {
        const registry = new CommandRegistry();
        const appendOutput = vi.fn();
        const context = { appendOutput };

        registry.register(TerminalMode.IDLE, 'VER', ({ appendOutput }) => {
            appendOutput('MS-DOS Version 6.22');
            return { handled: true };
        });

        const result = registry.execute(TerminalMode.IDLE, 'ver', context);

        expect(result.handled).toBe(true);
        expect(appendOutput).toHaveBeenCalledWith('MS-DOS Version 6.22');
    });
});
```

## Stats и Debugging

```javascript
// Get handler counts
const stats = commandRegistry.getStats();
// { global: 2, IDLE: 15, BBS_MENU: 4, BBS_FILES: 5, BBS_CHAT: 1 }

// Get registered commands for mode
const idleCommands = commandRegistry.getCommands(TerminalMode.IDLE);
// ['DIR', 'TYPE', 'VER', ...]
```

## Roadmap

- [x] Migrate all IDLE commands to handlers
- [x] Migrate BBS mode commands
- [ ] Add command aliasing (DIR = LS)
- [ ] Add command autocomplete data
- [ ] Add command help text in registry
- [ ] Generate help documentation from registry
