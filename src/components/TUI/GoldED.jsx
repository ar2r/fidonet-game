import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { ECHO_AREAS, MESSAGES } from '../../content/messages/data';
import { eventBus } from '../../domain/events/bus';
import { MESSAGE_READ, MESSAGE_POSTED } from '../../domain/events/types';
import fs from '../../engine/fileSystemInstance';

const TuiContainer = styled.div`
  background-color: #000000; /* Black Background */
  color: #AAAAAA; /* Light Grey Text */
  font-family: 'Courier New', Courier, monospace;
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
  background-color: #0000AA; /* Blue Header */
  color: #FFFF55; /* Yellow Text */
  padding: 0 10px;
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
  background-color: #000000;
`;

const Footer = styled.div`
  background-color: #0000AA; /* Blue Footer */
  color: #FFFFFF;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
`;

const ListItem = styled.div`
  padding: 0 10px;
  background-color: ${props => props.selected ? '#0000AA' : 'transparent'}; /* Blue Selection */
  color: ${props => props.selected ? '#FFFFFF' : '#AAAAAA'}; /* White on Blue */
  cursor: pointer;
  white-space: pre;
  
  &:hover {
    background-color: ${props => props.selected ? '#0000AA' : '#333333'};
  }
`;

const Input = styled.input`
  background: #000000;
  border: none;
  border-bottom: 1px solid #AAAAAA;
  color: #FFFFFF;
  width: 100%;
  font-family: 'Courier New', Courier, monospace;
  font-size: 20px;
  outline: none;
  padding: 0;
  caret-color: #FFFF55;
  caret-shape: block;

  &:focus {
    border-bottom-color: #FFFF55;
  }
`;

const TextArea = styled.textarea`
  background: #000088;
  border: 1px solid #0000AA;
  color: #FFFFFF;
  width: 100%;
  height: 300px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 20px;
  line-height: 1.1;
  outline: none;
  resize: none;
  padding: 5px;
  caret-color: #FFFF55;
  caret-shape: block;

  &:focus {
    border-color: #FFFF55;
  }
`;

const ComposerHeader = styled.div`
  background-color: #AA0000;
  color: #FFFFFF;
  padding: 0 10px;
  font-weight: bold;
  animation: editorBlink 1.5s ease-in-out infinite;

  @keyframes editorBlink {
    0%, 100% { background-color: #AA0000; }
    50% { background-color: #AA0044; }
  }
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

const formatAreaName = (id) => id ? id.toUpperCase().replace(/_/g, '.') : '';

function GoldED() {
    const [view, setView] = useState('areas'); // areas, msglist, msgview, composer
    const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);
    const [selectedMsgIndex, setSelectedMsgIndex] = useState(0);
    const [currentAreaId, setCurrentAreaId] = useState(null);
    const [currentMsg, setCurrentMsg] = useState(null);
    const [composeData, setComposeData] = useState({ to: 'All', subj: '', body: '' });

    const { time, day } = useSelector(state => state.gameState);
    const playerName = useSelector(state => state.player.name);
    const containerRef = useRef(null);
    const subjInputRef = useRef(null);
    const textAreaRef = useRef(null);

    // Focus the container on mount and view changes
    const focusContainer = React.useCallback(() => {
        if (view === 'composer') {
            if (subjInputRef.current) {
                subjInputRef.current.focus();
            }
        } else if (containerRef.current) {
            containerRef.current.focus();
        }
    }, [view]);

    useEffect(() => {
        // Try multiple times to ensure focus after window mount
        const t1 = setTimeout(focusContainer, 50);
        const t2 = setTimeout(focusContainer, 200);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [focusContainer]);

    const getGameDate = () => {
        const date = new Date(1995, 1, 6); // Feb 6, 1995
        date.setDate(date.getDate() + (day - 1));
        const dayStr = String(date.getDate()).padStart(2, '0');
        const monthStr = date.toLocaleString('en-US', { month: 'short' });
        const yearStr = date.getFullYear();
        return `${dayStr} ${monthStr} ${yearStr}`;
    };

    const handleReply = () => {
        if (!currentMsg) return;
        
        // Simple quoting logic
        const quote = currentMsg.body.split('\n')
            .map(line => `> ${line}`)
            .join('\n') + '\n\n';
        
        setComposeData({
            to: currentMsg.from,
            subj: currentMsg.subj.startsWith('Re:') ? currentMsg.subj : `Re: ${currentMsg.subj}`,
            body: quote
        });
        setView('composer');
    };

    const handleKeyDown = (e) => {
        // Stop propagation so the terminal's global window listener doesn't steal keys
        e.stopPropagation();

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
                    const reversed = [...msgs].reverse();
                    const msg = reversed[selectedMsgIndex];
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
            } else if (e.key === 'Insert' || e.key === 'r') {
                handleReply();
            }
        } else if (view === 'composer') {
             if (e.key === 'Escape') {
                 setView('msglist');
             } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                 handleSend();
             }
        }
    };

    const getGoldEDConfig = () => {
        const file = fs.cat('C:\\FIDO\\GOLDED.CFG');
        if (!file) return {};
        const originMatch = file.match(/^ORIGIN\s+(.+)$/m);
        const usernameMatch = file.match(/^USERNAME\s+(.+)$/m);
        return {
            origin: originMatch ? originMatch[1].trim() : null,
            username: usernameMatch ? usernameMatch[1].trim() : null,
        };
    };

    const handleSend = () => {
        if (!composeData.body.trim()) return;

        const cfg = getGoldEDConfig();
        const newMsg = {
            id: `msg_${Date.now()}`,
            from: cfg.username || playerName,
            to: composeData.to,
            subj: composeData.subj,
            date: getGameDate(),
            body: composeData.body,
            read: true,
            ...(cfg.origin && { origin: cfg.origin }),
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
            <div style={{ padding: '0 10px', color: '#FFFF55', borderBottom: '1px solid #0000AA' }}>
                {' #'.padEnd(4)} {'Описание'.padEnd(35)} {'Сообщ'.padEnd(8)} {'Новых'.padEnd(8)} {'Эха'}
            </div>
            {ECHO_AREAS.map((area, idx) => (
                <ListItem 
                    key={area.id} 
                    selected={idx === selectedAreaIndex}
                    onClick={() => { setSelectedAreaIndex(idx); setCurrentAreaId(area.id); setView('msglist'); }}
                >
                    {String(idx + 1).padStart(2).padEnd(4)} {area.description.padEnd(35)} {String(area.msgs).padStart(5).padEnd(8)} {String(area.unread).padStart(5).padEnd(8)} {area.name}
                </ListItem>
            ))}
        </>
    );

    const renderMsgList = () => {
        const msgs = MESSAGES[currentAreaId] || [];
        const reversed = [...msgs].reverse();
        return (
            <>
                <div style={{ marginBottom: '10px', color: '#55FFFF' }}>Messages in {formatAreaName(currentAreaId)} ({msgs.length})</div>
                {msgs.length === 0 && <div>No messages. Press Ins to write.</div>}
                {reversed.map((msg, dispIdx) => {
                    return (
                        <ListItem
                            key={msg.id}
                            selected={dispIdx === selectedMsgIndex}
                            onClick={() => { setSelectedMsgIndex(dispIdx); setCurrentMsg(msg); setView('msgview'); eventBus.publish(MESSAGE_READ, { area: currentAreaId, subj_contains: msg.subj, from: msg.from }); }}
                            style={{ display: 'flex', justifyContent: 'space-between' }}
                        >
                            <span style={{ width: '160px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{msg.from}</span>
                            <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingRight: '10px' }}>{msg.subj}</span>
                            <span style={{ whiteSpace: 'nowrap' }}>{msg.date}</span>
                        </ListItem>
                    );
                })}
            </>
        );
    };

    const renderMsgView = () => (
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: "'Courier New', Courier, monospace", height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ backgroundColor: '#000000', color: '#AAAAAA', borderBottom: '1px solid #0000AA', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                    <span>Msg  : {selectedMsgIndex + 1} of {MESSAGES[currentAreaId]?.length || 0}</span>
                    <span>Loc</span>
                </div>
                <div style={{ display: 'flex', padding: '0 10px' }}>
                    <span style={{ width: '80px' }}>From :</span> 
                    <span style={{ width: '300px', color: '#FFFFFF', fontWeight: 'bold' }}>{currentMsg.from}</span>
                    <span style={{ flex: 1 }}>2:5020/123.45</span>
                    <span>{currentMsg.date}</span>
                </div>
                <div style={{ display: 'flex', padding: '0 10px' }}>
                    <span style={{ width: '80px' }}>To   :</span> 
                    <span style={{ width: '300px', color: '#FFFFFF', fontWeight: 'bold' }}>{currentMsg.to}</span>
                    <span style={{ flex: 1 }}></span>
                    <span>{currentMsg.date}</span>
                </div>
                <div style={{ display: 'flex', padding: '0 10px' }}>
                    <span style={{ width: '80px' }}>Subj :</span> 
                    <span style={{ color: '#55FFFF', fontWeight: 'bold' }}>{currentMsg.subj}</span>
                </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
                <MessageBody text={currentMsg.body} />
                <div style={{ marginTop: '20px', color: '#00AAAA' }}>--- GoldED 2.50+</div>
                <div style={{ color: '#FF55FF' }}> * Origin: {currentMsg.origin || 'The Nexus BBS (2:5020/123)'}</div>
            </div>
        </div>
    );

    const handleComposerKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            setView('msglist');
        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            e.stopPropagation();
            handleSend();
        }
    };

    const renderComposer = () => (
        <div
            style={{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column' }}
            onKeyDown={handleComposerKeyDown}
        >
            <ComposerHeader>
                ■ РЕДАКТОР СООБЩЕНИЙ ■  Область: {formatAreaName(currentAreaId) || '???'}
            </ComposerHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '5px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{width: '60px', color: '#AAAAAA'}}>To  :</span>
                    <Input value={composeData.to} onChange={e => setComposeData({...composeData, to: e.target.value})} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{width: '60px', color: '#AAAAAA'}}>Subj:</span>
                    <Input ref={subjInputRef} value={composeData.subj} onChange={e => setComposeData({...composeData, subj: e.target.value})} />
                </div>
            </div>
            <div style={{ borderTop: '1px solid #0000AA', margin: '2px 0' }} />
            <TextArea
                ref={textAreaRef}
                value={composeData.body}
                onChange={e => setComposeData({...composeData, body: e.target.value})}
                placeholder="Введите текст сообщения..."
                style={{ flex: 1 }}
            />
        </div>
    );

    return (
        <TuiContainer
            tabIndex="0"
            ref={containerRef}
            onKeyDown={handleKeyDown}
            onClick={focusContainer}
        >
            <Header>
                <span>GoldEd (2:5020/123.45)</span>
                <span>{currentAreaId ? formatAreaName(currentAreaId) : 'AREA LIST'}</span>
                <span>{time}</span>
            </Header>
            <ContentArea>
                {view === 'areas' && renderAreas()}
                {view === 'msglist' && renderMsgList()}
                {view === 'msgview' && renderMsgView()}
                {view === 'composer' && renderComposer()}
            </ContentArea>
            <Footer>
                {view === 'areas' && <span>Enter:Select  F10:Exit</span>}
                {view === 'msglist' && <span>Enter:Read  Ins/n:New  Esc:Exit</span>}
                {view === 'msgview' && <span>Esc:Exit  Ins/r:Reply</span>}
                {view === 'composer' && <span><span onClick={handleSend} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Ctrl+Enter:Отправить</span>  <span onClick={() => setView('msglist')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Esc:Отмена</span></span>}
                <span>{view === 'areas' ? '0 unread' : ''}</span>
            </Footer>
        </TuiContainer>
    );
}

export default GoldED;
