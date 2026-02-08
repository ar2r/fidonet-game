import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { processCommand, getPrompt } from '../engine/commandParser';
import fs from '../engine/fileSystemInstance';
import { audioManager } from '../engine/audio/AudioManager';
import { eventBus } from '../domain/events/bus';
import { GAME_NOTIFICATION } from '../domain/events/types';
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
    setVirusActive as setVirusActiveAction,
    setVirusStage as setVirusStageAction,
    payBill as payBillAction,
    setLastBillDay as setLastBillDayAction,
} from '../engine/store';

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
    setTimeMinutes: setTimeMinutesAction,
    advanceTime: advanceTimeAction,
    setPhase: setPhaseAction,
    setZMH: setZMHAction,
    advanceDay: advanceDayAction,
    payBill: payBillAction,
    setLastBillDay: setLastBillDayAction,
};

function getPromptForMode(network) {
    if (network.terminalProgramRunning) return '';
    if (network.terminalMode === 'BBS_MENU') return '>';
    if (network.terminalMode === 'BBS_FILES') return '>';
    if (network.terminalMode === 'BBS_CHAT') return '>';
    return getPrompt();
}

export function useTerminal(windowId = 'terminal') {
    const dispatch = useDispatch();
    const gameState = useSelector(state => state.gameState);
    const network = useSelector(state => state.network);
    const player = useSelector(state => state.player);
    const quests = useSelector(state => state.quests);
    const activeWindow = useSelector(state => state.windowManager.activeWindow);

    const fullContext = useMemo(() => ({ gameState, network, player, quests }), [gameState, network, player, quests]);

    const currentPrompt = getPromptForMode(network);

    const [history, setHistory] = useState([
        "MS-DOS Version 6.22",
        "(C)Copyright Microsoft Corp 1981-1994.",
        "",
        "Добро пожаловать в FidoNet Simulator!",
        "Введите HELP для справки по командам.",
        "Введите DIR для просмотра файлов.",
        "Рекомендуется прочитать NOTE.TXT перед началом.",
        "",
    ]);
    const [inputBuffer, setInputBuffer] = useState("");
    const terminalEndRef = useRef(null);

    const [connTime, setConnTime] = useState("00:00:00");

    // Reset terminal state on mount (when window opens)
    useEffect(() => {
        // Reset current directory to C:\
        fs.currentPath = ['C:'];
        
        // Reset terminal modes
        dispatch(setTerminalProgramAction(false));
        dispatch(setTerminalModeAction('IDLE'));
    }, [dispatch]);

    // Subscribe to game notifications (quest completions etc.)
    useEffect(() => {
        const unsubscribe = eventBus.subscribe(GAME_NOTIFICATION, (payload) => {
            if (payload && payload.messages) {
                setHistory(prev => [...prev, ...payload.messages]);
            }
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        let timer;
        if (network.connected) {
            let seconds = 0;
            timer = setInterval(() => {
                seconds++;
                const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
                const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
                const s = (seconds % 60).toString().padStart(2, '0');
                setConnTime(`${h}:${m}:${s}`);
            }, 1000);
        } else {
            setConnTime("00:00:00");
        }
        return () => clearInterval(timer);
    }, [network.connected]);

    const handleKeyDown = useCallback((e) => {
        if (activeWindow !== windowId) return;

        if (gameState.gameOver) return;

        audioManager.playClick();

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
    }, [inputBuffer, currentPrompt, fullContext, dispatch, gameState.gameOver, activeWindow, windowId]);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, inputBuffer]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        history,
        inputBuffer,
        currentPrompt,
        connTime,
        terminalEndRef,
        network,
    };
}
