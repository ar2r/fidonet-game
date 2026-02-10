import React, { useState } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { styleReset } from 'react95';
import original from 'react95/dist/themes/original';
import { AppBar, Toolbar, Button, List, ListItem, Divider } from 'react95';
import { useSelector, useDispatch } from 'react-redux';

import DesktopWindow from './components/DesktopWindow';
import TaskbarButton from './components/TaskbarButton';
import TerminalWindow from './components/TerminalWindow';
import StatusBar from './components/StatusBar';
import GameOverScreen from './components/GameOverScreen';
import ConfigEditor from './components/TUI/ConfigEditor';
import GoldEDConfig from './components/TUI/GoldEDConfig';
import GoldED from './components/TUI/GoldED';
import BinkleyConfig from './components/TUI/BinkleyConfig';
import BinkleyTerm from './components/TUI/BinkleyTerm';
import RadioMarket from './components/TUI/RadioMarket';
import VirusAnimation from './components/VirusAnimation';
import MailTossingAnimation from './components/MailTossingAnimation';
import QuestJournal from './features/quests/QuestJournal';
import HistoryLogFile from './components/HistoryLogFile';
import Winamp from './components/Winamp';
import ArtMoney from './components/ArtMoney';
import QuestToast from './components/QuestToast';
import Onboarding from './components/Onboarding';
import { HintSystem } from './components/HintSystem';
import {
    completeQuest as completeQuestAction,
    setActiveQuest as setActiveQuestAction,
    updateSkill as updateSkillAction,
    setAct as setActAction,
    completeStep as completeStepAction,
    advanceTime as advanceTimeAction,
    setTimeMinutes as setTimeMinutesAction,
    setPhase as setPhaseAction,
    setZMH as setZMHAction,
    advanceDay as advanceDayAction,
    updateStat as updateStatAction,
    setTimeSpeed as setTimeSpeedAction,
} from './engine/store';
import { openWindow } from './engine/windowManager';
import { generateTMailConfig } from './engine/configValidator';
import fs from './engine/fileSystemInstance';
import { computeTickEffects } from './engine/gameTick';
import { handleTMailConfigComplete, handleGoldEDConfigComplete, handleBinkleyConfigComplete } from './domain/quests/service';
import { setupQuestListeners } from './domain/quests/listener';
import { eventBus } from './domain/events/bus';
import { MAIL_TOSSING_COMPLETED, UI_START_MAIL_TOSSING, UI_OPEN_WINDOW, QUEST_STEP_COMPLETED } from './domain/events/types';
import { audioManager } from './engine/audio/AudioManager';
import { WINDOW_DEFINITIONS } from './config/windows';
import { loadGame, saveToLocalStorage, loadFromLocalStorage, clearLocalStorage, downloadSave, parseShareHash } from './engine/saveSystem';

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  body, input, select, textarea {
    font-family: 'ms_sans_serif';
  }
`;

const ENABLE_ONBOARDING = true;

const BuildInfo = styled.div`
  position: absolute;
  bottom: 55px;
  right: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'ms_sans_serif';
  font-size: 12px;
  font-weight: bold;
  text-align: right;
  z-index: 0;
  pointer-events: none;
  line-height: 1.2;
  text-shadow: 1px 1px 2px #000000;
`;

const TimeControls = styled.div`
  position: absolute;
  bottom: 100px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
`;

const SpeedButton = styled(Button)`
  min-width: 40px;
  font-weight: bold;
  opacity: ${props => props.active ? 1 : 0.7};
  background-color: ${props => props.active ? '#000080' : undefined};
  color: ${props => props.active ? '#FFFFFF' : undefined};
`;

const DesktopContainer = styled.div`
  padding: 10px;
  display: grid;
  grid-template-rows: repeat(auto-fill, 100px);
  grid-auto-flow: column;
  grid-auto-columns: 85px;
  gap: 8px;
  height: calc(100vh - 50px);
  align-content: start;
  justify-items: center;
  align-items: start;
`;

const DesktopIcon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  cursor: pointer;
  color: white;
  text-align: center;

  & span {
    background: #008080;
    padding: 2px;
    white-space: nowrap;
    font-size: 12px;
    margin-top: 4px;
  }
`;

function App() {
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    const [mailTossingActive, setMailTossingActive] = useState(false);
const [questToasts, setQuestToasts] = useState([]);

    // eslint-disable-next-line no-undef
    const buildHash = __COMMIT_HASH__;
    // eslint-disable-next-line no-undef
    const buildDate = __BUILD_DATE__;

    const dispatch = useDispatch();
    const player = useSelector(state => state.player);
    const inventory = player.inventory;
    const quests = useSelector(state => state.quests);
    const gameState = useSelector(state => state.gameState);
    const windows = useSelector(state => state.windowManager.windows);
    const network = useSelector(state => state.network);

    // Guard: suppress auto-save while loading from blob URL
    const isLoadingRef = React.useRef(false);

    // Load Game on Mount: URL hash (#id= or #save=) → localStorage → fresh game
    React.useEffect(() => {
        const parsed = parseShareHash(window.location.hash);

        if (parsed?.type === 'blob') {
            isLoadingRef.current = true;
            downloadSave(parsed.id).then((saveData) => {
                if (loadGame(saveData)) {
                    saveToLocalStorage();
                    window.history.replaceState(null, '', window.location.pathname);
                } else {
                    alert('Ошибка загрузки сохранения: неверный код.');
                    loadFromLocalStorage();
                }
            }).catch(() => {
                alert('Не удалось загрузить сохранение с сервера.');
                loadFromLocalStorage();
            }).finally(() => {
                isLoadingRef.current = false;
            });
        } else if (parsed?.type === 'inline') {
            if (loadGame(parsed.data)) {
                saveToLocalStorage();
                window.history.replaceState(null, '', window.location.pathname);
            } else {
                alert('Ошибка загрузки сохранения: неверный код.');
            }
        } else {
            loadFromLocalStorage();
        }
    }, []);

    // Auto-Save Game Logic (localStorage) — suppressed while loading from blob
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (!isLoadingRef.current) {
                saveToLocalStorage();
            }
        }, 1000); // Debounce 1s

        return () => clearTimeout(timer);
    }, [gameState, player, quests, network, windows]);

    // Game Clock (1 game minute per 1 real second * timeSpeed)
    React.useEffect(() => {
        const timeSpeed = gameState.timeSpeed || 1;
        
        const clockInterval = setInterval(() => {
            // Only advance time if not game over
            if (!gameState.gameOver) {
                // Calculate next tick
                const { newMinutes, newTimeString, newPhase, newZMH, daysAdvanced, atmosphereDelta } = 
                    computeTickEffects(gameState.timeMinutes, 1 * timeSpeed, network.connected);

                // Dispatch updates
                dispatch(setTimeMinutesAction(newMinutes));
                dispatch(advanceTimeAction(newTimeString));
                
                if (gameState.phase !== newPhase) {
                    dispatch(setPhaseAction(newPhase));
                }
                
                if (gameState.zmh !== newZMH) {
                    dispatch(setZMHAction(newZMH));
                }

                if (daysAdvanced > 0) {
                    dispatch(advanceDayAction(daysAdvanced));
                }
                
                if (atmosphereDelta !== 0) {
                    dispatch(updateStatAction({ stat: 'atmosphere', value: atmosphereDelta }));
                }
            }
        }, 1000);

        return () => clearInterval(clockInterval);
    }, [dispatch, gameState.gameOver, gameState.timeMinutes, gameState.phase, gameState.zmh, gameState.timeSpeed, network.connected]);

    // Setup global quest event listeners
    React.useEffect(() => {
        const actions = {
            completeQuest: completeQuestAction,
            setActiveQuest: setActiveQuestAction,
            updateSkill: updateSkillAction,
            setAct: setActAction,
            completeStep: completeStepAction,
        };
        const cleanup = setupQuestListeners(dispatch, actions, () => ({ quests: quests })); 
        
        // Listen for UI triggers
        const startTossing = () => setMailTossingActive(true);
        const unsubscribeTossing = eventBus.subscribe(UI_START_MAIL_TOSSING, startTossing);

        const openWindowHandler = (payload) => {
            const { windowId } = payload;
            const definition = WINDOW_DEFINITIONS[windowId];
            if (definition) {
                dispatch(openWindow(definition));
            }
        };
        const unsubscribeOpenWindow = eventBus.subscribe(UI_OPEN_WINDOW, openWindowHandler);

        const stepHandler = (payload) => {
            if (payload && payload.stepDescription) {
                setQuestToasts(prev => [...prev, {
                    id: Date.now(),
                    message: payload.stepDescription,
                }]);
            }
        };
        const unsubscribeStep = eventBus.subscribe(QUEST_STEP_COMPLETED, stepHandler);

        return () => {
            cleanup();
            unsubscribeTossing();
            unsubscribeOpenWindow();
            unsubscribeStep();
        };
    }, [dispatch, quests]);

    const hasSoftware = (name) => inventory.includes(name);

    // Open terminal on first load
    React.useEffect(() => {
        if (Object.keys(windows).length === 0) {
            dispatch(openWindow(WINDOW_DEFINITIONS.terminal));
        }
    }, [dispatch, windows]);

    const handleOpenWindow = (windowId) => {
        const definition = WINDOW_DEFINITIONS[windowId];
        if (definition) {
            dispatch(openWindow(definition));
        }
    };

    const handleResetGame = () => {
        if (confirm('Вы уверены, что хотите сбросить весь прогресс и начать заново?')) {
            isLoadingRef.current = true; // Suppress auto-save during reset
            clearLocalStorage();
            window.history.replaceState(null, '', window.location.pathname);
            window.location.reload();
        }
    };

    const handleMailTossingComplete = React.useCallback(() => {
        setMailTossingActive(false);
        eventBus.publish(MAIL_TOSSING_COMPLETED, {});
    }, []);

    const handleConfigSave = (config) => {
        const actions = {
            completeQuest: completeQuestAction,
            setActiveQuest: setActiveQuestAction,
            updateSkill: updateSkillAction,
            setAct: setActAction,
        };

        const result = handleTMailConfigComplete(config, fs, quests, dispatch, actions);

        if (!result.success) {
            return { error: result.error };
        }

        const configContent = generateTMailConfig(config);
        fs.writeFile('C:\\FIDO\\T-MAIL.CTL', configContent);

        return { success: true };
    };

    const handleGoldEDSave = (config) => {
        const actions = {
            completeQuest: completeQuestAction,
            setActiveQuest: setActiveQuestAction,
            updateSkill: updateSkillAction,
            setAct: setActAction,
        };

        const result = handleGoldEDConfigComplete(config, quests, dispatch, actions);

        if (!result.success) {
            return { error: result.error };
        }

        const configContent = [
            '; GoldED Configuration',
            `USERNAME ${config.username}`,
            `REALNAME ${config.realname || config.username}`,
            `ADDRESS ${config.address}`,
            `ORIGIN ${config.origin || 'FidoNet Point'}`,
            '',
        ].join('\n');
        fs.writeFile('C:\\FIDO\\GOLDED.CFG', configContent);

        if (result.triggerAnimation) {
            setTimeout(() => {
                setMailTossingActive(true);
            }, 1500);
        }

        return { success: true };
    };

    const handleBinkleySave = (config) => {
        const actions = {
            completeQuest: completeQuestAction,
            setActiveQuest: setActiveQuestAction,
            updateSkill: updateSkillAction,
            setAct: setActAction,
        };

        const result = handleBinkleyConfigComplete(config, quests, dispatch, actions);

        if (!result.success) {
            return { error: result.error };
        }

        const configContent = [
            '; BinkleyTerm Configuration',
            `SYSOP ${config.sysopName}`,
            `ADDRESS ${config.address}`,
            `BAUD ${config.baudRate}`,
            `PORT ${config.port}`,
            `INBOUND ${config.inbound}`,
            `OUTBOUND ${config.outbound}`,
            '',
        ].join('\n');
        fs.writeFile('C:\\FIDO\\BT.CFG', configContent);

        return { success: true };
    };

    const getTMailAddress = () => {
        const tmailConfig = fs.cat('C:\\FIDO\\T-MAIL.CTL');
        if (!tmailConfig.ok) return '';

        const addressLine = tmailConfig.content.split('\n').find(line => line.startsWith('ADDRESS'));
        if (!addressLine) return '';

        return addressLine.split(' ')[1] || '';
    };

    // Рендер содержимого окна по компоненту
    const renderWindowContent = (windowId, component) => {
        switch (component) {
            case 'terminal':
                return <TerminalWindow embedded windowId={windowId} />;

            case 'history-log':
                return <HistoryLogFile />;

            case 'winamp':
                return <Winamp />;

            case 'artmoney':
                return <ArtMoney />;

            case 'tmail-config':
                return (
                    <ConfigEditor
                        onSave={handleConfigSave}
                        windowId={windowId}
                    />
                );

            case 'golded-config':
                return (
                    <GoldEDConfig
                        onSave={handleGoldEDSave}
                        tmailAddress={getTMailAddress()}
                        windowId={windowId}
                    />
                );

            case 'golded-reader':
                return (
                    <GoldED windowId={windowId} />
                );

            case 'radio-market':
                return (
                    <RadioMarket />
                );

            case 'binkley-config':
                return (
                    <BinkleyConfig
                        onSave={handleBinkleySave}
                        windowId={windowId}
                    />
                );

            case 'binkley-term':
                return (
                    <BinkleyTerm />
                );

            case 'quest-journal':
                return (
                    <QuestJournal windowId={windowId} />
                );

            default:
                return <div>Unknown window type</div>;
        }
    };

    return (
        <div className="crt_overlay" style={{ height: '100vh', width: '100vw', backgroundColor: '#008080', position: 'relative' }}>
            <GlobalStyles />
            <ThemeProvider theme={original}>

                {/* Game Over overlay */}
                <GameOverScreen />

                {/* Onboarding overlay */}
                {ENABLE_ONBOARDING && !gameState.onboardingSeen && <Onboarding />}

                <HintSystem />

                {/* Virus Animation overlay */}
                <VirusAnimation
                    stage={gameState.virusStage}
                    onComplete={() => {}}
                />

                {/* Mail Tossing Animation overlay */}
                {mailTossingActive && (
                    <MailTossingAnimation
                        onComplete={handleMailTossingComplete}
                    />
                )}

                {/* Quest Step Toasts */}
                <QuestToast
                    toasts={questToasts}
                    onDismiss={(id) => setQuestToasts(prev => prev.filter(t => t.id !== id))}
                />

                {/* Desktop Icons Area */}
                <DesktopContainer>
                    {/* MS-DOS Prompt (Terminal) */}
                    <DesktopIcon onDoubleClick={() => handleOpenWindow('terminal')}>
                        <div style={{ width: '32px', height: '32px', background: 'black', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>C:\</div>
                        <span>MS-DOS</span>
                    </DesktopIcon>

                    {/* History.txt */}
                    <DesktopIcon onDoubleClick={() => handleOpenWindow('history-log')}>
                        <div style={{ width: '32px', height: '32px', background: 'white', border: '1px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '20px' }}>LOG</div>
                        <span>History.txt</span>
                    </DesktopIcon>

                    {/* Winamp */}
                    <DesktopIcon onDoubleClick={() => handleOpenWindow('winamp')}>
                        <div style={{ width: '32px', height: '32px', background: 'orange', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '10px', fontWeight: 'bold' }}>AMP</div>
                        <span>Winamp</span>
                    </DesktopIcon>

                    {/* ArtMoney */}
                    <DesktopIcon onDoubleClick={() => handleOpenWindow('artmoney')}>
                        <div style={{ width: '32px', height: '32px', background: 'silver', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red', fontSize: '14px', fontWeight: 'bold', fontFamily: 'serif' }}>AM</div>
                        <span>ArtMoney</span>
                    </DesktopIcon>

                    {/* T-Mail Setup */}
                    {hasSoftware('t-mail') && (
                        <DesktopIcon onDoubleClick={() => handleOpenWindow('tmail-config')}>
                            <div style={{ width: '32px', height: '32px', background: 'navy', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'cyan', fontSize: '14px', fontWeight: 'bold' }}>TM</div>
                            <span>Setup.exe</span>
                        </DesktopIcon>
                    )}

                    {/* GoldED */}
                    {hasSoftware('golded') && (
                        quests.completed.includes('configure_golded') ? (
                            <DesktopIcon onDoubleClick={() => handleOpenWindow('golded-reader')}>
                                <div style={{ width: '32px', height: '32px', background: 'gold', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '14px', fontWeight: 'bold' }}>GED</div>
                                <span>GoldED</span>
                            </DesktopIcon>
                        ) : (
                            <DesktopIcon onDoubleClick={() => handleOpenWindow('golded-config')}>
                                <div style={{ width: '32px', height: '32px', background: 'gold', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '14px', fontWeight: 'bold' }}>GED</div>
                                <span>Setup</span>
                            </DesktopIcon>
                        )
                    )}

                    {/* BinkleyTerm */}
                    {hasSoftware('binkley') && (
                        quests.completed.includes('configure_binkley') ? (
                            <DesktopIcon onDoubleClick={() => handleOpenWindow('binkley-term')}>
                                <div style={{ width: '32px', height: '32px', background: 'black', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'lime', fontSize: '14px', fontWeight: 'bold' }}>BT</div>
                                <span>Binkley</span>
                            </DesktopIcon>
                        ) : (
                            <DesktopIcon onDoubleClick={() => handleOpenWindow('binkley-config')}>
                                <div style={{ width: '32px', height: '32px', background: 'black', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'lime', fontSize: '14px', fontWeight: 'bold' }}>BT</div>
                                <span>Setup.exe</span>
                            </DesktopIcon>
                        )
                    )}

                    {/* Quest Journal */}
                    <DesktopIcon onDoubleClick={() => handleOpenWindow('quest-journal')}>
                        <div style={{ width: '32px', height: '32px', background: '#0000AA', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFF00', fontSize: '14px', fontWeight: 'bold' }}>Q</div>
                        <span>Квесты</span>
                    </DesktopIcon>

                    {/* Radio Market */}
                    <DesktopIcon onDoubleClick={() => handleOpenWindow('radio-market')}>
                        <div style={{ width: '32px', height: '32px', background: 'maroon', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>$</div>
                        <span>Рынок</span>
                    </DesktopIcon>
                </DesktopContainer>

                {/* Render all open windows */}
                {Object.values(windows).filter(w => w.isOpen && !w.isMinimized).map(window => (
                    <DesktopWindow key={window.id} windowId={window.id}>
                        {renderWindowContent(window.id, window.component)}
                    </DesktopWindow>
                ))}

                <TimeControls>
                    <SpeedButton active={!gameState.timeSpeed || gameState.timeSpeed === 1} onClick={() => dispatch(setTimeSpeedAction(1))}>x1</SpeedButton>
                    <SpeedButton active={gameState.timeSpeed === 5} onClick={() => dispatch(setTimeSpeedAction(5))}>x5</SpeedButton>
                    <SpeedButton active={gameState.timeSpeed === 10} onClick={() => dispatch(setTimeSpeedAction(10))}>x10</SpeedButton>
                    <SpeedButton active={gameState.timeSpeed === 50} onClick={() => dispatch(setTimeSpeedAction(50))}>x50</SpeedButton>
                </TimeControls>

                <BuildInfo>
                    Ver: {buildHash}<br/>
                    {buildDate}
                </BuildInfo>

                {/* Taskbar */}
                <AppBar style={{ top: 'auto', bottom: 0, zIndex: 9999 }}>
                    <Toolbar style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {/* Start Menu Button */}
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <Button
                                    onClick={() => {
                                        setStartMenuOpen(!startMenuOpen);
                                        audioManager.init(); // Initialize audio context on user gesture
                                    }}
                                    active={startMenuOpen}
                                    style={{ fontWeight: 'bold' }}
                                >
                                    Пуск
                                </Button>
                                {startMenuOpen && (
                                    <List style={{ position: 'absolute', left: '0', bottom: '100%', zIndex: 9999 }}>
                                        <ListItem onClick={() => { handleOpenWindow('terminal'); setStartMenuOpen(false); }}>
                                            <span role="img" aria-label="terminal" style={{ marginRight: '8px' }}>💻</span>
                                            Терминал Fidonet
                                        </ListItem>
                                        <Divider />
                                        <ListItem onClick={handleResetGame}>
                                            <span role="img" aria-label="shutdown" style={{ marginRight: '8px' }}>🔌</span>
                                            Закончить игру
                                        </ListItem>
                                    </List>
                                )}
                            </div>

                            {/* Window buttons */}
                            {Object.values(windows).filter(w => w.isOpen).map(window => (
                                <TaskbarButton key={window.id} windowId={window.id} />
                            ))}
                        </div>

                        <StatusBar />
                    </Toolbar>
                </AppBar>

            </ThemeProvider>
        </div>
    );
}

export default App;
