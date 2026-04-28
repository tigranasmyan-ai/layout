import React, { useState, useCallback, useEffect, useReducer } from 'react'
import Sidebar from './components/Sidebar'
import Canvas from './canvas/Canvas'
import CodeModal from './components/CodeModal'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import './App.css'

import { layoutReducer, initialState } from './store/layoutReducer'
import { DEFAULT_BLOCK_META, COLORS } from './constants'

const theme = createTheme({
    primaryColor: 'indigo',
    fontFamily: 'Inter, sans-serif',
})

function App() {
    const [state, dispatch] = useReducer(layoutReducer, initialState);
    const [selectedId, setSelectedId] = useState(null);
    const [showCode, setShowCode] = useState(false);

    const pushToHistory = useCallback((newBlocksOrFunc) => {
        dispatch({ 
            type: 'PUSH_BLOCKS', 
            payload: typeof newBlocksOrFunc === 'function' ? newBlocksOrFunc(state.blocks) : newBlocksOrFunc 
        });
    }, [state.blocks]);

    const updateBlueprint = useCallback((payload) => {
        dispatch({ type: 'UPDATE_BLUEPRINT', payload });
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
            meta: { ...DEFAULT_BLOCK_META }
        }
        pushToHistory([...state.blocks, newB]);
        setSelectedId(id);
    }, [selectedId, state.blocks, pushToHistory]);

    const updateBlockMeta = useCallback((id, key, value) => {
        const newBlocks = state.blocks.map(b => b && b.id === id ? { ...b, meta: { ...b.meta, [key]: value } } : b);
        pushToHistory(newBlocks);
    }, [state.blocks, pushToHistory]);

    const deleteBlocks = useCallback((idsString) => {
        if (!idsString) return;
        const idsToDelete = idsString.split(',');
        const deleteRecursive = (ids, currentBlocks) => {
            let res = currentBlocks;
            ids.forEach(id => {
                const children = res.filter(b => b && b.parentId === id);
                if (children.length > 0) res = deleteRecursive(children.map(c => c.id), res);
                res = res.filter(b => b && b.id !== id);
            });
            return res;
        };
        pushToHistory(deleteRecursive(idsToDelete, state.blocks));
        setSelectedId(null);
    }, [state.blocks, pushToHistory]);

    useEffect(() => {
        const handleKeys = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                deleteBlocks(selectedId);
            }
            if (e.metaKey || e.ctrlKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    setSelectedId(null);
                    if (e.shiftKey) dispatch({ type: 'REDO' });
                    else dispatch({ type: 'UNDO' });
                }
            }
        }
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [selectedId, deleteBlocks]);

    const firstId = selectedId?.split(',')[0];
    const activeBlock = state.blocks.find(b => b && b.id === firstId);

    return (
        <MantineProvider theme={theme} defaultColorScheme="dark">
            <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: COLORS.bg }}>
                <Sidebar 
                    activeShape={activeBlock}
                    shapes={state.blocks}
                    onSelect={setSelectedId}
                    onAddBlock={addBlock}
                    onUpdateMeta={updateBlockMeta}
                    onShowCode={() => setShowCode(true)}
                    blueprint={state.blueprint}
                    onUpdateBlueprint={updateBlueprint}
                    onClear={() => {
                        if (confirm('Clear everything?')) {
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
                    blueprint={state.blueprint}
                    onUpdateBlueprint={updateBlueprint}
                />

                <CodeModal opened={showCode} onClose={() => setShowCode(false)} blocks={state.blocks} />
            </div>
        </MantineProvider>
    )
}

export default App
