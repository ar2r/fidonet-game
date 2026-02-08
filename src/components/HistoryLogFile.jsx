import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getQuestById } from '../content/quests';

const NotepadContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #C0C0C0;
`;

const MenuBar = styled.div`
  background-color: #C0C0C0;
  border-bottom: 1px solid #FFFFFF;
  display: flex;
  padding: 2px 4px;
  font-size: 11px;
  font-family: 'ms_sans_serif', sans-serif;
`;

const MenuItem = styled.span`
  padding: 2px 8px;
  cursor: default;
  user-select: none;

  &:hover {
    background-color: #000080;
    color: #FFFFFF;
  }
`;

const TextArea = styled.div`
  background-color: #FFFFFF;
  color: #000000;
  font-family: 'Courier New', 'Courier', monospace;
  flex-grow: 1;
  padding: 4px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  border-left: 1px solid #808080;
  border-top: 1px solid #808080;
  border-right: 1px solid #FFFFFF;
  border-bottom: 1px solid #FFFFFF;
  margin: 2px;
`;

const StatusBar = styled.div`
  background-color: #C0C0C0;
  border-top: 1px solid #FFFFFF;
  padding: 2px 4px;
  font-size: 11px;
  font-family: 'ms_sans_serif', sans-serif;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #DFDFDF;
`;

const Header = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

const LogEntry = styled.div`
  margin-bottom: 12px;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 4px;
`;

const DateStamp = styled.span`
  color: #666;
  font-size: 12px;
  margin-right: 8px;
`;

const EntryText = styled.span`
  color: #000;
`;

// Funny/Narrative descriptions for completed quests
const HISTORY_TEXTS = {
    'init_modem': 'Я научил модем говорить "АЛЛО". Теперь он пищит и мигает лампочками.',
    'first_connect': 'Первый коннект! Звук модема — лучшая музыка. Я в Матрице (почти).',
    'download_software': 'Скачал софт. Потратил полчаса, чтобы увидеть прогресс-бар. Оно того стоило.',
    'configure_tmail': 'Настроил T-Mail. Теперь я умею кидать файлы в пустоту.',
    'configure_golded': 'GoldED настроен. Я готов читать чужие мысли и писать свои глупости.',
    'poll_boss': 'Позвонил боссу. Он не ответил, но почту отдал. Успех!',
    'read_rules': 'Прочитал правила. Оказывается, матом ругаться нельзя. Скучно.',
    'reply_welcome': 'Написал в эху. Меня не забанили (пока). Я часть сообщества!',
    'trace_troll': 'Вычислил тролля по IP. Ну, почти. По Kludge-заголовкам. Я хакер.',
    'hardware_upgrade': 'Купил Курьер. Теперь файлы летают, а кошелек пуст. Приоритеты.',
    'request_node': 'Уговорил Сисопа дать ноду. Теперь я важная птица (с адресом).',
    'download_binkley': 'Скачал BinkleyTerm. Серьезный софт для серьезных людей.',
    'configure_binkley': 'Настроил ноду. Конфиг длиннее, чем "Война и мир".',
    'nightly_uptime': 'Просидел ночь с включенным компом. Мама не заметила. ZMH пройден.',
    'fix_hardware': 'Спаял фильтр. Пахнет канифолью и победой над помехами.',
    'negotiate_peace': 'Устроил мир в эхе. Я — Махатма Ганди локального разлива.',
    'meet_coordinator': 'Встретился с Координатором. Я теперь власть. Mwahahaha!',
    'game_completed': 'Я прошел игру. Жизнь удалась.'
};

function HistoryLogFile() {
    const quests = useSelector(state => state.quests);
    const completedIds = quests.completed || [];

    const completedQuests = completedIds.map(id => getQuestById(id)).filter(Boolean);

    // Calculate text stats for status bar (like real Notepad)
    const totalLines = completedQuests.length + 3; // +3 for header, empty line, and footer

    return (
        <NotepadContainer>
            <MenuBar>
                <MenuItem>File</MenuItem>
                <MenuItem>Edit</MenuItem>
                <MenuItem>Search</MenuItem>
                <MenuItem>Help</MenuItem>
            </MenuBar>

            <TextArea>
                <Header>HISTORY.LOG — Журнал моих подвигов</Header>
                {'\n'}
                {completedQuests.length > 0 ? (
                    completedQuests.map((q, index) => {
                        const text = HISTORY_TEXTS[q.id] || `Завершено задание: ${q.title}. Зачем? История умалчивает.`;
                        // Fake date simulation based on index
                        const day = Math.floor(index / 3) + 1;
                        return (
                            <LogEntry key={q.id}>
                                <DateStamp>[День {day}]</DateStamp>
                                <EntryText>{text}</EntryText>
                            </LogEntry>
                        );
                    })
                ) : (
                    <div style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>
                        Пока пусто. Я еще ничего не добился в этой жизни...
                    </div>
                )}
                {'\n'}
                <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12 }}>
                    *** END OF LOG ***
                </div>
            </TextArea>

            <StatusBar>
                <span>For Help, press F1</span>
                <span>Ln {totalLines}</span>
            </StatusBar>
        </NotepadContainer>
    );
}

export default HistoryLogFile;