import React, { useState, useCallback, useReducer, useMemo } from 'react'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import './App.css'

// Components
import Sidebar from './components/Sidebar'
import Canvas from './canvas/Canvas'
import CodeModal from './components/CodeModal'
import AssetManager from './components/AssetManager'

// Hooks
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

// Store & Constants
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
    const [assetManagerOpened, setAssetManagerOpened] = useState(false);

    const firstSelectedId = useMemo(() => selectedId?.split(',')[0], [selectedId]);
    const activeShape = useMemo(() => state.blocks.find(b => b && b.id === firstSelectedId), [state.blocks, firstSelectedId]);

    // Обновление с записью в историю
    const pushToHistory = useCallback((newBlocksOrFunc) => {
        dispatch({ 
            type: 'PUSH_BLOCKS', 
            payload: typeof newBlocksOrFunc === 'function' ? newBlocksOrFunc(state.blocks) : newBlocksOrFunc 
        });
    }, [state.blocks]);

    // Тихое обновление (для плавных перетаскиваний)
    const setBlocksSilent = useCallback((newBlocksOrFunc) => {
        dispatch({ 
            type: 'SET_BLOCKS', 
            payload: typeof newBlocksOrFunc === 'function' ? newBlocksOrFunc(state.blocks) : newBlocksOrFunc 
        });
    }, [state.blocks]);

    // Действия над блоками
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

    // Горячие клавиши
    useKeyboardShortcuts({
        selectedId,
        deleteBlocks,
        onUndo: () => dispatch({ type: 'UNDO' }),
        onRedo: () => dispatch({ type: 'REDO' })
    });

    const updateBlueprint = useCallback((payload) => dispatch({ type: 'UPDATE_BLUEPRINT', payload }), []);
    const onAddAsset = (asset) => dispatch({ type: 'ADD_ASSET', payload: asset });
    const onRemoveAsset = (id) => dispatch({ type: 'REMOVE_ASSET', payload: id });

    return (
        <MantineProvider theme={theme} defaultColorScheme="dark">
            <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: COLORS.bg }}>
                <Sidebar 
                    activeShape={activeShape} shapes={state.blocks}
                    onSelect={setSelectedId} onAddBlock={addBlock} onUpdateMeta={updateBlockMeta}
                    onShowCode={() => setShowCode(true)} onOpenAssets={() => setAssetManagerOpened(true)}
                    blueprint={state.blueprint} onUpdateBlueprint={updateBlueprint}
                    onDeleteBlock={deleteBlocks}
                    onClear={() => confirm('Clear everything?') && dispatch({ type: 'CLEAR' })}
                />
                
                <Canvas 
                    blocks={state.blocks} 
                    setBlocks={pushToHistory}
                    setBlocksSilent={setBlocksSilent}
                    selectedId={selectedId} onSelect={setSelectedId} onAddBlock={addBlock}
                    blueprint={state.blueprint} onUpdateBlueprint={updateBlueprint}
                />

                <CodeModal opened={showCode} onClose={() => setShowCode(false)} blocks={state.blocks} />

                <AssetManager 
                    opened={assetManagerOpened} onClose={() => setAssetManagerOpened(false)}
                    assets={state.assets} onAddAsset={onAddAsset} onRemoveAsset={onRemoveAsset}
                    onSelect={(url) => {
                        if (firstSelectedId && firstSelectedId !== 'blueprint-img') updateBlockMeta(firstSelectedId, 'bgImage', url);
                        else if (firstSelectedId === 'blueprint-img') updateBlueprint({ url });
                    }}
                    selectedAssetUrl={firstSelectedId === 'blueprint-img' ? state.blueprint.url : activeShape?.meta?.bgImage}
                />
            </div>
        </MantineProvider>
    )
}

export default App
