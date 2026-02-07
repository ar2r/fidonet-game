import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Panel, Button } from 'react95';
import { audioManager } from '../engine/audio/AudioManager';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 100%;
  padding-right: 2px;
`;

const GameStats = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  font-family: 'ms_sans_serif', monospace;
  font-size: 12px;
  margin-right: 4px;
`;

const StatItem = styled.span`
  white-space: nowrap;
`;

const SystemTray = styled(Panel)`
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  margin-top: 1px;
  gap: 8px;
  font-family: 'ms_sans_serif';
  font-size: 11px;
`;

function getAtmosphereLabel(value) {
    if (value >= 80) return "Тишина и покой";
    if (value >= 60) return "Родители дома";
    if (value >= 40) return "Напряжение";
    if (value >= 20) return "Шум за стеной";
    return "СКАНДАЛ!";
}

function StatusBar() {
    const gameState = useSelector(state => state.gameState);
    const player = useSelector(state => state.player);
    const [muted, setMuted] = useState(false);

    const zmhLabel = gameState.zmh ? ' [ZMH]' : '';
    const atmosphereLabel = getAtmosphereLabel(player.stats.atmosphere);

    const handleMute = () => {
        const isMuted = audioManager.toggleMute();
        setMuted(isMuted);
        
        // Ensure audio context is started on click
        if (!audioManager.initialized) {
            audioManager.init();
        }
    };

    return (
        <Container>
            <GameStats>
                <StatItem>Рассудок: {player.stats.sanity}</StatItem>
                <StatItem>|</StatItem>
                <StatItem title={`Атмосфера: ${player.stats.atmosphere}%`}>{atmosphereLabel}</StatItem>
                <StatItem>|</StatItem>
                <StatItem>{player.stats.money} руб.</StatItem>
                {player.stats.debt > 0 && (
                    <>
                        <StatItem>|</StatItem>
                        <StatItem style={{ color: 'red' }}>Долг: {player.stats.debt}</StatItem>
                    </>
                )}
                <StatItem>|</StatItem>
                <StatItem>{player.rank}</StatItem>
            </GameStats>

            <Button 
                onClick={handleMute} 
                style={{ padding: '0 8px', height: '22px', minWidth: '30px', marginRight: '4px' }}
                title={muted ? "Включить звук" : "Выключить звук"}
            >
                <span style={{ color: muted ? 'gray' : 'black', fontWeight: 'bold', fontSize: '14px', lineHeight: '1' }}>
                    {muted ? 'x' : '♪'}
                </span>
            </Button>

            <SystemTray variant="well">
                <span title="День" style={{ fontSize: '14px', fontWeight: 'bold' }}>{gameState.day} д.</span>
                <span title="Время" style={{ minWidth: 50, textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                    {gameState.time}{zmhLabel}
                </span>
            </SystemTray>
        </Container>
    );
}

export default StatusBar;
