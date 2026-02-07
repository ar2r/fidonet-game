import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getQuestById } from '../content/quests';

const TextContainer = styled.div`
  background-color: #FFFFFF;
  color: #000000;
  font-family: 'ms_sans_serif', sans-serif;
  height: 100%;
  width: 100%;
  padding: 10px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const Header = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  text-decoration: underline;
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

    return (
        <TextContainer>
            <Header>HISTORY.LOG — Журнал моих подвигов</Header>
            
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
            
            <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12 }}>
                *** END OF LOG ***
            </div>
        </TextContainer>
    );
}

export default HistoryLogFile;