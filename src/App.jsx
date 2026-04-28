import React, { useState, useCallback, useReducer, useMemo, useEffect } from 'react'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import './App.css'

// Components
import Sidebar from './components/Sidebar'
import Canvas from './canvas/Canvas'
import CodeModal from './components/CodeModal'
import AssetManager from './components/AssetManager'
import FontManager from './components/FontManager'
import ColorManager from './components/ColorManager'

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
    const [fontManagerOpened, setFontManagerOpened] = useState(false);
    const [colorManagerOpened, setColorManagerOpened] = useState(false);
    
    // Буфер обмена
    const [clipboard, setClipboard] = useState(null);

    const firstSelectedId = useMemo(() => selectedId?.split(',')[0], [selectedId]);
    const activeShape = useMemo(() => state.blocks.find(b => b && b.id === firstSelectedId), [state.blocks, firstSelectedId]);

    // Динамическая загрузка шрифтов
    useEffect(() => {
        if (state.fonts.length === 0) return;
        const familyQuery = state.fonts.map(f => `family=${f.family.replace(/\s+/g, '+')}`).join('&');
        const linkId = 'google-fonts-loader';
        let link = document.getElementById(linkId);
        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        link.href = `https://fonts.googleapis.com/css2?${familyQuery}&display=swap`;
    }, [state.fonts]);

    const pushToHistory = useCallback((newBlocksOrFunc) => {
        dispatch({ type: 'PUSH_BLOCKS', payload: typeof newBlocksOrFunc === 'function' ? newBlocksOrFunc(state.blocks) : newBlocksOrFunc });
    }, [state.blocks]);

    const setBlocksSilent = useCallback((newBlocksOrFunc) => {
        dispatch({ type: 'SET_BLOCKS', payload: typeof newBlocksOrFunc === 'function' ? newBlocksOrFunc(state.blocks) : newBlocksOrFunc });
    }, [state.blocks]);

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

    // ЛОГИКА КОПИРОВАНИЯ
    const copyBlocks = useCallback(() => {
        if (!selectedId) return;
        const idsToCopy = selectedId.split(',');
        
        const getRecursive = (ids, currentBlocks) => {
            let res = [];
            ids.forEach(id => {
                const block = currentBlocks.find(b => b.id === id);
                if (block) {
                    res.push(block);
                    const children = currentBlocks.filter(b => b.parentId === id);
                    if (children.length > 0) {
                        res = [...res, ...getRecursive(children.map(c => c.id), currentBlocks)];
                    }
                }
            });
            return res;
        };

        const blocksToCopy = getRecursive(idsToCopy, state.blocks);
        setClipboard(JSON.parse(JSON.stringify(blocksToCopy))); // Глубокая копия
    }, [selectedId, state.blocks]);

    // ЛОГИКА ВСТАВКИ
    const pasteBlocks = useCallback(() => {
        if (!clipboard || clipboard.length === 0) return;

        const targetParentId = selectedId || null;
        const idMap = {};
        
        // Генерируем новые ID и сохраняем связи
        const newPastedBlocks = clipboard.map(b => {
            const newId = 'block_' + Math.random().toString(36).substr(2, 9);
            idMap[b.id] = newId;
            return { ...b, id: newId };
        });

        // Обновляем parentId на основе новой карты ID
        const finalBlocks = newPastedBlocks.map(b => {
            let newParentId = targetParentId;
            // Если у блока был родитель ВНУТРИ скопированной группы, сохраняем эту связь
            if (idMap[b.parentId]) {
                newParentId = idMap[b.parentId];
            }
            
            // Если это "корневой" блок из скопированных, и мы вставляем его на холст (без родителя),
            // чуть сместим его координаты, чтобы не перекрывал оригинал
            const isRootOfPasted = !idMap[b.parentId];
            return { 
                ...b, 
                parentId: newParentId,
                x: (isRootOfPasted && !newParentId) ? b.x + 40 : b.x,
                y: (isRootOfPasted && !newParentId) ? b.y + 40 : b.y
            };
        });

        pushToHistory([...state.blocks, ...finalBlocks]);
        setSelectedId(finalBlocks[0].id);
    }, [clipboard, selectedId, state.blocks, pushToHistory]);

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

    useKeyboardShortcuts({ 
        selectedId, deleteBlocks, 
        onUndo: () => dispatch({ type: 'UNDO' }), 
        onRedo: () => dispatch({ type: 'REDO' }),
        onCopy: copyBlocks,
        onPaste: pasteBlocks
    });

    const updateBlueprint = useCallback((payload) => dispatch({ type: 'UPDATE_BLUEPRINT', payload }), []);
    const onAddAsset = (asset) => dispatch({ type: 'ADD_ASSET', payload: asset });
    const onRemoveAsset = (id) => dispatch({ type: 'REMOVE_ASSET', payload: id });
    const onAddFont = (font) => dispatch({ type: 'ADD_FONT', payload: font });
    const onRemoveFont = (family) => dispatch({ type: 'REMOVE_FONT', payload: family });
    const onAddColor = (color) => dispatch({ type: 'ADD_COLOR_TO_PALETTE', payload: color });
    const onRemoveColor = (name) => dispatch({ type: 'REMOVE_COLOR_FROM_PALETTE', payload: name });

    return (
        <MantineProvider theme={theme} defaultColorScheme="dark">
            <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: COLORS.bg }}>
                <Sidebar 
                    activeShape={activeShape} shapes={state.blocks}
                    onSelect={setSelectedId} onAddBlock={addBlock} onUpdateMeta={updateBlockMeta}
                    onShowCode={() => setShowCode(true)} onOpenAssets={() => setAssetManagerOpened(true)}
                    onOpenFonts={() => setFontManagerOpened(true)}
                    onOpenColors={() => setColorManagerOpened(true)}
                    blueprint={state.blueprint} onUpdateBlueprint={updateBlueprint}
                    onDeleteBlock={deleteBlocks}
                    onClear={() => confirm('Clear everything?') && dispatch({ type: 'CLEAR' })}
                    availableFonts={state.fonts}
                    palette={state.palette}
                />
                
                <Canvas 
                    blocks={state.blocks} setBlocks={pushToHistory} setBlocksSilent={setBlocksSilent}
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

                <FontManager 
                    opened={fontManagerOpened} onClose={() => setFontManagerOpened(false)}
                    fonts={state.fonts} onAddFont={onAddFont} onRemoveFont={onRemoveFont}
                />

                <ColorManager 
                    opened={colorManagerOpened} onClose={() => setColorManagerOpened(false)}
                    palette={state.palette} onAddColor={onAddColor} onRemoveColor={onRemoveColor}
                />
            </div>
        </MantineProvider>
    )
}

export default App
