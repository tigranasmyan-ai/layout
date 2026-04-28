import React, { useState, useCallback, useEffect, useReducer } from 'react'
import Sidebar from './components/Sidebar'
import Canvas from './canvas/Canvas'
import CodeModal from './components/CodeModal'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import './App.css'

const theme = createTheme({
    primaryColor: 'indigo',
    fontFamily: 'Inter, sans-serif',
})

const initialState = {
    blocks: [],
    history: [[]],
    index: 0
};

function reducer(state, action) {
    switch (action.type) {
        case 'PUSH_BLOCKS': {
            try {
                const nextBlocks = typeof action.payload === 'function' 
                    ? action.payload(state.blocks) 
                    : action.payload;

                // Валидация данных
                if (!Array.isArray(nextBlocks)) {
                    console.error("❌ Reducer error: Payload is not an array", nextBlocks);
                    return state;
                }

                const newHistory = state.history.slice(0, state.index + 1);
                newHistory.push(nextBlocks);
                
                // Ограничиваем историю 50 шагами
                if (newHistory.length > 50) newHistory.shift();

                return {
                    ...state,
                    blocks: nextBlocks,
                    history: newHistory,
                    index: newHistory.length - 1
                };
            } catch (err) {
                console.error("❌ Reducer crash prevented:", err);
                return state;
            }
        }
        case 'UNDO': {
            if (state.index > 0) {
                const nextIndex = state.index - 1;
                return {
                    ...state,
                    blocks: state.history[nextIndex],
                    index: nextIndex
                };
            }
            return state;
        }
        case 'REDO': {
            if (state.index < state.history.length - 1) {
                const nextIndex = state.index + 1;
                return {
                    ...state,
                    blocks: state.history[nextIndex],
                    index: nextIndex
                };
            }
            return state;
        }
        case 'RESET': return initialState;
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

    // Удаление через Delete
    useEffect(() => {
        const handleKeys = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                // Если мы в инпуте - не удаляем
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                
                const deleteRecursive = (id, currentBlocks) => {
                    let res = currentBlocks.filter(b => b.id !== id);
                    const children = currentBlocks.filter(b => b.parentId === id);
                    children.forEach(child => {
                        res = deleteRecursive(child.id, res);
                    });
                    return res;
                };
                
                pushToHistory(prev => deleteRecursive(selectedId, prev));
                setSelectedId(null);
            }
            // Undo/Redo
            if (e.metaKey || e.ctrlKey) {
                if (e.key === 'z') {
                    e.preventDefault();
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
                    onMetaUpdate={(updates, id) => {
                        pushToHistory(prev => prev.map(b => b.id === id ? { ...b, meta: { ...b.meta, ...updates } } : b));
                    }}
                />
                
                <Canvas 
                    blocks={state.blocks}
                    setBlocks={pushToHistory}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
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
