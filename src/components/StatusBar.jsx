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

const PHASE_ICONS = {
    day: '\u2600',   // ☀
    night: '\u263E',  // ☾
};

function StatusBar() {
    const gameState = useSelector(state => state.gameState);
    const player = useSelector(state => state.player);
    const [muted, setMuted] = useState(false);

    const phaseIcon = PHASE_ICONS[gameState.phase] || '';
    const zmhLabel = gameState.zmh ? ' [ZMH]' : '';

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
                <StatItem>Терпение мамы: {player.stats.momsPatience}</StatItem>
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

            <SystemTray variant="well">
                <Button size="sm" onClick={handleMute} style={{ padding: '0 4px', height: 18 }}>
                    {muted ? '🔇' : '🔊'}
                </Button>
                <span title="День">{gameState.day} д.</span>
                <span title="Время" style={{ minWidth: 40, textAlign: 'center' }}>
                    {phaseIcon} {gameState.time}{zmhLabel}
                </span>
            </SystemTray>
        </Container>
    );
}

export default StatusBar;
