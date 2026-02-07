import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from 'react95';
import { audioManager } from '../engine/audio/AudioManager';

const WinampContainer = styled.div`
  background-color: #1f1f1f;
  width: 275px;
  height: 116px;
  position: relative;
  border: 1px solid #444;
  font-family: 'Pixel', sans-serif; /* Fallback */
  color: #00ff00;
  display: flex;
  flex-direction: column;
  user-select: none;
`;

const TitleBar = styled.div`
  height: 14px;
  background: linear-gradient(to right, #000044, #000088);
  color: #fff;
  font-size: 10px;
  display: flex;
  align-items: center;
  padding-left: 4px;
  cursor: move;
`;

const MainDisplay = styled.div`
  background-color: #000;
  height: 40px;
  margin: 5px 10px;
  border: 1px solid #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-size: 16px;
  color: #00ff00;
  text-shadow: 0 0 2px #00ff00;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 2px;
  margin-top: 5px;
`;

const ControlBtn = styled.button`
  width: 20px;
  height: 15px;
  background: #ccc;
  border: 1px solid #fff;
  border-right-color: #444;
  border-bottom-color: #444;
  font-size: 8px;
  cursor: pointer;
  
  &:active {
    border: 1px solid #444;
    border-right-color: #fff;
    border-bottom-color: #fff;
  }
`;

const Playlist = styled.div`
  background: #000;
  color: #00ff00;
  font-size: 10px;
  height: 100px; /* Extended height for playlist window usually separate but merging here for simplicity prototype */
  margin-top: 5px;
  padding: 5px;
  font-family: monospace;
  overflow-y: auto;
  border: 1px solid #555;
`;

const Track = styled.div`
  cursor: pointer;
  background-color: ${props => props.active ? '#004400' : 'transparent'};
  &:hover {
    background-color: #002200;
  }
`;

const Visualizer = styled.div`
  height: 20px;
  width: 100%;
  background: #000;
  display: flex;
  align-items: flex-end;
  gap: 1px;
  padding: 0 10px;
`;

const Bar = styled.div`
  width: 3px;
  background: #00ff00;
  height: ${props => props.height}%;
  transition: height 0.1s ease;
`;

const MOCK_TRACKS = [
    { id: 1, title: "1. DJ Mike Llama - Llama Whippin' Intro", duration: "0:05" },
    { id: 2, title: "2. Ace of Base - The Sign.mid", duration: "3:09" },
    { id: 3, title: "3. Scatman John - Scatman.mid", duration: "3:42" },
    { id: 4, title: "4. Haddaway - What is Love.mid", duration: "4:30" },
];

function Winamp() {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [visuals, setVisuals] = useState(Array(15).fill(10));
    const timerRef = useRef(null);

    // Audio simulation
    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setVisuals(prev => prev.map(() => Math.random() * 100));
            }, 100);
            
            audioManager.playMelody(MOCK_TRACKS[currentTrackIndex].id); 
        } else {
            clearInterval(timerRef.current);
            setVisuals(Array(15).fill(5));
            audioManager.stopMusic();
        }
        return () => {
            clearInterval(timerRef.current);
            audioManager.stopMusic();
        };
    }, [isPlaying, currentTrackIndex]);

    const play = () => setIsPlaying(true);
    const stop = () => setIsPlaying(false);
    const prev = () => setCurrentTrackIndex(i => Math.max(0, i - 1));
    const next = () => setCurrentTrackIndex(i => Math.min(MOCK_TRACKS.length - 1, i + 1));

    const currentTitle = MOCK_TRACKS[currentTrackIndex].title;
    const marqueeTitle = isPlaying ? `*** ${currentTitle} *** ` : currentTitle;

    return (
        <WinampContainer>
            <TitleBar>WINAMP</TitleBar>
            <MainDisplay>
                {/* Simplified marquee */}
                <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
                    {marqueeTitle}
                </div>
            </MainDisplay>
            
            <Visualizer>
                {visuals.map((h, i) => <Bar key={i} height={h} />)}
            </Visualizer>

            <Controls>
                <ControlBtn onClick={prev}>|&lt;</ControlBtn>
                <ControlBtn onClick={play}>&gt;</ControlBtn>
                <ControlBtn onClick={() => setIsPlaying(!isPlaying)}>||</ControlBtn>
                <ControlBtn onClick={stop}>[]</ControlBtn>
                <ControlBtn onClick={next}>&gt;|</ControlBtn>
            </Controls>

            <Playlist>
                {MOCK_TRACKS.map((track, i) => (
                    <Track 
                        key={track.id} 
                        active={i === currentTrackIndex}
                        onClick={() => { setCurrentTrackIndex(i); setIsPlaying(true); }}
                    >
                        {track.title} ({track.duration})
                    </Track>
                ))}
            </Playlist>
        </WinampContainer>
    );
}

export default Winamp;
