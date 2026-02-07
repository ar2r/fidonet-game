import React, { useState } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { styleReset } from 'react95';
import original from 'react95/dist/themes/original';
import { AppBar, Toolbar, Button, List, ListItem, Divider, Window, WindowHeader, WindowContent } from 'react95';
import { useSelector, useDispatch } from 'react-redux';

import TerminalWindow from './components/TerminalWindow';
import StatusBar from './components/StatusBar';
import GameOverScreen from './components/GameOverScreen';
import ConfigEditor from './components/TUI/ConfigEditor';
import GoldEDConfig from './components/TUI/GoldEDConfig';
import VirusAnimation from './components/VirusAnimation';
import MailTossingAnimation from './components/MailTossingAnimation';
import { completeQuest as completeQuestAction, setActiveQuest as setActiveQuestAction, updateSkill as updateSkillAction, setAct as setActAction } from './engine/store';
import { validateTMailConfig, checkConfigCorrectness, generateTMailConfig } from './engine/configValidator';
import fs from './engine/fileSystemInstance';
import { completeQuestAndProgress } from './engine/questEngine';

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  body, input, select, textarea {
    font-family: 'ms_sans_serif';
  }
`;

function App() {
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    const [activeWindow, setActiveWindow] = useState('terminal');
    const [mailTossingActive, setMailTossingActive] = useState(false);
    const inventory = useSelector(state => state.player.inventory);
    const quests = useSelector(state => state.quests);
    const gameState = useSelector(state => state.gameState);
    const dispatch = useDispatch();

    const closeWindow = () => setActiveWindow(null);

    const hasSoftware = (name) => inventory.includes(name);

    const handleConfigSave = (config) => {
        // Validate config format
        const validation = validateTMailConfig(config, fs);
        if (!validation.valid) {
            return { error: validation.errors.join('\n') };
        }

        // Check if config matches correct values
        const correctness = checkConfigCorrectness(config);
        if (!correctness.correct) {
            return { error: 'Конфигурация заполнена, но содержит ошибки.\nПроверьте адрес, пароль и телефон.' };
        }

        // Config is correct! Save it
        const configContent = generateTMailConfig(config);
        fs.writeFile('C:\\FIDO\\T-MAIL.CTL', configContent);

        // Complete configure_tmail quest if active
        if (quests.active === 'configure_tmail') {
            const actions = {
                completeQuest: completeQuestAction,
                setActiveQuest: setActiveQuestAction,
                updateSkill: updateSkillAction,
                setAct: setActAction,
            };
            completeQuestAndProgress('configure_tmail', dispatch, actions);
        }

        return { success: true };
    };

    const handleGoldEDSave = (config) => {
        // Basic validation
        if (!config.username || !config.username.trim()) {
            return { error: 'ОШИБКА: Не указано имя пользователя' };
        }
        if (!config.address || !config.address.trim()) {
            return { error: 'ОШИБКА: Не указан FidoNet адрес' };
        }

        // Generate config file content
        const configContent = [
            '; GoldED Configuration',
            `USERNAME ${config.username}`,
            `REALNAME ${config.realname || config.username}`,
            `ADDRESS ${config.address}`,
            `ORIGIN ${config.origin || 'FidoNet Point'}`,
            '',
        ].join('\n');

        // Save config
        fs.writeFile('C:\\FIDO\\GOLDED.CFG', configContent);

        // Complete configure_golded quest if active
        if (quests.active === 'configure_golded') {
            const actions = {
                completeQuest: completeQuestAction,
                setActiveQuest: setActiveQuestAction,
                updateSkill: updateSkillAction,
                setAct: setActAction,
            };
            completeQuestAndProgress('configure_golded', dispatch, actions);

            // Trigger mail tossing animation after config is saved
            setTimeout(() => {
                setMailTossingActive(true);
            }, 1500);
        }

        return { success: true };
    };

    // Extract T-Mail address from saved config (for GoldED hint)
    const getTMailAddress = () => {
        const tmailConfig = fs.cat('C:\\FIDO\\T-MAIL.CTL');
        if (!tmailConfig.ok) return '';

        const addressLine = tmailConfig.content.split('\n').find(line => line.startsWith('ADDRESS'));
        if (!addressLine) return '';

        return addressLine.split(' ')[1] || '';
    };

    // DEBUG: Skip to next quest
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
                        onComplete={() => setMailTossingActive(false)}
                    />
                )}

                {/* Desktop Icons Area */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
                    {/* Always available: Fido.bat (Terminal) */}
                    <div onDoubleClick={() => setActiveWindow('terminal')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'black', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>C:\</div>
                        <span style={{ background: '#008080', padding: '2px' }}>Fido.bat</span>
                    </div>

                    {/* Readme.txt */}
                    <div onDoubleClick={() => setActiveWindow('readme')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'white', margin: '0 auto', border: '1px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '20px' }}>TXT</div>
                        <span style={{ background: '#008080', padding: '2px' }}>Readme.txt</span>
                    </div>

                    {/* T-Mail (Unlocked after download) */}
                    {hasSoftware('t-mail') && (
                        <div onDoubleClick={() => setActiveWindow('t-mail')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                            <div style={{ width: '32px', height: '32px', background: 'navy', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'cyan', fontSize: '14px', fontWeight: 'bold' }}>TM</div>
                            <span style={{ background: '#008080', padding: '2px' }}>Setup.exe</span>
                        </div>
                    )}

                    {/* GoldED (Unlocked after download) */}
                    {hasSoftware('golded') && (
                        <div onDoubleClick={() => setActiveWindow('golded')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                            <div style={{ width: '32px', height: '32px', background: 'gold', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '14px', fontWeight: 'bold' }}>GED</div>
                            <span style={{ background: '#008080', padding: '2px' }}>GoldED</span>
                        </div>
                    )}
                </div>

                {/* Main Application Windows */}
                {activeWindow === 'terminal' && (
                    <TerminalWindow onClose={closeWindow} />
                )}

                {activeWindow === 'readme' && (
                    <Window style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px' }}>
                        <WindowHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Notepad - Readme.txt</span>
                            <Button onClick={closeWindow} style={{ marginLeft: 'auto', marginRight: '-6px', marginTop: '1px' }} size="sm" square>
                                <span style={{ fontWeight: 'bold', transform: 'translateY(-1px)' }}>X</span>
                            </Button>
                        </WindowHeader>
                        <WindowContent>
                            <div style={{ fontFamily: 'ms_sans_serif', lineHeight: '1.5' }}>
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
                        </WindowContent>
                    </Window>
                )}

                {/* T-Mail Config Editor */}
                {activeWindow === 't-mail' && (
                    <ConfigEditor
                        onClose={closeWindow}
                        onSave={handleConfigSave}
                    />
                )}

                {/* GoldED Config Editor */}
                {activeWindow === 'golded' && (
                    <GoldEDConfig
                        onClose={closeWindow}
                        onSave={handleGoldEDSave}
                        tmailAddress={getTMailAddress()}
                    />
                )}

                {/* Taskbar */}
                <AppBar style={{ top: 'auto', bottom: 0, zIndex: 9999 }}>
                    <Toolbar style={{ justifyContent: 'space-between' }}>
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
                                    <ListItem onClick={() => { setActiveWindow('terminal'); setStartMenuOpen(false); }}>
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

                        <StatusBar />
                    </Toolbar>
                </AppBar>

            </ThemeProvider>
        </div>
    );
}

export default App;
