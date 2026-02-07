import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const cascade = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const shake = keyframes`
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5px, 5px); }
  20% { transform: translate(5px, -5px); }
  30% { transform: translate(-5px, -5px); }
  40% { transform: translate(5px, 5px); }
  50% { transform: translate(-5px, 0); }
  60% { transform: translate(5px, 0); }
  70% { transform: translate(0, -5px); }
  80% { transform: translate(0, 5px); }
  90% { transform: translate(-5px, -5px); }
`;

const VirusOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  animation: ${props => props.shake ? shake : 'none'} 0.5s infinite;
`;

const CascadeContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
`;

const FallingChar = styled.span`
  position: absolute;
  color: #0f0;
  font-family: 'DosVga', monospace;
  font-size: 16px;
  animation: ${cascade} ${props => props.duration}s linear;
  left: ${props => props.left}%;
  animation-delay: ${props => props.delay}s;
`;

const ChickenArt = styled.pre`
  color: #ff0;
  font-family: 'DosVga', monospace;
  font-size: 14px;
  line-height: 1.2;
  text-align: center;
  animation: ${blink} 1s infinite;
  white-space: pre;
  margin: 0;
`;

const VirusMessage = styled.div`
  color: #f00;
  font-family: 'DosVga', monospace;
  font-size: 20px;
  text-align: center;
  margin: 20px;
  animation: ${blink} 0.5s infinite;
`;

const AntidotePrompt = styled.div`
  color: #0f0;
  font-family: 'DosVga', monospace;
  font-size: 16px;
  text-align: center;
  margin-top: 20px;
  padding: 10px 20px;
  border: 2px solid #0f0;
  background: rgba(0, 255, 0, 0.1);
`;

const CHICKEN_ASCII = `
    ___
  /o   o\\
 (   ^   )
  \\_____/
   |   |
  /|   |\\
 / |   | \\
   ||_||
   || ||
  _||_||_
`;

const CHARS = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789!@#$%^&*()';

// eslint-disable-next-line no-unused-vars
function VirusAnimation({ stage, onComplete }) {
  const [fallingChars, setFallingChars] = useState([]);
  const [showChicken, setShowChicken] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (stage === 'cascade') {
      // Generate falling characters
      const chars = [];
      for (let i = 0; i < 50; i++) {
        chars.push({
          id: i,
          char: CHARS[Math.floor(Math.random() * CHARS.length)],
          left: Math.random() * 100,
          delay: Math.random() * 2,
          duration: 2 + Math.random() * 3,
        });
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFallingChars(chars);

      // Show chicken after 3 seconds
      const timer = setTimeout(() => {
        setShowChicken(true);
        setShake(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [stage]);

  if (stage === 'none') {
    return null;
  }

  if (stage === 'cascade') {
    return (
      <VirusOverlay shake={shake}>
        {!showChicken && (
          <CascadeContainer>
            {fallingChars.map(item => (
              <FallingChar
                key={item.id}
                left={item.left}
                delay={item.delay}
                duration={item.duration}
              >
                {item.char}
              </FallingChar>
            ))}
          </CascadeContainer>
        )}

        {showChicken && (
          <>
            <VirusMessage>
              *** ВИРУС "КУРОЧКА РЯБА" ***
            </VirusMessage>
            <ChickenArt>{CHICKEN_ASCII}</ChickenArt>
            <VirusMessage>
              ВАШ КОМПЬЮТЕР ЗАРАЖЁН!
            </VirusMessage>
            <AntidotePrompt>
              Наберите команду: AIDSTEST
            </AntidotePrompt>
          </>
        )}
      </VirusOverlay>
    );
  }

  if (stage === 'cleaning') {
    return (
      <VirusOverlay>
        <div style={{ color: '#0f0', fontFamily: 'DosVga, monospace', fontSize: '18px', textAlign: 'center' }}>
          <div>╔═══════════════════════════════════╗</div>
          <div>║   AIDSTEST v1.03 (c) 1993        ║</div>
          <div>║   Антивирус Д. Лозинского         ║</div>
          <div>╚═══════════════════════════════════╝</div>
          <div style={{ marginTop: '20px' }}>
            Сканирование памяти...
          </div>
          <div style={{ marginTop: '10px', color: '#ff0' }}>
            Обнаружен: VIRUS/Kurochka.Ryaba
          </div>
          <div style={{ marginTop: '10px' }}>
            Лечение...
          </div>
          <div style={{ marginTop: '20px', color: '#0f0' }}>
            [████████████████████████████] 100%
          </div>
          <div style={{ marginTop: '20px' }}>
            Компьютер вылечен!
          </div>
        </div>
      </VirusOverlay>
    );
  }

  return null;
}

export default VirusAnimation;
