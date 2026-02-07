import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { processCommand, getPrompt } from '../engine/commandParser';
import { FIDO_BANNER } from '../assets/ascii';
import {
    connect as connectAction,
    disconnect as disconnectAction,
    initializeModem as initModemAction,
    setTerminalMode as setTerminalModeAction,
    setTerminalProgram as setTerminalProgramAction,
    completeQuest as completeQuestAction,
    setActiveQuest as setActiveQuestAction,
    addItem as addItemAction,
    updateSkill as updateSkillAction,
    setAct as setActAction,
    advanceTime as advanceTimeAction,
    setTimeMinutes as setTimeMinutesAction,
    setPhase as setPhaseAction,
    setZMH as setZMHAction,
    advanceDay as advanceDayAction,
    updateStat as updateStatAction,
    setGameOver as setGameOverAction,
    setVirusActive as setVirusActiveAction,
    setVirusStage as setVirusStageAction,
} from '../engine/store';

const TerminalContainer = styled.div`
  background-color: #000;
  color: #00ff00;
  font-family: 'DosVga', monospace;
  height: 600px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-size: 16px;
  line-height: 1.2;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.9);
`;

const Cursor = styled.span`
  display: inline-block;
  width: 10px;
  height: 18px;
  background-color: #00ff00;
  animation: blink 1s step-end infinite;

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

function getPromptForMode(terminalMode) {
    if (terminalMode === 'BBS_MENU') return '>';
    if (terminalMode === 'BBS_FILES') return '>';
    if (terminalMode === 'BBS_CHAT') return '>';
    return getPrompt();
}

const ACTIONS = {
    connect: connectAction,
    disconnect: disconnectAction,
    initializeModem: initModemAction,
    setTerminalMode: setTerminalModeAction,
    setTerminalProgram: setTerminalProgramAction,
    completeQuest: completeQuestAction,
    setActiveQuest: setActiveQuestAction,
    addItem: addItemAction,
    updateSkill: updateSkillAction,
    setAct: setActAction,
    setVirusActive: setVirusActiveAction,
    setVirusStage: setVirusStageAction,
    updateStat: updateStatAction,
    // Time actions
    setTimeMinutes: setTimeMinutesAction,
    advanceTime: advanceTimeAction,
    setPhase: setPhaseAction,
    setZMH: setZMHAction,
    advanceDay: advanceDayAction,
};

function TerminalWindow({ onClose, embedded = false }) {
    const dispatch = useDispatch();
    const gameState = useSelector(state => state.gameState);
    const network = useSelector(state => state.network);
    const player = useSelector(state => state.player);
    const quests = useSelector(state => state.quests);

    const fullContext = useMemo(() => ({ gameState, network, player, quests }), [gameState, network, player, quests]);

    const currentPrompt = getPromptForMode(network.terminalMode);

    const [history, setHistory] = useState([
        "MS-DOS Version 6.22",
        "(C)Copyright Microsoft Corp 1981-1994.",
        "",
        "C:\\>",
        "",
        "Добро пожаловать в Фидонет!",
        "Для подключения к BBS запустите TERMINAL.EXE",
        "Введите HELP для получения справки.",
        "",
    ]);
    const [inputBuffer, setInputBuffer] = useState("");
    const terminalEndRef = useRef(null);

    const handleKeyDown = useCallback((e) => {
        if (gameState.gameOver) return;

        if (e.key === 'Enter') {
            const cmd = inputBuffer;

            setHistory(prev => [...prev, `${currentPrompt}${cmd}`]);

            const result = processCommand(cmd, fullContext, dispatch, ACTIONS, (output) => {
                if (output) {
                    const lines = output.split('\n');
                    setHistory(prev => [...prev, ...lines]);
                }
            });

            if (result === 'CLEAR') {
                setHistory([]);
            } else {
                setTimeout(() => {
                    setHistory(prev => [...prev, ""]);
                }, 50);
            }

            setInputBuffer("");
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            setInputBuffer(prev => prev.slice(0, -1));
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            setInputBuffer(prev => prev + e.key);
        }
    }, [inputBuffer, currentPrompt, fullContext, dispatch, gameState.gameOver]);

    // Auto-scroll
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, inputBuffer]);

    // Key listeners
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const terminalContent = (
        <TerminalContainer>
            {history.map((line, i) => (
                <div key={i}>{line}</div>
            ))}
            <div>
                <span>{currentPrompt}{inputBuffer}</span><Cursor />
            </div>
            <div ref={terminalEndRef} />
        </TerminalContainer>
    );

    if (embedded) {
        return terminalContent;
    }

    return (
        <Window style={{ width: 900, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <WindowHeader className="window-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Terminal.exe</span>
                <Button onClick={onClose} style={{ marginLeft: 'auto', marginRight: '-6px', marginTop: '1px' }} size="sm" square>
                    <span style={{ fontWeight: 'bold', transform: 'translateY(-1px)' }}>X</span>
                </Button>
            </WindowHeader>
            <WindowContent>
                {terminalContent}
            </WindowContent>
        </Window>
    );
}

export default TerminalWindow;
