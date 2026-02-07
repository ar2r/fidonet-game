import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Window, WindowHeader, WindowContent } from 'react95';
import { useDispatch, useSelector } from 'react-redux';
import { completeQuestAndProgress } from '../engine/questEngine';
import { 
    completeQuest as completeQuestAction, 
    setActiveQuest as setActiveQuestAction, 
    updateSkill as updateSkillAction, 
    setAct as setActAction 
} from '../engine/store';

const Container = styled.div`
  background-color: #c0c0c0;
  font-family: 'ms_sans_serif', sans-serif;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 4px;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 2px;
  margin-bottom: 4px;
  border-bottom: 1px solid #808080;
  padding-bottom: 4px;
`;

const MemoryList = styled.div`
  background: white;
  border: 2px solid #808080;
  border-right-color: white;
  border-bottom-color: white;
  flex-grow: 1;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  padding: 2px;
`;

const Row = styled.div`
  display: flex;
  cursor: pointer;
  background-color: ${props => props.selected ? '#000080' : 'transparent'};
  color: ${props => props.selected ? 'white' : 'black'};
  &:hover {
    border: 1px dotted black;
  }
`;

const Cell = styled.div`
  width: ${props => props.width || '100px'};
  padding-left: 4px;
`;

const Footer = styled.div`
  margin-top: 4px;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
`;

const MOCK_ADDRESSES = [
    { addr: '004A2B10', type: 'Integer 4 bytes', val: '50000' },
    { addr: '004A2B14', type: 'Integer 4 bytes', val: '100' },
    { addr: '004A2B18', type: 'Integer 2 bytes', val: '1' },
    { addr: '004A2B1C', type: 'Float 4 bytes', val: '3.14159' },
    { addr: '004A2B20', type: 'String 16', val: 'SysOp' },
    { addr: '004F0000', type: 'Custom', val: 'QUEST_SKIP_FLAG' }, // The real one
    { addr: '004F0004', type: 'Byte', val: '255' },
    { addr: '004F0008', type: 'Pointer', val: '-> 004A2B10' },
];

function ArtMoney() {
    const dispatch = useDispatch();
    const quests = useSelector(state => state.quests);
    const [selectedIdx, setSelectedIdx] = useState(0);

    const handleSkipQuest = () => {
        if (!quests.active) {
            alert('Нет активного квеста');
            return;
        }

        const actions = {
            completeQuest: completeQuestAction,
            setActiveQuest: setActiveQuestAction,
            updateSkill: updateSkillAction,
            setAct: setActAction,
        };

        completeQuestAndProgress(quests.active, dispatch, actions);
        alert(`Memory Address 004F0000 patched! Quest "${quests.active}" skipped.`);
    };

    return (
        <Container>
            <div style={{ marginBottom: 4 }}>Process: FidoNet.exe (PID: 1337)</div>
            <Toolbar>
                <Button size="sm">Search</Button>
                <Button size="sm">Filter</Button>
                <Button size="sm" disabled>Undo</Button>
                <Button size="sm">Options</Button>
            </Toolbar>
            
            <MemoryList>
                <div style={{ display: 'flex', fontWeight: 'bold', borderBottom: '1px solid black' }}>
                    <Cell width="80px">Address</Cell>
                    <Cell width="120px">Type</Cell>
                    <Cell width="100px">Value</Cell>
                </div>
                {MOCK_ADDRESSES.map((row, idx) => (
                    <Row key={row.addr} selected={idx === selectedIdx} onClick={() => setSelectedIdx(idx)}>
                        <Cell width="80px">{row.addr}</Cell>
                        <Cell width="120px">{row.type}</Cell>
                        <Cell width="100px">{row.val}</Cell>
                    </Row>
                ))}
            </MemoryList>

            <Footer>
                <Button onClick={() => alert("Error: Access Violation at 0xDEADBEEF")} disabled={selectedIdx !== 0 && selectedIdx !== 1}>Set Value</Button>
                <Button onClick={() => alert("Nothing found.")}>Freeze</Button>
                {/* The magic button is context-sensitive or just explicit */}
                <Button 
                    style={{ fontWeight: 'bold', color: 'red' }} 
                    onClick={handleSkipQuest}
                    disabled={selectedIdx !== 5} // Only works if the "QUEST_SKIP_FLAG" row is selected
                >
                    Hack Quest
                </Button>
            </Footer>
        </Container>
    );
}

export default ArtMoney;
