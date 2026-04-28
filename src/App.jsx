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
import { useBlockLogic } from './hooks/useBlockLogic'

// Store & Constants
import { layoutReducer, initialState } from './store/layoutReducer'
import { COLORS } from './constants'

const theme = createTheme({
    primaryColor: 'indigo',
    fontFamily: 'Inter, sans-serif',
})

function App() {
    const [state, dispatch] = useReducer(layoutReducer, initialState);
    
    // Модалки
    const [showCode, setShowCode] = useState(false);
    const [assetManagerOpened, setAssetManagerOpened] = useState(false);
    const [fontManagerOpened, setFontManagerOpened] = useState(false);
    const [colorManagerOpened, setColorManagerOpened] = useState(false);

    // Основная логика блоков (вынесена в хук)
    const {
        selectedId, setSelectedId, addBlock, updateBlockMeta, deleteBlocks,
        copyBlocks, pasteBlocks, pushToHistory, setBlocksSilent
    } = useBlockLogic(state, dispatch);

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

    // Keyboard Shortcuts
    useKeyboardShortcuts({ 
        selectedId, deleteBlocks, 
        onUndo: () => dispatch({ type: 'UNDO' }), 
        onRedo: () => dispatch({ type: 'REDO' }),
        onCopy: copyBlocks,
        onPaste: pasteBlocks
    });

    // Вспомогательные хендлеры
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
