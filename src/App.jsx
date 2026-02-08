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
import RadioMarket from './components/TUI/RadioMarket';
import VirusAnimation from './components/VirusAnimation';
import MailTossingAnimation from './components/MailTossingAnimation';
import SaveNotification from './components/SaveNotification';
import QuestJournal from './features/quests/QuestJournal';
import HistoryLogFile from './components/HistoryLogFile';
import Winamp from './components/Winamp';
import ArtMoney from './components/ArtMoney';
import Onboarding from './components/Onboarding';
import { HintSystem } from './components/HintSystem';
import {
    completeQuest as completeQuestAction,
    setActiveQuest as setActiveQuestAction,
    updateSkill as updateSkillAction,
    setAct as setActAction,
    completeStep as completeStepAction
} from './engine/store';
import { openWindow } from './engine/windowManager';
import { generateTMailConfig } from './engine/configValidator';
import fs from './engine/fileSystemInstance';
import { handleTMailConfigComplete, handleGoldEDConfigComplete, handleBinkleyConfigComplete } from './domain/quests/service';
import { setupQuestListeners } from './domain/quests/listener';
import { eventBus } from './domain/events/bus';
import { MAIL_TOSSING_COMPLETED, UI_START_MAIL_TOSSING, UI_OPEN_WINDOW, GAME_NOTIFICATION } from './domain/events/types';
import { audioManager } from './engine/audio/AudioManager';
import { WINDOW_DEFINITIONS } from './config/windows';
import { loadGame, getSaveLink, shortenLink, saveGame } from './engine/saveSystem';

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  body, input, select, textarea {
    font-family: 'ms_sans_serif';
  }
`;

const ENABLE_ONBOARDING = true;

const BuildInfo = styled.div`
  position: absolute;
  bottom: 35px;
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

function App() {
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    const [mailTossingActive, setMailTossingActive] = useState(false);
    const [saveNotification, setSaveNotification] = useState(null); // { message: string } | null

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

    // Load Game on Mount
    React.useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#save=')) {
            const encoded = hash.substring(6);
            if (loadGame(encoded)) {
                // Keep the hash so reloading works, but notify success
                // window.history.replaceState(null, '', window.location.pathname); // Removing creates loop if we auto-save immediately
                // Instead, just load. Auto-save will overwrite it later with current state.
                console.log('Game loaded from URL');
            } else {
                alert('Ошибка загрузки сохранения: неверный код.');
            }
        }
    }, []);

    // Auto-Save Game Logic (Update URL hash)
    React.useEffect(() => {
        const timer = setTimeout(() => {
            const saveString = saveGame();
            if (saveString) {
                const newHash = `#save=${saveString}`;
                if (window.location.hash !== newHash) {
                    window.history.replaceState(null, '', newHash);
                }
            }
        }, 1000); // Debounce 1s

        return () => clearTimeout(timer);
    }, [gameState, player, quests, network, windows]);

    const handleSaveGame = async () => {
        const longLink = getSaveLink();
        if (!longLink) return;

        // Optimistic UI: Copy long link first (fastest)
        // navigator.clipboard.writeText(longLink);
        
        // Try to shorten
        // Show some feedback? For now, we just wait.
        // Or prompt user?
        // Let's try to shorten immediately.
        
        try {
            const shortLink = await shortenLink(longLink);
            navigator.clipboard.writeText(shortLink).then(() => {
                setSaveNotification({ message: `Ссылка скопирована!\n${shortLink}` });
            }).catch(() => {
                setSaveNotification({ message: `Скопируйте ссылку:\n${shortLink}` });
            });
        } catch {
            // Fallback to long link
            setSaveNotification({ message: `Не удалось сократить ссылку.\nСкопируйте длинную версию:\n${longLink}` });
        }
    };

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

        const notificationHandler = (payload) => {
            if (payload && payload.messages) {
                const questMsg = payload.messages.find(m => m.includes('КВЕСТ ВЫПОЛНЕН'));
                if (questMsg) {
                    const titleLine = payload.messages.find(m => m.includes('"'));
                    setSaveNotification({ message: `Квест выполнен!\n${titleLine || ''}` });
                }
            }
        };
        const unsubscribeNotification = eventBus.subscribe(GAME_NOTIFICATION, notificationHandler);

        return () => {
            cleanup();
            unsubscribeTossing();
            unsubscribeOpenWindow();
            unsubscribeNotification();
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
                    <GoldED />
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

                {/* Save Notification overlay */}
                {saveNotification && (
                    <SaveNotification
                        message={saveNotification.message}
                        onClose={() => setSaveNotification(null)}
                    />
                )}

                {/* Desktop Icons Area */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
                    {/* MS-DOS Prompt (Terminal) */}
                    <div onDoubleClick={() => handleOpenWindow('terminal')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'black', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>C:\</div>
                        <span style={{ background: '#008080', padding: '2px' }}>MS-DOS Prompt</span>
                    </div>

                    {/* History.txt */}
                    <div onDoubleClick={() => handleOpenWindow('history-log')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'white', margin: '0 auto', border: '1px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '20px' }}>LOG</div>
                        <span style={{ background: '#008080', padding: '2px' }}>History.txt</span>
                    </div>

                    {/* Winamp */}
                    <div onDoubleClick={() => handleOpenWindow('winamp')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'orange', margin: '0 auto', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '10px', fontWeight: 'bold' }}>AMP</div>
                        <span style={{ background: '#008080', padding: '2px' }}>Winamp</span>
                    </div>

                    {/* ArtMoney */}
                    <div onDoubleClick={() => handleOpenWindow('artmoney')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'silver', margin: '0 auto', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red', fontSize: '14px', fontWeight: 'bold', fontFamily: 'serif' }}>AM</div>
                        <span style={{ background: '#008080', padding: '2px' }}>ArtMoney</span>
                    </div>

                    {/* Save Game */}
                    <div onDoubleClick={handleSaveGame} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'blue', margin: '0 auto', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>💾</div>
                        <span style={{ background: '#008080', padding: '2px' }}>SAVE.EXE</span>
                    </div>

                    {/* T-Mail Setup */}
                    {hasSoftware('t-mail') && (
                        <div onDoubleClick={() => handleOpenWindow('tmail-config')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                            <div style={{ width: '32px', height: '32px', background: 'navy', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'cyan', fontSize: '14px', fontWeight: 'bold' }}>TM</div>
                            <span style={{ background: '#008080', padding: '2px' }}>Setup.exe</span>
                        </div>
                    )}

                    {/* GoldED */}
                    {hasSoftware('golded') && (
                        quests.completed.includes('configure_golded') ? (
                            <div onDoubleClick={() => handleOpenWindow('golded-reader')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                                <div style={{ width: '32px', height: '32px', background: 'gold', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '14px', fontWeight: 'bold' }}>GED</div>
                                <span style={{ background: '#008080', padding: '2px' }}>GoldED</span>
                            </div>
                        ) : (
                            <div onDoubleClick={() => handleOpenWindow('golded-config')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                                <div style={{ width: '32px', height: '32px', background: 'gold', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '14px', fontWeight: 'bold' }}>GED</div>
                                <span style={{ background: '#008080', padding: '2px' }}>Setup</span>
                            </div>
                        )
                    )}

                    {/* BinkleyTerm */}
                    {hasSoftware('binkley') && (
                        quests.completed.includes('configure_binkley') ? (
                            <div onDoubleClick={() => handleOpenWindow('binkley-term')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                                <div style={{ width: '32px', height: '32px', background: 'black', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'lime', fontSize: '14px', fontWeight: 'bold' }}>BT</div>
                                <span style={{ background: '#008080', padding: '2px' }}>Binkley</span>
                            </div>
                        ) : (
                            <div onDoubleClick={() => handleOpenWindow('binkley-config')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                                <div style={{ width: '32px', height: '32px', background: 'black', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'lime', fontSize: '14px', fontWeight: 'bold' }}>BT</div>
                                <span style={{ background: '#008080', padding: '2px' }}>Setup.exe</span>
                            </div>
                        )
                    )}

                    {/* Quest Journal */}
                    <div onDoubleClick={() => handleOpenWindow('quest-journal')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: '#0000AA', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFF00', fontSize: '14px', fontWeight: 'bold' }}>Q</div>
                        <span style={{ background: '#008080', padding: '2px' }}>Квесты</span>
                    </div>

                    {/* Radio Market */}
                    <div onDoubleClick={() => handleOpenWindow('radio-market')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'maroon', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>$</div>
                        <span style={{ background: '#008080', padding: '2px' }}>Рынок</span>
                    </div>
                </div>

                {/* Render all open windows */}
                {Object.values(windows).filter(w => w.isOpen && !w.isMinimized).map(window => (
                    <DesktopWindow key={window.id} windowId={window.id}>
                        {renderWindowContent(window.id, window.component)}
                    </DesktopWindow>
                ))}

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
                                            Терминал Fidonet
                                        </ListItem>
                                        <Divider />
                                        <ListItem disabled>
                                            Завершение работы...
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
