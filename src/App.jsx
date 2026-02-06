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
    const inventory = useSelector(state => state.player.inventory);
    const quests = useSelector(state => state.quests);
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

    return (
        <div className="crt_overlay" style={{ height: '100vh', width: '100vw', backgroundColor: '#008080', position: 'relative' }}>
            <GlobalStyles />
            <ThemeProvider theme={original}>

                {/* Game Over overlay */}
                <GameOverScreen />

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
                {activeWindow === 'golded' && (
                    <div style={{ position: 'absolute', top: '20%', left: '25%', width: '600px', height: '400px', background: '#0000AA', color: 'white', border: '2px solid white', padding: '20px', fontFamily: 'DosVga, monospace' }}>
                        <div style={{ background: 'cyan', color: 'black', padding: '5px', marginBottom: '10px' }}>GoldED 2.50+</div>
                        <p>Конфигурация не заполнена.</p>
                        <p>Отредактируйте C:\FIDO\GOLDED.CFG</p>
                        <hr />
                        <p>Нет сообщений.</p>
                        <button onClick={closeWindow} style={{ marginTop: '200px' }}>[ Выход ]</button>
                    </div>
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
