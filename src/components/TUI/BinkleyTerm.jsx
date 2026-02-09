import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { eventBus } from '../../domain/events/bus';
import { TIME_ADVANCED, ZMH_ACTIVITY_COMPLETED } from '../../domain/events/types';

const TerminalContainer = styled.div`
  background-color: #0000AA;
  color: #FFFFFF;
  font-family: 'DosVga', monospace;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background-color: #AAAAAA;
  color: #000;
  padding: 5px;
  text-align: center;
  font-weight: bold;
`;

const StatusPanel = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  background-color: #00AAAA;
  color: #000;
  font-weight: bold;
`;

const LogArea = styled.div`
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
  font-family: 'DosVga', monospace;
  white-space: pre-wrap;
  background-color: #000000;
  color: #CCCCCC;
  border: 1px solid #AAAAAA;
  margin: 5px;
`;

const Footer = styled.div`
  background-color: #AAAAAA;
  color: #000;
  padding: 5px;
  display: flex;
  justify-content: space-around;
`;

function BinkleyTerm() {
    const gameState = useSelector(state => state.gameState);
    const [logs, setLogs] = useState([
        `${new Date().toLocaleTimeString('ru-RU', { hour12: false })}  BinkleyTerm/386 v2.60 - loading configuration...`,
        `${new Date().toLocaleTimeString('ru-RU', { hour12: false })}  Initializing modem on COM1...`,
        `${new Date().toLocaleTimeString('ru-RU', { hour12: false })}  Modem: US Robotics Courier V.Everything`,
        `${new Date().toLocaleTimeString('ru-RU', { hour12: false })}  Initialization complete. Waiting for calls.`
    ]);
    const logEndRef = useRef(null);

    const addLog = useCallback((text) => {
        const time = new Date().toLocaleTimeString('ru-RU', { hour12: false });
        setLogs(prev => [...prev, `${time}  ${text}`]);
    }, []);

    // Scroll to bottom
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // Listen for time advancement to simulate "waiting"
    useEffect(() => {
        const unsubscribe = eventBus.subscribe(TIME_ADVANCED, () => {
            // Every hour add a "Waiting..." log or similar
        });
        return () => unsubscribe();
    }, []);

    // Check ZMH Logic
    useEffect(() => {
        if (gameState.zmh) {
            // If it's ZMH (04:00-05:00), we should simulate activity
            const timer = setTimeout(() => {
                addLog("ZMH Detected! Scanning for outbound mail...");
                addLog("Dialing Boss Node 2:5020/123...");
                setTimeout(() => {
                    addLog("CONNECT 28800/ARQ/V34");
                    addLog("Session: EMSI, Freq, Mail");
                    addLog("Received: 50KB packet.");
                    addLog("Sent: 2KB packet.");
                    addLog("Session closed.");
                    
                    eventBus.publish(ZMH_ACTIVITY_COMPLETED, { success: true });
                }, 2000);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [gameState.zmh, addLog]);

    return (
        <TerminalContainer>
            <Header>BinkleyTerm - The FidoNet Mailer</Header>
            <StatusPanel>
                <span>Status: Waiting</span>
                <span>Time: {gameState.time}</span>
                <span>Event: {gameState.zmh ? 'ZMH' : 'None'}</span>
            </StatusPanel>
            <LogArea>
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
                <div ref={logEndRef} />
            </LogArea>
            <Footer>
                <span>F1-Help</span>
                <span>F2-Mail</span>
                <span>Alt-X Exit</span>
            </Footer>
        </TerminalContainer>
    );
}

export default BinkleyTerm;