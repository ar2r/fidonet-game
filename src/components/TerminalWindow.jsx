import React from 'react';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import styled from 'styled-components';
import { useTerminal } from '../hooks/useTerminal';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #000;
`;

const TerminalContainer = styled.div`
  background-color: #000;
  color: #00ff00;
  font-family: 'DosVga', monospace;
  flex-grow: 1;
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-size: 16px;
  line-height: 1.2;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.9);
`;

const TerminalStatusBar = styled.div`
  background-color: #008080; /* Teal background for status */
  color: #fff;
  font-family: 'DosVga', monospace;
  padding: 2px 8px;
  display: flex;
  justify-content: space-between;
  border-top: 2px solid #fff;
  font-size: 14px;
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

function TerminalWindow({ onClose, embedded = false, windowId = 'terminal' }) {
    const { history, inputBuffer, currentPrompt, connTime, terminalEndRef, network } = useTerminal(windowId);

    const terminalContent = (
        <Wrapper>
            <TerminalContainer>
                {history.map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
                <div>
                    <span>{currentPrompt}{inputBuffer}</span><Cursor />
                </div>
                <div ref={terminalEndRef} />
            </TerminalContainer>
            {network.terminalProgramRunning && (
                <TerminalStatusBar>
                    <span>Alt-Z Help | Alt-X Exit</span>
                    <span>ANSI  14400 8-N-1</span>
                    <span>{network.connected ? 'ONLINE' : 'OFFLINE'} {connTime}</span>
                </TerminalStatusBar>
            )}
        </Wrapper>
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
            <WindowContent style={{ padding: 0 }}>
                {terminalContent}
            </WindowContent>
        </Window>
    );
}

export default TerminalWindow;
