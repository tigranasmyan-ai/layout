import React, { useState, useCallback, useEffect, useReducer } from 'react'
import Sidebar from './components/Sidebar'
import Canvas from './canvas/Canvas'
import CodeModal from './components/CodeModal'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import './App.css'

const STORAGE_KEY = 'flex-architect-state-v1';

const theme = createTheme({
    primaryColor: 'indigo',
    fontFamily: 'Inter, sans-serif',
})

// Пытаемся загрузить начальные данные из localStorage
const getInitialBlocks = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) {
        console.error("❌ Failed to load from storage:", e);
    }
    return [];
};

const initialState = {
    blocks: getInitialBlocks(),
    history: [getInitialBlocks()],
    index: 0
};

function reducer(state, action) {
    switch (action.type) {
        case 'PUSH_BLOCKS': {
            try {
                const nextBlocks = typeof action.payload === 'function' 
                    ? action.payload(state.blocks) 
                    : action.payload;

                if (!Array.isArray(nextBlocks)) return state;

                // Сохраняем в localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBlocks));

                const newHistory = state.history.slice(0, state.index + 1);
                newHistory.push(nextBlocks);
                if (newHistory.length > 50) newHistory.shift();

                return {
                    ...state,
                    blocks: nextBlocks,
                    history: newHistory,
                    index: newHistory.length - 1
                };
            } catch (err) {
                return state;
            }
        }
        case 'UNDO': {
            if (state.index > 0) {
                const nextIndex = state.index - 1;
                const nextBlocks = state.history[nextIndex];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBlocks));
                return { ...state, blocks: nextBlocks, index: nextIndex };
            }
            return state;
        }
        case 'REDO': {
            if (state.index < state.history.length - 1) {
                const nextIndex = state.index + 1;
                const nextBlocks = state.history[nextIndex];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBlocks));
                return { ...state, blocks: nextBlocks, index: nextIndex };
            }
            return state;
        }
        case 'CLEAR': {
            localStorage.removeItem(STORAGE_KEY);
            return {
                blocks: [],
                history: [[]],
                index: 0
            };
        }
        default: return state;
    }
}

function App() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [selectedId, setSelectedId] = useState(null);
    const [showCode, setShowCode] = useState(false);

    const pushToHistory = useCallback((newBlocks) => {
        dispatch({ type: 'PUSH_BLOCKS', payload: newBlocks });
    }, []);

    const addBlock = useCallback((parentId = null) => {
        const actualParentId = parentId || selectedId;
        const id = 'block_' + Math.random().toString(36).substr(2, 9);
        
        const newB = {
            id,
            parentId: actualParentId,
            x: actualParentId ? 0 : 100 + (state.blocks.length * 20),
            y: actualParentId ? 0 : 100 + (state.blocks.length * 20),
            w: actualParentId ? 100 : 200,
            h: actualParentId ? 100 : 200,
            meta: {
                direction: 'row',
                justify: 'flex-start',
                align: 'flex-start',
                gap: 0,
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
                margin: { top: 0, right: 0, bottom: 0, left: 0 }
            }
        }
        pushToHistory([...state.blocks, newB]);
        setSelectedId(id);
    }, [selectedId, state.blocks, pushToHistory]);

    useEffect(() => {
        const handleKeys = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                const deleteRecursive = (id, currentBlocks) => {
                    let res = currentBlocks.filter(b => b.id !== id);
                    const children = currentBlocks.filter(b => b.parentId === id);
                    children.forEach(child => { res = deleteRecursive(child.id, res); });
                    return res;
                };
                pushToHistory(prev => deleteRecursive(selectedId, prev));
                setSelectedId(null);
            }
            if (e.metaKey || e.ctrlKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    setSelectedId(null); // Снимаем выделение
                    if (e.shiftKey) dispatch({ type: 'REDO' });
                    else dispatch({ type: 'UNDO' });
                }
            }
        }
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [selectedId, pushToHistory]);

    const activeBlock = Array.isArray(state.blocks) 
        ? state.blocks.find(b => b && b.id === selectedId) 
        : null;

    return (
        <MantineProvider theme={theme} defaultColorScheme="dark">
            <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0c' }}>
                <Sidebar 
                    activeShape={activeBlock}
                    shapes={state.blocks}
                    onSelect={setSelectedId}
                    onAddBlock={addBlock}
                    onShowCode={() => setShowCode(true)}
                    onClear={() => {
                        if (confirm('Are you sure you want to clear the canvas?')) {
                            dispatch({ type: 'CLEAR' });
                            setSelectedId(null);
                        }
                    }}
                />
                
                <Canvas 
                    blocks={state.blocks}
                    setBlocks={pushToHistory}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onAddBlock={addBlock}
                />

                <CodeModal 
                    opened={showCode} 
                    onClose={() => setShowCode(false)} 
                    blocks={state.blocks} 
                />
            </div>
        </MantineProvider>
    )
}

export default App
