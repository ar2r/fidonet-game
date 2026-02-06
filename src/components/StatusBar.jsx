import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const StatusContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  font-family: 'ms_sans_serif', monospace;
  font-size: 12px;
  padding: 2px 8px;
`;

const StatItem = styled.span`
  white-space: nowrap;
`;

const PHASE_ICONS = {
    day: '\u2600',   // ☀
    night: '\u263E',  // ☾
};

function StatusBar() {
    const gameState = useSelector(state => state.gameState);
    const player = useSelector(state => state.player);

    const phaseIcon = PHASE_ICONS[gameState.phase] || '';
    const zmhLabel = gameState.zmh ? ' [ZMH]' : '';

    return (
        <StatusContainer>
            <StatItem>{phaseIcon} {gameState.time}{zmhLabel}</StatItem>
            <StatItem>|</StatItem>
            <StatItem>День {gameState.day}</StatItem>
            <StatItem>|</StatItem>
            <StatItem>Рассудок: {player.stats.sanity}</StatItem>
            <StatItem>|</StatItem>
            <StatItem>Терпение мамы: {player.stats.momsPatience}</StatItem>
            <StatItem>|</StatItem>
            <StatItem>{player.stats.money} руб.</StatItem>
            <StatItem>|</StatItem>
            <StatItem>{player.rank}</StatItem>
        </StatusContainer>
    );
}

export default StatusBar;
