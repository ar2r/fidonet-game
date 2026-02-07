import React from 'react';
import { Button } from 'react95';
import { useDispatch, useSelector } from 'react-redux';
import { openWindow, focusWindow } from '../engine/windowManager';

/**
 * TaskbarButton - кнопка окна в панели задач
 * Показывает открытые окна, позволяет восстанавливать минимизированные
 */
function TaskbarButton({ windowId }) {
    const dispatch = useDispatch();
    const window = useSelector(state => state.windowManager.windows[windowId]);
    const isActive = useSelector(state => state.windowManager.activeWindow === windowId);

    if (!window) {
        return null;
    }

    const handleClick = () => {
        if (window.isMinimized) {
            dispatch(openWindow({ id: windowId }));
        } else if (!isActive) {
            dispatch(focusWindow(windowId));
        }
    };

    return (
        <Button
            onClick={handleClick}
            active={isActive && !window.isMinimized}
            style={{
                maxWidth: '160px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}
        >
            {window.title}
        </Button>
    );
}

export default TaskbarButton;
