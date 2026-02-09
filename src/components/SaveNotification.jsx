import React, { useEffect } from 'react';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
`;

const NotificationWindow = styled(Window)`
  width: 400px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.5);
`;

const NotificationContent = styled(WindowContent)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
`;

const MessageText = styled.div`
  font-family: 'ms_sans_serif';
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
`;

const IconArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InfoIcon = styled.div`
  width: 32px;
  height: 32px;
  background-color: #0000AA;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 24px;
  border-radius: 2px;
  flex-shrink: 0;
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: #C0C0C0;
  border: 1px solid #808080;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #0000AA;
  width: ${props => props.progress}%;
  transition: width 0.1s linear;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

/**
 * SaveNotification - уведомление в стиле Windows 95
 * Автоматически закрывается через 5 секунд
 */
function SaveNotification({ message, title, onClose }) {
  const [progress, setProgress] = React.useState(100);
  const duration = 5000; // 5 секунд
  const intervalTime = 100; // обновление каждые 100мс

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onClose();
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onClose, duration, intervalTime]);

  return (
    <Overlay onClick={onClose}>
      <NotificationWindow onClick={(e) => e.stopPropagation()}>
        <WindowHeader>
          <span>{title || '💾 Сохранение игры'}</span>
        </WindowHeader>
        <NotificationContent>
          <IconArea>
            <InfoIcon>i</InfoIcon>
            <MessageText>{message}</MessageText>
          </IconArea>

          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>

          <ButtonContainer>
            <Button onClick={onClose}>OK</Button>
          </ButtonContainer>
        </NotificationContent>
      </NotificationWindow>
    </Overlay>
  );
}

export default SaveNotification;
