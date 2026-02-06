import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { resetGame, resetPlayer, resetNetwork, resetQuests } from '../engine/store';
import fs from '../engine/fileSystemInstance';
import { FileSystem } from '../engine/fileSystem';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
`;

const GameOverBox = styled.div`
  background: #000;
  color: #ff0000;
  font-family: 'DosVga', monospace;
  padding: 40px;
  border: 2px solid #ff0000;
  text-align: center;
  white-space: pre-wrap;
  font-size: 18px;
  line-height: 1.5;
`;

const RestartButton = styled.button`
  background: #ff0000;
  color: #000;
  border: none;
  padding: 10px 30px;
  font-family: 'DosVga', monospace;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  &:hover {
    background: #ff4444;
  }
`;

const REASONS = {
    'mom': 'Мама отключила модем навсегда.',
    'sanity': 'Рассудок потерян. Вы стали одним из тех\nкто бормочет про FTN-адреса в метро.',
};

function GameOverScreen() {
    const dispatch = useDispatch();
    const gameState = useSelector(state => state.gameState);
    const player = useSelector(state => state.player);

    if (!gameState.gameOver) return null;

    const reasonText = REASONS[gameState.gameOverReason] || 'Игра окончена.';

    const handleRestart = () => {
        dispatch(resetGame());
        dispatch(resetPlayer());
        dispatch(resetNetwork());
        dispatch(resetQuests());
        // Reset file system
        const fresh = new FileSystem();
        Object.assign(fs, fresh);
    };

    return (
        <Overlay>
            <GameOverBox>
{`╔═══════════════════════════════════════╗
║           G A M E   O V E R          ║
╚═══════════════════════════════════════╝

${reasonText}

День: ${gameState.day}   Ранг: ${player.rank}
Акт: ${gameState.act}`}
                <br />
                <RestartButton onClick={handleRestart}>
                    [ Начать заново ]
                </RestartButton>
            </GameOverBox>
        </Overlay>
    );
}

export default GameOverScreen;
