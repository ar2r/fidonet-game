import { createSlice } from '@reduxjs/toolkit';

/**
 * Window Manager Slice
 * Управляет всеми окнами на десктопе: позиции, размеры, z-index, минимизация
 */

const initialState = {
    windows: {},
    activeWindow: null,
    nextZIndex: 1,
};

const windowManagerSlice = createSlice({
    name: 'windowManager',
    initialState,
    reducers: {
        openWindow(state, action) {
            const { id, title, component, position, size } = action.payload;

            if (!state.windows[id]) {
                // Новое окно - создать с дефолтными позицией и размером
                state.windows[id] = {
                    id,
                    title,
                    component,
                    isOpen: true,
                    isMinimized: false,
                    position: position || { x: 100 + state.nextZIndex * 20, y: 100 + state.nextZIndex * 20 },
                    size: size || { width: 640, height: 480 },
                    zIndex: state.nextZIndex,
                };
                state.nextZIndex += 1;
                state.activeWindow = id;
            } else if (!state.windows[id].isOpen) {
                // Окно было закрыто - восстановить с сохраненными позицией и размером
                state.windows[id].isOpen = true;
                state.windows[id].isMinimized = false;
                state.windows[id].zIndex = state.nextZIndex;
                state.nextZIndex += 1;
                state.activeWindow = id;
            } else if (state.windows[id].isMinimized) {
                // Восстановить минимизированное окно
                state.windows[id].isMinimized = false;
                state.windows[id].zIndex = state.nextZIndex;
                state.nextZIndex += 1;
                state.activeWindow = id;
            } else {
                // Окно уже открыто - поднять наверх
                state.windows[id].zIndex = state.nextZIndex;
                state.nextZIndex += 1;
                state.activeWindow = id;
            }
        },

        closeWindow(state, action) {
            const id = action.payload;
            if (state.windows[id]) {
                // Не удаляем окно, а только закрываем (сохраняем позицию и размер)
                state.windows[id].isOpen = false;
                state.windows[id].isMinimized = false;

                if (state.activeWindow === id) {
                    // Найти окно с максимальным z-index среди открытых
                    const openWindows = Object.values(state.windows).filter(w => w.isOpen && !w.isMinimized);
                    if (openWindows.length > 0) {
                        const topWindow = openWindows.reduce((max, w) => w.zIndex > max.zIndex ? w : max);
                        state.activeWindow = topWindow.id;
                    } else {
                        state.activeWindow = null;
                    }
                }
            }
        },

        minimizeWindow(state, action) {
            const id = action.payload;
            if (state.windows[id]) {
                state.windows[id].isMinimized = true;
                if (state.activeWindow === id) {
                    // Найти следующее активное окно
                    const openWindows = Object.values(state.windows).filter(w => !w.isMinimized && w.id !== id);
                    if (openWindows.length > 0) {
                        const topWindow = openWindows.reduce((max, w) => w.zIndex > max.zIndex ? w : max);
                        state.activeWindow = topWindow.id;
                    } else {
                        state.activeWindow = null;
                    }
                }
            }
        },

        focusWindow(state, action) {
            const id = action.payload;
            if (state.windows[id] && !state.windows[id].isMinimized) {
                state.windows[id].zIndex = state.nextZIndex;
                state.nextZIndex += 1;
                state.activeWindow = id;
            }
        },

        updateWindowPosition(state, action) {
            const { id, position } = action.payload;
            if (state.windows[id]) {
                state.windows[id].position = position;
            }
        },

        updateWindowSize(state, action) {
            const { id, size } = action.payload;
            if (state.windows[id]) {
                state.windows[id].size = size;
            }
        },

        updateWindowTitle(state, action) {
            const { id, title } = action.payload;
            if (state.windows[id]) {
                state.windows[id].title = title;
            }
        },

        loadState(state, action) {
            return action.payload;
        }
    },
});

export const {
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    updateWindowTitle,
    loadState
} = windowManagerSlice.actions;

export default windowManagerSlice.reducer;
