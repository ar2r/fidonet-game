import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import windowManagerReducer from '../engine/windowManager';

/**
 * Тест изоляции ввода между окнами
 * Проверяет, что клавиатурный ввод обрабатывается только в активном окне
 */

describe('Window Input Isolation', () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                windowManager: windowManagerReducer,
            },
            preloadedState: {
                windowManager: {
                    windows: {
                        terminal: {
                            id: 'terminal',
                            title: 'Terminal',
                            component: 'terminal',
                            isOpen: true,
                            isMinimized: false,
                            position: { x: 0, y: 0 },
                            size: { width: 640, height: 480 },
                            zIndex: 1,
                        },
                        'tmail-config': {
                            id: 'tmail-config',
                            title: 'T-Mail Setup',
                            component: 'tmail-config',
                            isOpen: true,
                            isMinimized: false,
                            position: { x: 100, y: 100 },
                            size: { width: 600, height: 500 },
                            zIndex: 2,
                        },
                    },
                    activeWindow: 'tmail-config', // T-Mail активно
                    nextZIndex: 3,
                },
            },
        });
    });

    it('should only process keyboard input in active window', () => {
        const terminalInputSpy = vi.fn();
        const configInputSpy = vi.fn();

        // Мокируем компоненты с проверкой активности
        const TerminalMock = () => {
            const handleKeyDown = (e) => {
                const activeWindow = store.getState().windowManager.activeWindow;
                if (activeWindow === 'terminal' && e.key.length === 1) {
                    terminalInputSpy(e.key);
                }
            };

            React.useEffect(() => {
                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
            }, []);

            return <div data-testid="terminal">Terminal Window</div>;
        };

        const ConfigMock = () => {
            const handleKeyDown = (e) => {
                const activeWindow = store.getState().windowManager.activeWindow;
                if (activeWindow === 'tmail-config' && e.key.length === 1) {
                    configInputSpy(e.key);
                }
            };

            React.useEffect(() => {
                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
            }, []);

            return <div data-testid="config">Config Window</div>;
        };

        render(
            <Provider store={store}>
                <div>
                    <TerminalMock />
                    <ConfigMock />
                </div>
            </Provider>
        );

        // Симулируем глобальное нажатие клавиши 'a'
        fireEvent.keyDown(window, { key: 'a' });

        // Только активное окно (tmail-config) должно получить событие
        expect(configInputSpy).toHaveBeenCalledWith('a');
        expect(terminalInputSpy).not.toHaveBeenCalled();
    });

    it('should switch active window and process input correctly', () => {
        const terminalInputSpy = vi.fn();
        const configInputSpy = vi.fn();

        const TerminalMock = () => {
            const handleKeyDown = (e) => {
                const activeWindow = store.getState().windowManager.activeWindow;
                if (activeWindow === 'terminal' && e.key.length === 1) {
                    terminalInputSpy(e.key);
                }
            };

            React.useEffect(() => {
                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
            }, []);

            return <div data-testid="terminal">Terminal Window</div>;
        };

        const ConfigMock = () => {
            const handleKeyDown = (e) => {
                const activeWindow = store.getState().windowManager.activeWindow;
                if (activeWindow === 'tmail-config' && e.key.length === 1) {
                    configInputSpy(e.key);
                }
            };

            React.useEffect(() => {
                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
            }, []);

            return <div data-testid="config">Config Window</div>;
        };

        render(
            <Provider store={store}>
                <div>
                    <TerminalMock />
                    <ConfigMock />
                </div>
            </Provider>
        );

        // Сначала активно tmail-config
        fireEvent.keyDown(window, { key: 'a' });
        expect(configInputSpy).toHaveBeenCalledWith('a');
        expect(terminalInputSpy).not.toHaveBeenCalled();

        // Переключаем активное окно на terminal
        store.dispatch({ type: 'windowManager/focusWindow', payload: 'terminal' });

        // Сбрасываем моки
        terminalInputSpy.mockClear();
        configInputSpy.mockClear();

        // Теперь активно terminal
        fireEvent.keyDown(window, { key: 'b' });
        expect(terminalInputSpy).toHaveBeenCalledWith('b');
        expect(configInputSpy).not.toHaveBeenCalled();
    });
});
