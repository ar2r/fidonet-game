import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Button } from 'react95';
import { audioManager } from '../engine/audio/AudioManager';

const WinampContainer = styled.div`
  background-color: #1f1f1f;
  width: 275px;
  position: relative;
  border: 1px solid #444;
  font-family: 'Pixel', sans-serif; /* Fallback */
  color: #00ff00;
  display: flex;
  flex-direction: column;
  user-select: none;
  box-shadow: 2px 2px 0 #000;
`;

const TitleBar = styled.div`
  height: 14px;
  background: #000044;
  border-bottom: 1px solid #444;
  color: #fff;
  font-size: 10px;
  display: flex;
  align-items: center;
  padding-left: 4px;
  cursor: move;
  justify-content: space-between;
`;

const TitleText = styled.span`
  font-weight: bold;
  letter-spacing: 1px;
`;

const MainDisplay = styled.div`
  background-color: #000;
  margin: 5px;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TimeDisplay = styled.div`
  font-family: monospace;
  font-size: 20px;
  color: #00ff00;
  text-shadow: 0 0 4px #00ff00;
  background: #111;
  padding: 2px 6px;
  border: 1px inset #444;
  width: 80px;
  text-align: right;
`;

const Marquee = styled.div`
  background: #111;
  border: 1px inset #444;
  height: 18px;
  width: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  
  & > span {
    font-family: monospace;
    font-size: 10px;
    white-space: nowrap;
    position: absolute;
    animation: scroll 10s linear infinite;
  }

  @keyframes scroll {
    0% { left: 100%; }
    100% { left: -100%; }
  }
`;

const Visualizer = styled.div`
  height: 32px;
  flex-grow: 1;
  background: #000;
  display: flex;
  align-items: flex-end;
  gap: 1px;
  padding: 2px;
  border: 1px inset #444;
`;

const Bar = styled.div`
  flex: 1;
  background: linear-gradient(to top, #00ff00 0%, #ffff00 80%, #ff0000 100%);
  height: ${props => props.height}%;
  transition: height 0.05s ease;
  min-height: 1px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 5px 5px 5px;
`;

const ControlBtn = styled.button`
  width: 24px;
  height: 18px;
  background: linear-gradient(to bottom, #d0d0d0, #808080);
  border: 1px solid #000;
  border-top-color: #fff;
  border-left-color: #fff;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    border: 1px solid #fff;
    border-top-color: #000;
    border-left-color: #000;
    background: #a0a0a0;
    transform: translate(1px, 1px);
  }
`;

const Playlist = styled.div`
  background: #000;
  color: #00ff00;
  font-size: 10px;
  height: 120px;
  padding: 2px;
  font-family: monospace;
  overflow-y: auto;
  border-top: 2px solid #444;
  
  &::-webkit-scrollbar {
    width: 8px;
    background: #1f1f1f;
  }
  &::-webkit-scrollbar-thumb {
    background: #555;
    border: 1px solid #000;
  }
`;

const Track = styled.div`
  cursor: pointer;
  padding: 1px 4px;
  background-color: ${props => props.active ? '#000088' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#00ff00'};
  
  &:hover {
    border: 1px dotted #fff;
  }
`;

const MOCK_TRACKS = [
    { id: 1, title: "1. DJ Mike Llama - Intro", duration: "0:05" },
    { id: 2, title: "2. Ace of Base - The Sign", duration: "3:09" },
    { id: 3, title: "3. Scatman John - Scatman", duration: "3:42" },
    { id: 4, title: "4. Haddaway - What is Love", duration: "4:30" },
];

function Winamp() {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [visuals, setVisuals] = useState(Array(18).fill(5));
    const [time, setTime] = useState(0);
    const timerRef = useRef(null);

    // Audio simulation
    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setVisuals(prev => prev.map(() => Math.max(5, Math.random() * 100)));
                setTime(t => t + 1);
            }, 100);
            
            audioManager.playMelody(MOCK_TRACKS[currentTrackIndex].id); 
        } else {
            clearInterval(timerRef.current);
            audioManager.stopMusic();
        }
        return () => {
            clearInterval(timerRef.current);
            audioManager.stopMusic();
        };
    }, [isPlaying, currentTrackIndex]);

    const play = () => setIsPlaying(true);
    const pause = () => setIsPlaying(!isPlaying);
    const stop = () => { setIsPlaying(false); setTime(0); setVisuals(Array(18).fill(2)); };
    const prev = () => { setCurrentTrackIndex(i => Math.max(0, i - 1)); setTime(0); };
    const next = () => { setCurrentTrackIndex(i => Math.min(MOCK_TRACKS.length - 1, i + 1)); setTime(0); };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const currentTitle = MOCK_TRACKS[currentTrackIndex].title;
    const bitRate = isPlaying ? 128 : 0;
    const sampleRate = isPlaying ? 44 : 0;

    return (
        <WinampContainer>
            <TitleBar>
                <TitleText>WINAMP</TitleText>
                <div style={{ display: 'flex', gap: 2 }}>
                    <div style={{ width: 8, height: 8, background: '#888', border: '1px solid #fff' }} />
                    <div style={{ width: 8, height: 8, background: '#888', border: '1px solid #fff' }} />
                </div>
            </TitleBar>
            
            <MainDisplay>
                <div style={{ display: 'flex', gap: 5 }}>
                    <TimeDisplay>{formatTime(time / 10)}</TimeDisplay>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Marquee>
                            <span>{currentTitle} *** {bitRate}kbps {sampleRate}kHz ***</span>
                        </Marquee>
                        <div style={{ fontSize: 9, color: '#00cc00' }}>Stereo</div>
                    </div>
                </div>
                
                <Visualizer>
                    {visuals.map((h, i) => <Bar key={i} height={h} />)}
                </Visualizer>
            </MainDisplay>

            <Controls>
                <ControlBtn onClick={prev}>|&lt;</ControlBtn>
                <ControlBtn onClick={play}>&gt;</ControlBtn>
                <ControlBtn onClick={pause}>||</ControlBtn>
                <ControlBtn onClick={stop}>[]</ControlBtn>
                <ControlBtn onClick={next}>&gt;|</ControlBtn>
                <div style={{ width: 10 }} />
                <ControlBtn onClick={() => {}}>^</ControlBtn>
            </Controls>

            <Playlist>
                {MOCK_TRACKS.map((track, i) => (
                    <Track 
                        key={track.id} 
                        active={i === currentTrackIndex}
                        onClick={() => { setCurrentTrackIndex(i); setIsPlaying(true); setTime(0); }}
                    >
                        {i + 1}. {track.title}
                        <span style={{ float: 'right' }}>{track.duration}</span>
                    </Track>
                ))}
            </Playlist>
        </WinampContainer>
    );
}

export default Winamp;