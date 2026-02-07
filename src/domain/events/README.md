# Domain Events

Event Bus для декларативной обработки доменных событий в игре.

## Архитектура

```
UI/Commands → publish events → Event Bus → subscribers → Quest Engine
                                                       → Analytics
                                                       → Achievements
                                                       → etc.
```

## Использование

### Публикация событий

```javascript
import { eventBus, FILE_SAVED } from '../domain/events';

// После сохранения файла
eventBus.publish(FILE_SAVED, {
    path: 'C:\\FIDO\\T-MAIL.CTL',
    valid: true,
});
```

### Подписка на события

```javascript
import { eventBus, DOWNLOAD_COMPLETED } from '../domain/events';

// В Quest Engine или другом модуле
const unsubscribe = eventBus.subscribe(DOWNLOAD_COMPLETED, (event) => {
    console.log('Downloaded:', event.item);
    // Проверить completion квеста
});

// Позже можно отписаться
unsubscribe();
```

### Wildcard подписка

```javascript
// Подписаться на ВСЕ события (для логирования, аналитики)
eventBus.subscribe('*', (event) => {
    console.log('Event:', event.type, event);
});
```

## Типы событий

### Command events
- `COMMAND_EXECUTED` — команда выполнена

### Connection events
- `BBS_CONNECTED` — подключение к BBS
- `BBS_DISCONNECTED` — отключение от BBS

### Download events
- `DOWNLOAD_STARTED` — начало загрузки
- `DOWNLOAD_COMPLETED` — файл загружен

### File events
- `FILE_SAVED` — файл сохранён
- `FILE_OPENED` — файл открыт

### Program events
- `PROGRAM_OPENED` — программа запущена
- `PROGRAM_CLOSED` — программа закрыта

### Time events
- `TIME_ADVANCED` — время продвинулось
- `DAY_CHANGED` — сменился день
- `PHASE_CHANGED` — день/ночь

### Modem events
- `MODEM_INITIALIZED` — модем инициализирован (ATZ)
- `MODEM_DIALING` — набор номера
- `MODEM_CONNECTED` — соединение установлено

### Quest events
- `QUEST_STARTED` — квест начат
- `QUEST_COMPLETED` — квест завершён
- `QUEST_STEP_COMPLETED` — шаг квеста завершён

### Virus events
- `VIRUS_INFECTED` — заражение вирусом
- `VIRUS_CLEANED` — вирус вылечен

## Event Payloads

Все события содержат:
- `type` — тип события
- `timestamp` — временная метка (Date.now())
- ...custom fields — специфичные для события данные

### Примеры

```javascript
// FILE_SAVED
{
    type: 'file.saved',
    timestamp: 1706789012345,
    path: 'C:\\FIDO\\T-MAIL.CTL',
    valid: true,
}

// DOWNLOAD_COMPLETED
{
    type: 'download.completed',
    timestamp: 1706789012345,
    item: 't-mail',
    source: 'BBS The Nexus',
}

// BBS_CONNECTED
{
    type: 'bbs.connected',
    timestamp: 1706789012345,
    bbs: 'The Nexus',
    phone: '555-3389',
}
```

## Тестирование

```javascript
import { EventBus } from '../domain/events';

describe('My feature', () => {
    let bus;

    beforeEach(() => {
        bus = new EventBus(); // Изолированный экземпляр для тестов
    });

    it('handles events', () => {
        const callback = vi.fn();
        bus.subscribe('test.event', callback);

        bus.publish('test.event', { data: 'test' });

        expect(callback).toHaveBeenCalled();
    });
});
```

## Преимущества

1. **Decoupling** — компоненты не знают друг о друге
2. **Testability** — легко тестировать изолированно
3. **Extensibility** — новые подписчики без изменения publishers
4. **Debugging** — wildcard subscriber для логирования всех событий
5. **Type safety** — константы событий в types.js

## Roadmap

- [ ] Персистентный лог событий для replay/debugging
- [ ] Event middleware (валидация, трансформация)
- [ ] Async event handlers с очередью
- [ ] Event versioning для миграций
