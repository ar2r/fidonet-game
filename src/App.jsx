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
import DistrictMap from './components/TUI/DistrictMap';
import VirusAnimation from './components/VirusAnimation';
import MailTossingAnimation from './components/MailTossingAnimation';
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
    setAct as setActAction
} from './engine/store';
import { openWindow } from './engine/windowManager';
import { generateTMailConfig } from './engine/configValidator';
import fs from './engine/fileSystemInstance';
import { handleTMailConfigComplete, handleGoldEDConfigComplete, handleBinkleyConfigComplete } from './domain/quests/service';
import { setupQuestListeners } from './domain/quests/listener';
import { eventBus } from './domain/events/bus';
import { MAIL_TOSSING_COMPLETED, UI_START_MAIL_TOSSING } from './domain/events/types';
import { audioManager } from './engine/audio/AudioManager';
import { WINDOW_DEFINITIONS } from './config/windows';

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  body, input, select, textarea {
    font-family: 'ms_sans_serif';
  }
`;

const BuildInfo = styled.div`
  position: absolute;
  bottom: 35px;
  right: 8px;
  color: rgba(255, 255, 255, 0.3);
  font-family: 'ms_sans_serif';
  font-size: 10px;
  text-align: right;
  z-index: 0;
  pointer-events: none;
  line-height: 1.2;
`;

function App() {
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    const [mailTossingActive, setMailTossingActive] = useState(false);

    // eslint-disable-next-line no-undef
    const buildHash = __COMMIT_HASH__;
    // eslint-disable-next-line no-undef
    const buildDate = __BUILD_DATE__;

    const dispatch = useDispatch();
    const inventory = useSelector(state => state.player.inventory);
    const quests = useSelector(state => state.quests);
    const gameState = useSelector(state => state.gameState);
    const windows = useSelector(state => state.windowManager.windows);

    // Setup global quest event listeners
    React.useEffect(() => {
        const actions = {
            completeQuest: completeQuestAction,
            setActiveQuest: setActiveQuestAction,
            updateSkill: updateSkillAction,
            setAct: setActAction,
        };
        const cleanup = setupQuestListeners(dispatch, actions, () => ({ quests: quests })); 
        
        // Listen for UI triggers
        const startTossing = () => setMailTossingActive(true);
        const unsubscribeTossing = eventBus.subscribe(UI_START_MAIL_TOSSING, startTossing);

        return () => {
            cleanup();
            unsubscribeTossing();
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
                return <TerminalWindow embedded />;

            case 'readme':
                return (
                    <div style={{ fontFamily: 'ms_sans_serif', lineHeight: '1.5', padding: '10px' }}>
                        <p>Привет, странник!</p>
                        <br />
                        <p>Если ты читаешь это, значит ты готов погрузиться в мир Фидонета.</p>
                        <p>Для начала тебе нужно подключиться к нашей локальной BBS.</p>
                        <br />
                        <p>1. Открой <b>Fido.bat</b></p>
                        <p>2. Набери <b>ATZ</b> для инициализации модема</p>
                        <p>3. Набери <b>DIAL 555-3389</b> для подключения</p>
                        <p>4. Зайди в файловую область и скачай софт</p>
                        <br />
                        <p>Удачи в Сети!</p>
                        <p><i>-- SysOp</i></p>
                    </div>
                );

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
                    />
                );

            case 'golded-config':
                return (
                    <GoldEDConfig
                        onSave={handleGoldEDSave}
                        tmailAddress={getTMailAddress()}
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
                    />
                );

            case 'binkley-term':
                return (
                    <BinkleyTerm />
                );

            case 'quest-journal':
                return (
                    <QuestJournal />
                );

            case 'district-map':
                return (
                    <DistrictMap />
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
                {!gameState.onboardingSeen && <Onboarding />}

                <HintSystem />

                {/* Virus Animation overlay */}
                <VirusAnimation
                    stage={gameState.virusStage}
                    onComplete={() => {}}
                />

                {/* Mail Tossing Animation overlay */}
                {mailTossingActive && (
                    <MailTossingAnimation
                        onComplete={() => {
                            setMailTossingActive(false);
                            eventBus.publish(MAIL_TOSSING_COMPLETED, {});
                        }}
                    />
                )}

                {/* Desktop Icons Area */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
                    {/* Fido.bat (Terminal) */}
                    <div onDoubleClick={() => handleOpenWindow('terminal')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'black', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>C:\</div>
                        <span style={{ background: '#008080', padding: '2px' }}>Fido.bat</span>
                    </div>

                    {/* Readme.txt */}
                    <div onDoubleClick={() => handleOpenWindow('readme')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'white', margin: '0 auto', border: '1px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '20px' }}>TXT</div>
                        <span style={{ background: '#008080', padding: '2px' }}>Readme.txt</span>
                    </div>

                    {/* History.txt */}
                    <div onDoubleClick={() => handleOpenWindow('history-log')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'white', margin: '0 auto', border: '1px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '20px' }}>LOG</div>
                        <span style={{ background: '#008080', padding: '2px' }}>History.txt</span>
                    </div>

                    {/* Map */}
                    <div onDoubleClick={() => handleOpenWindow('district-map')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: '#333399', margin: '0 auto', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>MAP</div>
                        <span style={{ background: '#008080', padding: '2px' }}>Карта</span>
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
                {Object.values(windows).map(window => (
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
                                            Терминал Фидонет
                                        </ListItem>
                                        <ListItem onClick={() => { handleOpenWindow('district-map'); setStartMenuOpen(false); }}>
                                            Карта района
                                        </ListItem>
                                        <Divider />
                                        <ListItem disabled>
                                            Завершение работы...
                                        </ListItem>
                                    </List>
                                )}
                            </div>

                            {/* Window buttons */}
                            {Object.keys(windows).map(windowId => (
                                <TaskbarButton key={windowId} windowId={windowId} />
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
