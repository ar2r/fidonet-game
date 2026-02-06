import React from 'react';
import styled from 'styled-components';
import { Window, WindowHeader, WindowContent } from 'react95';

const TuiContainer = styled.div`
  background-color: #0000AA; /* Authentic DOS Blue */
  color: #FFFFFF;
  font-family: 'Terminus', 'Courier New', monospace;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MenuBar = styled.div`
  background-color: #AAAAAA;
  color: #000;
  padding: 2px 10px;
  display: flex;
  justify-content: space-between;
`;

const WorkArea = styled.div`
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
  border: 1px double #FFFFFF;
  margin: 5px;
  background-color: #0000AA;
`;

const StatusBar = styled.div`
  background-color: #AAAAAA;
  color: #000;
  padding: 2px 10px;
  display: flex;
  gap: 20px;
`;

function GoldED() {
    return (
        <Window style={{ width: 800, height: 600, position: 'absolute', top: '5%', left: '5%' }}>
            <WindowHeader>GoldED 2.50+ - UNREGISTERED</WindowHeader>
            <WindowContent style={{ padding: 0, height: '100%' }}>
                <TuiContainer>
                    <MenuBar>
                        <span>Area</span>
                        <span>Msg</span>
                        <span>File</span>
                        <span>Edit</span>
                        <span>Setup</span>
                        <span>Quit</span>
                    </MenuBar>
                    <WorkArea>
                        <div style={{ textAlign: 'center', marginTop: '20%' }}>
                            <h1>GoldED</h1>
                            <p>The Gold Editor</p>
                            <p>Version 2.50.beta4</p>
                        </div>
                    </WorkArea>
                    <StatusBar>
                        <span>F1 Help</span>
                        <span>F2 Save</span>
                        <span>F3 Load</span>
                        <span>F10 Exit</span>
                    </StatusBar>
                </TuiContainer>
            </WindowContent>
        </Window>
    );
}

export default GoldED;
