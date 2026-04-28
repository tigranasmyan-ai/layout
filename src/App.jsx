import React, { useState, useCallback, useEffect, useReducer, useMemo } from 'react'
import Sidebar from './components/Sidebar'
import Canvas from './canvas/Canvas'
import CodeModal from './components/CodeModal'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import './App.css'

import { layoutReducer, initialState } from './store/layoutReducer'
import { DEFAULT_BLOCK_META, COLORS } from './constants'
import AssetManager from './components/AssetManager';

const theme = createTheme({
    primaryColor: 'indigo',
    fontFamily: 'Inter, sans-serif',
})

function App() {
    const [state, dispatch] = useReducer(layoutReducer, initialState);
    const [selectedId, setSelectedId] = useState(null);
    const [showCode, setShowCode] = useState(false);
    const [assetManagerOpened, setAssetManagerOpened] = useState(false);

    const firstSelectedId = useMemo(() => selectedId?.split(',')[0], [selectedId]);
    const activeShape = useMemo(() => state.blocks.find(b => b && b.id === firstSelectedId), [state.blocks, firstSelectedId]);

    const onAddAsset = (asset) => dispatch({ type: 'ADD_ASSET', payload: asset });
    const onRemoveAsset = (id) => dispatch({ type: 'REMOVE_ASSET', payload: id });

    const pushToHistory = useCallback((newBlocksOrFunc) => {
        dispatch({ 
            type: 'PUSH_BLOCKS', 
            payload: typeof newBlocksOrFunc === 'function' ? newBlocksOrFunc(state.blocks) : newBlocksOrFunc 
        });
    }, [state.blocks]);

    const updateBlueprint = useCallback((payload) => {
        dispatch({ type: 'UPDATE_BLUEPRINT', payload });
    }, []);

    const addBlock = useCallback((parentId = null, count = 1) => {
        const actualParentId = parentId || selectedId;
        const newBlocks = [];
        for (let i = 0; i < count; i++) {
            newBlocks.push({
                id: 'block_' + Math.random().toString(36).substr(2, 9),
                parentId: actualParentId,
                x: actualParentId ? 0 : 100 + ((state.blocks.length + i) * 20),
                y: actualParentId ? 0 : 100 + ((state.blocks.length + i) * 20),
                w: actualParentId ? 100 : 200,
                h: actualParentId ? 100 : 200,
                meta: { ...DEFAULT_BLOCK_META }
            });
        }
        pushToHistory([...state.blocks, ...newBlocks]);
        setSelectedId(newBlocks[newBlocks.length - 1].id);
    }, [selectedId, state.blocks, pushToHistory]);

    const updateBlockMeta = useCallback((id, key, value) => {
        pushToHistory(prev => prev.map(b => b && b.id === id ? { ...b, meta: { ...(b.meta || {}), [key]: value } } : b));
    }, [pushToHistory]);

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
        pushToHistory(prev => deleteRecursive(idsToDelete, prev));
        setSelectedId(null);
    }, [pushToHistory]);

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

    return (
        <MantineProvider theme={theme} defaultColorScheme="dark">
            <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: COLORS.bg }}>
                <Sidebar 
                    activeShape={activeShape}
                    shapes={state.blocks}
                    onSelect={setSelectedId}
                    onAddBlock={addBlock}
                    onUpdateMeta={updateBlockMeta}
                    onShowCode={() => setShowCode(true)}
                    onOpenAssets={() => setAssetManagerOpened(true)}
                    blueprint={state.blueprint}
                    onUpdateBlueprint={updateBlueprint}
                    onDeleteBlock={deleteBlocks}
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

                <CodeModal 
                    opened={showCode} 
                    onClose={() => setShowCode(false)} 
                    blocks={state.blocks} 
                />

                <AssetManager 
                    opened={assetManagerOpened}
                    onClose={() => setAssetManagerOpened(false)}
                    assets={state.assets}
                    onAddAsset={onAddAsset}
                    onRemoveAsset={onRemoveAsset}
                    onSelect={(url) => {
                        if (firstSelectedId && firstSelectedId !== 'blueprint-img') {
                            updateBlockMeta(firstSelectedId, 'bgImage', url);
                        } else if (firstSelectedId === 'blueprint-img') {
                            updateBlueprint({ url });
                        }
                    }}
                    selectedAssetUrl={firstSelectedId === 'blueprint-img' ? state.blueprint.url : activeShape?.meta?.bgImage}
                />
            </div>
        </MantineProvider>
    )
}

export default App
