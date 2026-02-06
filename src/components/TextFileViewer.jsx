import React from 'react';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import styled from 'styled-components';

const TextContent = styled.div`
  background: white;
  color: black;
  padding: 10px;
  height: 100%;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  border: 2px solid #888;
  inset: 2px;
`;

function TextFileViewer({ title, content, onClose, style }) {
    return (
        <Window style={{ ...style, width: 400, height: 300, display: 'flex', flexDirection: 'column' }}>
            <WindowHeader className="window-header">
                <span>{title}</span>
                <Button onClick={onClose} style={{ float: 'right', marginTop: '-4px' }}>
                    <span style={{ fontWeight: 'bold', transform: 'translateY(-1px)' }}>X</span>
                </Button>
            </WindowHeader>
            <WindowContent style={{ flex: 1, padding: '4px' }}>
                <TextContent>
                    {content}
                </TextContent>
            </WindowContent>
        </Window>
    );
}

export default TextFileViewer;
