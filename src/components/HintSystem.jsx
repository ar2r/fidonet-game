import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Window, WindowHeader, WindowContent } from 'react95';
import { getQuestById } from '../content/quests';
import { revealHint } from '../engine/store';

const HintButtonWrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
`;

const HintWindowWrapper = styled(Window)`
  position: absolute;
  top: 50px;
  right: 10px;
  width: 400px;
  z-index: 1001;
`;

const HintText = styled.div`
  margin-bottom: 15px;
  font-family: 'ms_sans_serif';
  line-height: 1.4;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

export function HintSystem() {
    const dispatch = useDispatch();
    const quests = useSelector(state => state.quests);
    const activeQuestId = quests.active;
    const hintLevel = quests.hintLevel || 0;
    const [isOpen, setIsOpen] = useState(false);

    const quest = activeQuestId ? getQuestById(activeQuestId) : null;

    // Reset window state when quest changes
    useEffect(() => {
        setTimeout(() => setIsOpen(false), 0);
    }, [activeQuestId]);

    if (!quest) return null;

    // Fallback if hints array is missing (backward compatibility or error in data)
    const hints = quest.hints || [quest.hint || "Подсказка недоступна."];
    const currentHint = hints[Math.min(hintLevel, hints.length - 1)];
    const isMaxLevel = hintLevel >= hints.length - 1;

    return (
        <>
            <HintButtonWrapper>
                <Button onClick={() => setIsOpen(!isOpen)} active={isOpen}>
                    ❓ Подсказка
                </Button>
            </HintButtonWrapper>

            {isOpen && (
                <HintWindowWrapper>
                    <WindowHeader className="window-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Подсказка: {quest.title}</span>
                        <Button onClick={() => setIsOpen(false)} size="sm" square>
                            <span style={{ fontWeight: 'bold', transform: 'translateY(-1px)' }}>X</span>
                        </Button>
                    </WindowHeader>
                    <WindowContent>
                        <HintText>
                            {currentHint}
                        </HintText>
                        <ButtonRow>
                            <Button 
                                onClick={() => dispatch(revealHint())} 
                                disabled={isMaxLevel}
                                fullWidth
                            >
                                {isMaxLevel ? 'Максимальная подсказка' : 'Следующая подсказка'}
                            </Button>
                        </ButtonRow>
                    </WindowContent>
                </HintWindowWrapper>
            )}
        </>
    );
}
