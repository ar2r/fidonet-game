import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getQuestById } from '../../content/quests';

const TuiContainer = styled.div`
  background-color: #0000AA;
  color: #FFFFFF;
  font-family: 'DosVga', 'Courier New', monospace;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MenuBar = styled.div`
  background-color: #00FFFF;
  color: #000080;
  padding: 4px 10px;
  font-weight: bold;
  text-align: center;
`;

const WorkArea = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #0000AA;
`;

const QuestTitle = styled.div`
  color: #FFFF00;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid #FFFFFF;
  padding-bottom: 5px;
`;

const QuestDescription = styled.div`
  color: #FFFFFF;
  margin-bottom: 15px;
  line-height: 1.4;
`;

const HintBox = styled.div`
  background-color: #000080;
  border: 1px solid #00FFFF;
  padding: 10px;
  margin-bottom: 15px;
  color: #00FFFF;
  font-size: 12px;
`;

const StepsSection = styled.div`
  margin-top: 20px;
`;

const StepsTitle = styled.div`
  color: #00FF00;
  font-weight: bold;
  margin-bottom: 10px;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  padding: 5px;
  background-color: ${props => props.active ? '#000080' : 'transparent'};
`;

const StepCheckbox = styled.span`
  color: ${props => props.completed ? '#00FF00' : '#888888'};
  margin-right: 10px;
  font-weight: bold;
  min-width: 20px;
`;

const StepDescription = styled.span`
  color: ${props => props.completed ? '#AAAAAA' : props.active ? '#FFFF00' : '#FFFFFF'};
  flex: 1;
`;

const ProgressBar = styled.div`
  margin-top: 20px;
  border: 1px solid #FFFFFF;
  height: 20px;
  position: relative;
  background-color: #000000;
`;

const ProgressFill = styled.div`
  background-color: #00FF00;
  height: 100%;
  width: ${props => props.progress}%;
  transition: width 0.3s ease-in-out;
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #FFFFFF;
  font-weight: bold;
  font-size: 12px;
  text-shadow: 1px 1px 2px #000000;
`;

const StatusBar = styled.div`
  background-color: #00FFFF;
  color: #000080;
  padding: 4px 10px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
`;

const NoQuestMessage = styled.div`
  color: #AAAAAA;
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
`;

function QuestJournal({ onClose }) {
    const quests = useSelector(state => state.quests);
    const activeQuestId = quests.active;
    const quest = activeQuestId ? getQuestById(activeQuestId) : null;

    // TODO: Track step progress (будет в следующих фазах)
    const completedSteps = new Set(); // Placeholder for step tracking

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Calculate progress
    const calculateProgress = () => {
        if (!quest?.steps || quest.steps.length === 0) {
            return 0;
        }
        const completed = quest.steps.filter(step => completedSteps.has(step.id)).length;
        return Math.round((completed / quest.steps.length) * 100);
    };

    const progress = quest ? calculateProgress() : 0;

    return (
        <TuiContainer>
                    <MenuBar>
                        QUEST JOURNAL v1.0 — Текущие задания
                    </MenuBar>

                    <WorkArea>
                        {!quest ? (
                            <NoQuestMessage>
                                Нет активных квестов.<br/><br/>
                                Все задания выполнены!
                            </NoQuestMessage>
                        ) : (
                            <>
                                <QuestTitle>
                                    {quest.title}
                                </QuestTitle>

                                <QuestDescription>
                                    <strong>Цель:</strong> {quest.description}
                                </QuestDescription>

                                {quest.hint && (
                                    <HintBox>
                                        💡 <strong>Подсказка:</strong> {quest.hint}
                                    </HintBox>
                                )}

                                {quest.steps && quest.steps.length > 0 && (
                                    <StepsSection>
                                        <StepsTitle>Шаги выполнения:</StepsTitle>
                                        {quest.steps.map((step, index) => {
                                            const isCompleted = completedSteps.has(step.id);
                                            const isActive = !isCompleted && index === 0; // Упрощенная логика

                                            return (
                                                <StepItem key={step.id} active={isActive}>
                                                    <StepCheckbox completed={isCompleted}>
                                                        {isCompleted ? '✓' : '☐'}
                                                    </StepCheckbox>
                                                    <StepDescription
                                                        completed={isCompleted}
                                                        active={isActive}
                                                    >
                                                        {step.description || step.id}
                                                    </StepDescription>
                                                </StepItem>
                                            );
                                        })}

                                        <ProgressBar>
                                            <ProgressFill progress={progress} />
                                            <ProgressText>{progress}%</ProgressText>
                                        </ProgressBar>
                                    </StepsSection>
                                )}

                                {quest.rewards && quest.rewards.length > 0 && (
                                    <StepsSection>
                                        <StepsTitle>Награды:</StepsTitle>
                                        {quest.rewards.map((reward, index) => (
                                            <div key={index} style={{ color: '#00FF00', marginLeft: '20px' }}>
                                                ✦ {reward.type === 'skill' && `+${reward.delta} ${reward.key}`}
                                                {reward.type === 'item' && `Предмет: ${reward.item}`}
                                                {reward.type === 'money' && `+${reward.delta} руб.`}
                                            </div>
                                        ))}
                                    </StepsSection>
                                )}
                            </>
                        )}
                    </WorkArea>

                    <StatusBar>
                        <span>ESC - Закрыть</span>
                        <span>Акт {quest?.act || 1}</span>
                    </StatusBar>
                </TuiContainer>
    );
}

export default QuestJournal;
