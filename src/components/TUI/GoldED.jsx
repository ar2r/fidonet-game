import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { ECHO_AREAS, MESSAGES } from '../../content/messages/data';
import { eventBus } from '../../domain/events/bus';
import { MESSAGE_READ, MESSAGE_POSTED } from '../../domain/events/types';

const TuiContainer = styled.div`
  background-color: #0000AA; /* Standard DOS Blue */
  color: #AAAAAA; /* Light Grey Text */
  font-family: 'DosVga', 'VT323', monospace;
  font-size: 20px;
  line-height: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  outline: none;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
`;

const Header = styled.div`
  background-color: #AAAAAA; /* Grey Top Bar */
  color: #000000; /* Black Text */
  padding: 2px 10px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
`;

const ContentArea = styled.div`
  flex-grow: 1;
  padding: 0;
  overflow-y: auto;
  border: none; 
  margin: 0;
  background-color: #0000AA;
`;

const Footer = styled.div`
  background-color: #AAAAAA; /* Grey Bottom Bar */
  color: #000000;
  padding: 2px 10px;
  display: flex;
  gap: 20px;
  font-weight: bold;
`;

const ListItem = styled.div`
  padding: 1px 10px;
  background-color: ${props => props.selected ? '#00AAAA' : 'transparent'}; /* Cyan Selection */
  color: ${props => props.selected ? '#000000' : '#AAAAAA'}; /* Black on Cyan */
  cursor: pointer;
  white-space: pre;
  
  &:hover {
    background-color: ${props => props.selected ? '#00AAAA' : '#000088'};
  }
`;

const Input = styled.input`
  background: #000088;
  border: 1px solid #AAAAAA;
  color: #FFFFFF;
  width: 100%;
  font-family: 'DosVga', 'VT323', monospace;
  font-size: 20px;
  outline: none;
  padding: 0 5px;
`;

const TextArea = styled.textarea`
  background: #0000AA;
  border: 1px solid #AAAAAA;
  color: #AAAAAA;
  width: 100%;
  height: 300px;
  font-family: 'DosVga', 'VT323', monospace;
  font-size: 20px;
  line-height: 1.1;
  outline: none;
  resize: none;
  padding: 5px;
`;

// Helper for message body rendering
const MessageBody = ({ text }) => {
    return (
        <div>
            {text.split('\n').map((line, i) => {
                let color = '#AAAAAA'; // Default Grey
                if (line.trim().startsWith('>')) color = '#55FF55'; // Quotes Green
                if (line.trim().startsWith('---')) color = '#00AAAA'; // Tearline Cyan
                if (line.trim().startsWith(' * Origin:')) color = '#FF55FF'; // Origin Magenta (or Cyan)
                
                return <div key={i} style={{ color }}>{line}</div>
            })}
        </div>
    );
};

function GoldED() {
    const [view, setView] = useState('areas'); // areas, msglist, msgview, composer
    const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);
    const [selectedMsgIndex, setSelectedMsgIndex] = useState(0);
    const [currentAreaId, setCurrentAreaId] = useState(null);
    const [currentMsg, setCurrentMsg] = useState(null);
    const [composeData, setComposeData] = useState({ to: 'All', subj: '', body: '' });

    const { time, day } = useSelector(state => state.gameState);
    const containerRef = useRef(null);

    // Focus management
    useEffect(() => {
        const timer = setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.focus();
            }
        }, 10);
        return () => clearTimeout(timer);
    }, [view]);

    const getGameDate = () => {
        const date = new Date(1995, 1, 6); // Feb 6, 1995
        date.setDate(date.getDate() + (day - 1));
        const dayStr = String(date.getDate()).padStart(2, '0');
        const monthStr = date.toLocaleString('en-US', { month: 'short' });
        const yearStr = date.getFullYear();
        return `${dayStr} ${monthStr} ${yearStr}`;
    };

    const handleKeyDown = (e) => {
        if (view === 'areas') {
            if (e.key === 'ArrowDown') {
                setSelectedAreaIndex(prev => Math.min(prev + 1, ECHO_AREAS.length - 1));
            } else if (e.key === 'ArrowUp') {
                setSelectedAreaIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                setCurrentAreaId(ECHO_AREAS[selectedAreaIndex].id);
                setView('msglist');
                setSelectedMsgIndex(0);
            }
        } else if (view === 'msglist') {
            const msgs = MESSAGES[currentAreaId] || [];
            if (e.key === 'ArrowDown') {
                setSelectedMsgIndex(prev => Math.min(prev + 1, msgs.length - 1));
            } else if (e.key === 'ArrowUp') {
                setSelectedMsgIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                if (msgs.length > 0) {
                    const msg = msgs[selectedMsgIndex];
                    setCurrentMsg(msg);
                    setView('msgview');
                    eventBus.publish(MESSAGE_READ, {
                        area: currentAreaId,
                        subj_contains: msg.subj,
                        from: msg.from,
                    });
                }
            } else if (e.key === 'Escape') {
                setView('areas');
            } else if (e.key === 'Insert' || e.key === 'n') {
                setComposeData({ to: 'All', subj: '', body: '' });
                setView('composer');
            }
        } else if (view === 'msgview') {
            if (e.key === 'Escape') {
                setView('msglist');
            }
        } else if (view === 'composer') {
             if (e.key === 'Escape') {
                 setView('msglist');
             }
        }
    };

    const handleSend = () => {
        if (!composeData.body.trim()) return;

        const newMsg = {
            id: `msg_${Date.now()}`,
            from: 'SysOp',
            to: composeData.to,
            subj: composeData.subj,
            date: getGameDate(),
            body: composeData.body,
            read: true,
        };

        if (!MESSAGES[currentAreaId]) MESSAGES[currentAreaId] = [];
        MESSAGES[currentAreaId].push(newMsg);

        eventBus.publish(MESSAGE_POSTED, {
            area: currentAreaId,
            to: composeData.to,
            subj: composeData.subj,
        });

        setView('msglist');
    };

    const renderAreas = () => (
        <>
            <div style={{ marginBottom: '10px', color: '#55FFFF' }}>Echo Areas ({ECHO_AREAS.length})</div>
            {ECHO_AREAS.map((area, idx) => (
                <ListItem 
                    key={area.id} 
                    selected={idx === selectedAreaIndex}
                    onClick={() => { setSelectedAreaIndex(idx); setCurrentAreaId(area.id); setView('msglist'); }}
                >
                    {area.name.padEnd(15)} {String(area.msgs).padStart(4)} msgs  {area.description}
                </ListItem>
            ))}
        </>
    );

    const renderMsgList = () => {
        const msgs = MESSAGES[currentAreaId] || [];
        return (
            <>
                <div style={{ marginBottom: '10px', color: '#55FFFF' }}>Messages in {currentAreaId.toUpperCase()} ({msgs.length})</div>
                {msgs.length === 0 && <div>No messages. Press Ins to write.</div>}
                {msgs.map((msg, idx) => (
                    <ListItem 
                        key={msg.id} 
                        selected={idx === selectedMsgIndex}
                        onClick={() => { setSelectedMsgIndex(idx); setCurrentMsg(msg); setView('msgview'); }}
                    >
                        {msg.from.padEnd(12)} {msg.subj.padEnd(25)} {msg.date}
                    </ListItem>
                ))}
            </>
        );
    };

    const renderMsgView = () => (
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'DosVga', padding: '10px' }}>
            <div style={{ borderBottom: '1px solid #AAAAAA', paddingBottom: '5px', marginBottom: '10px', color: '#FFFFFF' }}>
                <div><span style={{color: '#55FFFF'}}>From:</span> {currentMsg.from}</div>
                <div><span style={{color: '#55FFFF'}}>To  :</span> {currentMsg.to}</div>
                <div><span style={{color: '#55FFFF'}}>Subj:</span> {currentMsg.subj}</div>
                <div><span style={{color: '#55FFFF'}}>Date:</span> {currentMsg.date}</div>
            </div>
            <MessageBody text={currentMsg.body} />
            <div style={{ marginTop: '20px', color: '#00AAAA' }}>--- GoldED 2.50+</div>
            <div style={{ color: '#FF55FF' }}> * Origin: The Nexus BBS (2:5020/123)</div>
        </div>
    );

    const renderComposer = () => (
        <div>
            <div style={{ marginBottom: '10px' }}>New Message to {currentAreaId.toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div>To: <Input value={composeData.to} onChange={e => setComposeData({...composeData, to: e.target.value})} /></div>
                <div>Subj: <Input value={composeData.subj} onChange={e => setComposeData({...composeData, subj: e.target.value})} /></div>
                <TextArea 
                    value={composeData.body} 
                    onChange={e => setComposeData({...composeData, body: e.target.value})}
                    placeholder="Type your message here..."
                />
                <button onClick={handleSend} style={{ alignSelf: 'flex-start', padding: '5px 20px', cursor: 'pointer' }}>Send (Ctrl+Enter)</button>
            </div>
        </div>
    );

    return (
        <TuiContainer 
            tabIndex="0" 
            ref={containerRef} 
            onKeyDown={handleKeyDown}
        >
            <Header>
                <span>GoldED 2.50+</span>
                <span>{time}</span>
            </Header>
            <ContentArea>
                {view === 'areas' && renderAreas()}
                {view === 'msglist' && renderMsgList()}
                {view === 'msgview' && renderMsgView()}
                {view === 'composer' && renderComposer()}
            </ContentArea>
            <Footer>
                {view === 'areas' && <span>Enter: Select Area | F10: Exit</span>}
                {view === 'msglist' && <span>Enter: Read | Ins: New Msg | Esc: Back</span>}
                {view === 'msgview' && <span>Esc: Back</span>}
                {view === 'composer' && <span>Ctrl+Enter: Send | Esc: Cancel</span>}
            </Footer>
        </TuiContainer>
    );
}

export default GoldED;