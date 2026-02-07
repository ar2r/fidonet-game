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
`;

const CompletedItem = styled.div`
  color: #008800;
  margin-bottom: 4px;
`;

const ActiveItem = styled.div`
  color: #000000;
  font-weight: bold;
  margin-top: 10px;
  background-color: #FFFFCC;
  padding: 5px;
  border: 1px dashed #999;
`;

function QuestLogFile() {
    const quests = useSelector(state => state.quests);
    const completedIds = quests.completed || [];
    const activeId = quests.active;

    const completedQuests = completedIds.map(id => getQuestById(id)).filter(Boolean);
    const activeQuest = activeId ? getQuestById(activeId) : null;

    return (
        <TextContainer>
            <Header>СПИСОК ЗАДАЧ (TODO.TXT)</Header>
            
            {completedQuests.length > 0 ? (
                completedQuests.map((q, i) => (
                    <CompletedItem key={q.id}>
                        [x] {q.title}
                    </CompletedItem>
                ))
            ) : (
                <div style={{ color: '#888' }}>Пока ничего не сделано...</div>
            )}

            {activeQuest ? (
                <ActiveItem>
                    [ ] {activeQuest.title}<br/>
                    <span style={{ fontSize: '12px', fontWeight: 'normal' }}>
                        &gt; {activeQuest.description}
                    </span>
                </ActiveItem>
            ) : (
                <div style={{ marginTop: 20, fontStyle: 'italic' }}>
                    Все задачи выполнены! Можно отдыхать.
                </div>
            )}
        </TextContainer>
    );
}

export default QuestLogFile;
