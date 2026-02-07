import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Window, WindowHeader, WindowContent, Button } from 'react95';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99999; /* Ensure it's on top of everything */
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MessageText = styled.div`
  margin: 20px 0;
  text-align: center;
  font-family: 'ms_sans_serif';
`;

function AlertModal({ title = "Message", message, onClose }) {
    if (!message) return null;

    return ReactDOM.createPortal(
        <Overlay onClick={onClose}>
            <Window style={{ width: 300 }} onClick={e => e.stopPropagation()}>
                <WindowHeader className="window-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{title}</span>
                    <Button onClick={onClose} size="sm" square>
                        <span style={{ fontWeight: 'bold', transform: 'translateY(-1px)' }}>x</span>
                    </Button>
                </WindowHeader>
                <WindowContent>
                    <MessageText>{message}</MessageText>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button onClick={onClose}>OK</Button>
                    </div>
                </WindowContent>
            </Window>
        </Overlay>,
        document.body
    );
}

export default AlertModal;
