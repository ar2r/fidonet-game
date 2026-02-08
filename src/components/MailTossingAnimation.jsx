import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TossingWindow = styled.div`
  background-color: #000080; /* DOS Blue */
  border: 2px solid #FFFFFF;
  padding: 20px;
  min-width: 600px;
  max-width: 700px;
  font-family: 'DosVga', 'Courier New', monospace;
  color: #FFFFFF;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
`;

const Title = styled.div`
  background-color: #00FFFF;
  color: #000080;
  padding: 5px 10px;
  margin: -20px -20px 15px -20px;
  font-weight: bold;
  text-align: center;
`;

const MessageLine = styled.div`
  margin: 8px 0;
  color: ${props => props.highlight ? '#FFFF00' : '#FFFFFF'};
  font-weight: ${props => props.highlight ? 'bold' : 'normal'};
`;

const ProgressBarContainer = styled.div`
  margin: 15px 0;
  border: 1px solid #FFFFFF;
  height: 20px;
  position: relative;
  background-color: #000000;
`;

const ProgressBarFill = styled.div`
  background-color: #00FF00;
  height: 100%;
  width: ${props => props.progress}%;
  transition: width 0.3s ease-in-out;
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 8px;
  height: 14px;
  background-color: #00FF00;
  margin-left: 2px;
  animation: ${blink} 1s step-end infinite;
`;

const TOSSING_STEPS = [
  { time: 0, message: 'Запуск T-Mail v2605...', progress: 0 },
  { time: 1000, message: 'Инициализация модема...', progress: 10 },
  { time: 2000, message: 'Набор номера 5553389...', progress: 20 },
  { time: 3500, message: 'CONNECT 14400/ARQ/V42BIS', progress: 30, highlight: true },
  { time: 4500, message: 'Авторизация на босс-ноде 2:5020/123...', progress: 40 },
  { time: 5500, message: 'Обмен почтой...', progress: 50 },
  { time: 6500, message: 'Получение эхо SU.GENERAL (3 письма)', progress: 65 },
  { time: 7500, message: 'Получение эхо SU.FLAME (2 письма)', progress: 80 },
  { time: 8500, message: 'Разрыв соединения... NO CARRIER', progress: 90 },
  { time: 9500, message: 'Tossing mail...', progress: 95 },
  { time: 10500, message: 'Готово! Получено 5 писем в 2 эхах.', progress: 100, highlight: true },
];

function MailTossingAnimation({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const timers = TOSSING_STEPS.map((step, index) => {
      return setTimeout(() => {
        setCurrentStep(index);
        setMessages(prev => [...prev, { text: step.message, highlight: step.highlight }]);
      }, step.time);
    });

    // Complete animation after last step
    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, TOSSING_STEPS[TOSSING_STEPS.length - 1].time + 2000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const currentProgress = TOSSING_STEPS[currentStep]?.progress || 0;

  return (
    <Overlay>
      <TossingWindow>
        <Title>T-MAIL v2605 — MAIL TOSSING</Title>

        <div style={{ marginBottom: '10px' }}>
          {messages.map((msg, idx) => (
            <MessageLine key={idx} highlight={msg.highlight}>
              {idx === messages.length - 1 ? (
                <>
                  {msg.text}
                  <Cursor />
                </>
              ) : (
                msg.text
              )}
            </MessageLine>
          ))}
        </div>

        <ProgressBarContainer>
          <ProgressBarFill progress={currentProgress} />
        </ProgressBarContainer>

        <div style={{ textAlign: 'center', marginTop: '10px', color: '#AAAAAA', fontSize: '12px' }}>
          {currentProgress}%
        </div>
      </TossingWindow>
    </Overlay>
  );
}

export default MailTossingAnimation;
