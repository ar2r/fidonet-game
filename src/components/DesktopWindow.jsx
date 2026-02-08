import React from 'react';
import { Rnd } from 'react-rnd';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import { useDispatch, useSelector } from 'react-redux';
import { closeWindow, minimizeWindow, focusWindow, updateWindowPosition, updateWindowSize } from '../engine/windowManager';

/**
 * DesktopWindow - обертка для react95 Window с поддержкой drag&drop и resize
 * Управляется через Redux windowManager
 */
function DesktopWindow({ windowId, children }) {
    const dispatch = useDispatch();
    const window = useSelector(state => state.windowManager.windows[windowId]);
    const isActive = useSelector(state => state.windowManager.activeWindow === windowId);

    if (!window || !window.isOpen) {
        return null;
    }

    const handleClose = () => {
        dispatch(closeWindow(windowId));
    };

    const handleMinimize = () => {
        dispatch(minimizeWindow(windowId));
    };

    const handleFocus = () => {
        if (!isActive) {
            dispatch(focusWindow(windowId));
        }
    };

    const handleDragStop = (e, d) => {
        dispatch(updateWindowPosition({
            id: windowId,
            position: { x: d.x, y: d.y }
        }));
    };

    const handleResizeStop = (e, direction, ref, delta, position) => {
        dispatch(updateWindowSize({
            id: windowId,
            size: {
                width: ref.style.width,
                height: ref.style.height
            }
        }));
        dispatch(updateWindowPosition({
            id: windowId,
            position
        }));
    };

    return (
        <Rnd
            position={window.position}
            size={window.size}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            minWidth={320}
            minHeight={240}
            bounds="parent"
            dragHandleClassName="window-header"
            style={{ 
                zIndex: window.zIndex,
                display: window.isMinimized ? 'none' : 'block'
            }}
            onMouseDown={handleFocus}
        >
            <Window
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <WindowHeader
                    active={isActive}
                    className="window-header"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'move',
                        userSelect: 'none'
                    }}
                >
                    <span style={{ marginLeft: 4 }}>{window.title}</span>
                    <div style={{ display: 'flex' }}>
                        <Button
                            onClick={handleMinimize}
                            size="sm"
                            square
                            style={{ marginRight: 2 }}
                        >
                            <span style={{ fontWeight: 'bold', transform: 'translateY(-1px)' }}>_</span>
                        </Button>
                        <Button
                            onClick={handleClose}
                            size="sm"
                            square
                            style={{ fontWeight: 'bold' }}
                        >
                            <span style={{ transform: 'translateY(-1px)' }}>×</span>
                        </Button>
                    </div>
                </WindowHeader>
                <WindowContent style={{
                    flex: 1,
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {children}
                </WindowContent>
            </Window>
        </Rnd>
    );
}

export default DesktopWindow;
