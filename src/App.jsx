import React, { useState } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { styleReset } from 'react95';
import original from 'react95/dist/themes/original';
import { AppBar, Toolbar, Button, List, ListItem, Divider } from 'react95';
import { useSelector } from 'react-redux';

import TerminalWindow from './components/TerminalWindow';

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  body, input, select, textarea {
    font-family: 'ms_sans_serif';
  }
`;

function App() {
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    const [activeWindow, setActiveWindow] = useState('terminal'); // 'terminal', 't-mail', 'golded', null
    const inventory = useSelector(state => state.player.inventory);

    const closeWindow = () => setActiveWindow(null);

    const hasSoftware = (name) => inventory.includes(name);

    return (
        <div className="crt_overlay" style={{ height: '100vh', width: '100vw', backgroundColor: '#008080', position: 'relative' }}>
            <GlobalStyles />
            <ThemeProvider theme={original}>

                {/* Desktop Icons Area */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
                    {/* Always available: Fido.bat (Terminal) */}
                    <div onDoubleClick={() => setActiveWindow('terminal')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'black', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>C:\</div>
                        <span style={{ background: '#008080', padding: '2px' }}>Fido.bat</span>
                    </div>

                    {/* Readme.txt */}
                    <div onDoubleClick={() => setActiveWindow('readme')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                        <div style={{ width: '32px', height: '32px', background: 'white', margin: '0 auto', border: '1px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '20px' }}>📄</div>
                        <span style={{ background: '#008080', padding: '2px' }}>Readme.txt</span>
                    </div>

                    {/* T-Mail (Unlocked in Act 2) */}
                    {hasSoftware('t-mail') && (
                        <div onDoubleClick={() => setActiveWindow('t-mail')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                            <div style={{ width: '32px', height: '32px', background: 'navy', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📧</div>
                            <span style={{ background: '#008080', padding: '2px' }}>Setup.exe</span>
                        </div>
                    )}

                    {/* GoldED (Unlocked in Act 2/3) */}
                    {hasSoftware('golded') && (
                        <div onDoubleClick={() => setActiveWindow('golded')} style={{ textAlign: 'center', width: '64px', cursor: 'pointer', color: 'white' }}>
                            <div style={{ width: '32px', height: '32px', background: 'gold', margin: '0 auto', border: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>GED</div>
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
                                <p>Запусти <b>Fido.bat</b> и набери команду:</p>
                                <p style={{ fontWeight: 'bold', fontFamily: 'monospace', margin: '10px 0' }}>dial 555-3389</p>
                                <br />
                                <p>Удачи в Сети!</p>
                                <p><i>-- SysOp</i></p>
                            </div>
                        </WindowContent>
                    </Window>
                )}

                {/* Placeholders for other windows */}
                {activeWindow === 't-mail' && (
                    <Window style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '300px' }}>
                        <WindowHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Установка T-Mail</span>
                            <Button onClick={closeWindow} style={{ marginLeft: 'auto', marginRight: '-6px', marginTop: '1px' }} size="sm" square>
                                <span style={{ fontWeight: 'bold', transform: 'translateY(-1px)' }}>X</span>
                            </Button>
                        </WindowHeader>
                        <WindowContent>
                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <h1>Мастер Установки</h1>
                                <br />
                                <p>Файл конфигурации не найден.</p>
                                <br />
                                <Button onClick={closeWindow}>[ OK ]</Button>
                            </div>
                        </WindowContent>
                    </Window>
                )}
                {activeWindow === 'golded' && (
                    <div style={{ position: 'absolute', top: '20%', left: '25%', width: '600px', height: '400px', background: 'blue', color: 'white', border: '2px solid white', padding: '20px', fontFamily: 'DosVga, monospace' }}>
                        <div style={{ background: 'cyan', color: 'black', padding: '5px', marginBottom: '10px' }}>GoldED 2.50+</div>
                        <p>Эха: SU.FLAME</p>
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
                                <span role="img" aria-label="start" style={{ marginRight: '6px' }}>💻</span>
                                Пуск
                            </Button>
                            {startMenuOpen && (
                                <List style={{ position: 'absolute', left: '0', bottom: '100%', zIndex: 9999 }}>
                                    <ListItem onClick={() => { setActiveWindow('terminal'); setStartMenuOpen(false); }}>
                                        <span role="img" aria-label="terminal">📟</span> Терминал Фидонет
                                    </ListItem>
                                    <Divider />
                                    <ListItem disabled>
                                        <span role="img" aria-label="shutdown">🛑</span> Завершение работы...
                                    </ListItem>
                                </List>
                            )}
                        </div>

                        <div style={{ paddingRight: '10px' }}>
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </Toolbar>
                </AppBar>

            </ThemeProvider>
        </div>
    );
}

export default App;
