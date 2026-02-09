import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: 40px;
  right: 8px;
  z-index: 99998;
  display: flex;
  flex-direction: column;
  gap: 4px;
  pointer-events: none;
`;

const ToastItem = styled.div`
  background-color: #000080;
  color: #FFFFFF;
  font-family: 'ms_sans_serif', 'Courier New', monospace;
  font-size: 12px;
  padding: 6px 12px;
  border: 2px outset #c0c0c0;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  min-width: 200px;
  max-width: 300px;
  animation: ${props => props.$closing ? slideOut : slideIn} 0.3s ease forwards;
`;

const StepLabel = styled.span`
  color: #55FF55;
`;

/**
 * QuestToast — non-blocking toast notifications for quest step completion.
 * Shows in the bottom-right corner, auto-dismisses after 3 seconds.
 */
function QuestToast({ toasts, onDismiss }) {
    return (
        <ToastContainer>
            {toasts.map(toast => (
                <ToastItemWithTimer
                    key={toast.id}
                    toast={toast}
                    onDismiss={onDismiss}
                />
            ))}
        </ToastContainer>
    );
}

function ToastItemWithTimer({ toast, onDismiss }) {
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setClosing(true);
            setTimeout(() => onDismiss(toast.id), 300);
        }, 3000);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    return (
        <ToastItem $closing={closing}>
            <StepLabel>&#x2714;</StepLabel> {toast.message}
        </ToastItem>
    );
}

export default QuestToast;
