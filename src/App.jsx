import React, { useState } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
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
import QuestJournal from './features/quests/QuestJournal';
import { 
    completeQuest as completeQuestAction, 
    setActiveQuest as setActiveQuestAction, 
    updateSkill as updateSkillAction, 
    setAct as setActAction,
    setTimeMinutes as setTimeMinutesAction,
    advanceTime as advanceTimeAction,
    setPhase as setPhaseAction,
    setZMH as setZMHAction,
    advanceDay as advanceDayAction
} from './engine/store';
import { openWindow } from './engine/windowManager';
import { generateTMailConfig } from './engine/configValidator';
import fs from './engine/fileSystemInstance';
import { handleTMailConfigComplete, handleGoldEDConfigComplete } from './domain/quests/service';
import { completeQuestAndProgress } from './engine/questEngine';
import { setupQuestListeners } from './domain/quests/listener';
import { eventBus } from './domain/events/bus';
import { MAIL_TOSSING_COMPLETED, UI_START_MAIL_TOSSING } from './domain/events/types';

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  body, input, select, textarea {
    font-family: 'ms_sans_serif';
  }
`;

// Определение всех окон приложения
const WINDOW_DEFINITIONS = {
    terminal: {
        id: 'terminal',
        title: 'MS-DOS Prompt - C:\\',
        component: 'terminal',
        position: { x: 100, y: 100 },
        size: { width: 640, height: 480 },
    },
    readme: {
        id: 'readme',
        title: 'Notepad - Readme.txt',
        component: 'readme',
        position: { x: 150, y: 150 },
        size: { width: 400, height: 300 },
    },
    'tmail-config': {
        id: 'tmail-config',
        title: 'T-Mail Setup',
        component: 'tmail-config',
        position: { x: 200, y: 100 },
        size: { width: 600, height: 500 },
    },
    'golded-config': {
        id: 'golded-config',
        title: 'GoldED Setup',
        component: 'golded-config',
        position: { x: 250, y: 150 },
        size: { width: 600, height: 500 },
    },
    'golded-reader': {
        id: 'golded-reader',
        title: 'GoldED 2.50+',
        component: 'golded-reader',
        position: { x: 150, y: 100 },
        size: { width: 800, height: 600 },
    },
    'radio-market': {
        id: 'radio-market',
        title: 'Радиорынок - Мир Электроники',
        component: 'radio-market',
        position: { x: 100, y: 50 },
        size: { width: 600, height: 500 },
    },
    'quest-journal': {
        id: 'quest-journal',
        title: 'Журнал квестов',
        component: 'quest-journal',
        position: { x: 150, y: 100 },
        size: { width: 700, height: 500 },
    },
};

function App() {
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    const [mailTossingActive, setMailTossingActive] = useState(false);

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

    const getTMailAddress = () => {
        const tmailConfig = fs.cat('C:\\FIDO\\T-MAIL.CTL');
        if (!tmailConfig.ok) return '';

        const addressLine = tmailConfig.content.split('\n').find(line => line.startsWith('ADDRESS'));
        if (!addressLine) return '';

        return addressLine.split(' ')[1] || '';
    };

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
        setStartMenuOpen(false);
        alert(`Квест "${quests.active}" пропущен!`);
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

            case 'quest-journal':
                return (
                    <QuestJournal />
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

                {/* Taskbar */}
                <AppBar style={{ top: 'auto', bottom: 0, zIndex: 9999 }}>
                    <Toolbar style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {/* Start Menu Button */}
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <Button
                                    onClick={() => setStartMenuOpen(!startMenuOpen)}
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
                                        <Divider />
                                        <ListItem onClick={handleSkipQuest} style={{ color: '#FF0000', fontWeight: 'bold' }}>
                                            [DEBUG] Пропустить квест
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