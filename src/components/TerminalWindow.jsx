import React, { useState, useEffect, useRef } from 'react';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { processCommand } from '../engine/commandParser';
import { FIDO_BANNER } from '../assets/ascii';
import { connect as connectAction, initializeModem as initModemAction, completeQuest as completeQuestAction } from '../engine/store';

const TerminalContainer = styled.div`
  background-color: #000;
  color: #00ff00;
  font-family: 'DosVga', monospace;
  height: 400px;
  width: 100%;
  box-sizing: border-box; /* Fix for missing right border */
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

function TerminalWindow({ onClose }) {
    const dispatch = useDispatch();
    // Select necessary parts of state for context if needed
    const gameState = useSelector(state => state.gameState);
    const network = useSelector(state => state.network);

    // Combine for command parser context
    const fullContext = {
        gameState,
        network
    };

    const actions = {
        connect: connectAction,
        initializeModem: initModemAction,
        completeQuest: completeQuestAction
    };

    const [history, setHistory] = useState([
        FIDO_BANNER,
        "Эмулятор Фидонет v1.0 [1995]",
        "------------------------------------------------",
        "ТЕКУЩИЙ КВЕСТ: Первый Контакт",
        "ЦЕЛЬ: Подключиться к BBS 'The Nexus' (dial 555-3389)",
        "------------------------------------------------",
        "Введите 'HELP' для списка команд.",
        "",
        "C:\\>_",
    ]);
    const [inputBuffer, setInputBuffer] = useState("");
    const terminalEndRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const cmd = inputBuffer;

            // Finalize current line
            setHistory(prev => {
                const newHistory = [...prev];
                const lastIdx = newHistory.length - 1;
                newHistory[lastIdx] = `C:\\>${cmd}`;
                return newHistory;
            });

            // Process logic
            processCommand(cmd, fullContext, dispatch, actions, (output) => {
                setHistory(prev => {
                    const lines = output.split('\n');
                    return [...prev, ...lines, "", "C:\\>_"];
                });
            });

            setInputBuffer("");
        } else if (e.key === 'Backspace') {
            setInputBuffer(prev => prev.slice(0, -1));
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            setInputBuffer(prev => prev + e.key);
        }
    };

    useEffect(() => {
        setHistory(prev => {
            const newHistory = [...prev];
            if (newHistory.length > 0) {
                const lastIdx = newHistory.length - 1;
                if (newHistory[lastIdx].startsWith("C:\\>")) {
                    newHistory[lastIdx] = `C:\\>${inputBuffer}_`;
                }
            }
            return newHistory;
        });
    }, [inputBuffer]);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [fullContext, inputBuffer, dispatch]);

    return (
        <Window style={{ width: 640, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <WindowHeader className="window-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Terminal.exe</span>
                {/* Fixed Close Button alignment */}
                <Button onClick={onClose} style={{ marginLeft: 'auto', marginRight: '-6px', marginTop: '1px' }} size="sm" square>
                    <span style={{ fontWeight: 'bold', transform: 'translateY(-1px)' }}>X</span>
                </Button>
            </WindowHeader>
            <WindowContent>
                <TerminalContainer>
                    {history.map((line, i) => (
                        <div key={i}>
                            {line.endsWith('_') && i === history.length - 1 ? (
                                <span>
                                    {line.slice(0, -1)}<Cursor />
                                </span>
                            ) : (
                                line
                            )}
                        </div>
                    ))}
                    <div ref={terminalEndRef} />
                </TerminalContainer>
            </WindowContent>
        </Window>
    );
}

export default TerminalWindow;
