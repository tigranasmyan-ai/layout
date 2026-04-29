import React, { useState, useMemo, useEffect } from 'react'
import { MantineProvider, createTheme } from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import { useStore } from 'zustand'
import '@mantine/core/styles.css'
import './App.css'
import classes from './App.module.css'

// Components
import Sidebar from '@components/Sidebar'
import Canvas from '@components/Canvas'
import CodeModal from '@components/CodeModal'
import AssetManager from '@components/AssetManager'
import FontManager from '@components/FontManager'
import ColorManager from '@components/ColorManager'

// Store & Constants
import { useLayoutStore } from '@store'
import { COLORS } from '@constants'

const theme = createTheme({
    primaryColor: 'indigo',
    fontFamily: 'Inter, sans-serif',
})

function App() {
    const {
        blocks, blueprint, assets, fonts, palette, selectedId,
        setSelectedId, addBlock, updateBlockMeta, deleteBlocks,
        copyBlocks, pasteBlocks, setBlocks, setBlocksSilent, updateBlueprint,
        addAsset, removeAsset, addFont, removeFont, addColor, removeColor, clearAll
    } = useLayoutStore();

    const { undo, redo } = useStore(useLayoutStore.temporal, (state) => state);

    const [showCode, setShowCode] = useState(false);
    const [assetManagerOpened, setAssetManagerOpened] = useState(false);
    const [fontManagerOpened, setFontManagerOpened] = useState(false);
    const [colorManagerOpened, setColorManagerOpened] = useState(false);
    
    // Новое состояние для цели выбора ассета
    const [assetTarget, setAssetTarget] = useState('block'); // 'block' или 'blueprint'

    const firstSelectedId = useMemo(() => selectedId?.split(',')[0], [selectedId]);
    const activeShape = useMemo(() => blocks.find(b => b && b.id === firstSelectedId), [blocks, firstSelectedId]);

    useEffect(() => {
        if (fonts.length === 0) return;
        const familyQuery = fonts.map(f => `family=${f.family.replace(/\s+/g, '+')}`).join('&');
        const linkId = 'google-fonts-loader';
        let link = document.getElementById(linkId);
        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        link.href = `https://fonts.googleapis.com/css2?${familyQuery}&display=swap`;
    }, [fonts]);

    useHotkeys([
        ['mod+Z', (e) => { e.preventDefault(); undo(); }],
        ['mod+Y', (e) => { e.preventDefault(); redo(); }],
        ['mod+Shift+Z', (e) => { e.preventDefault(); redo(); }],
        ['mod+C', (e) => { e.preventDefault(); copyBlocks(); }],
        ['mod+V', (e) => { e.preventDefault(); pasteBlocks(); }],
        ['Delete', () => selectedId && deleteBlocks(selectedId)],
        ['Backspace', () => selectedId && deleteBlocks(selectedId)],
    ]);

    const handleOpenAssets = (target = 'block') => {
        setAssetTarget(target);
        setAssetManagerOpened(true);
    };

    return (
        <MantineProvider theme={theme} defaultColorScheme="dark">
            <div className={classes.appContainer}>
                <Sidebar 
                    activeShape={activeShape} shapes={blocks}
                    onSelect={setSelectedId} onAddBlock={addBlock} onUpdateMeta={updateBlockMeta}
                    onShowCode={() => setShowCode(true)} 
                    onOpenAssets={() => handleOpenAssets('block')}
                    onOpenBlueprintAssets={() => handleOpenAssets('blueprint')}
                    onOpenFonts={() => setFontManagerOpened(true)}
                    onOpenColors={() => setColorManagerOpened(true)}
                    blueprint={blueprint} onUpdateBlueprint={updateBlueprint}
                    onDeleteBlock={deleteBlocks}
                    onClear={() => confirm('Clear everything?') && clearAll()}
                    availableFonts={fonts}
                    palette={palette}
                />
                
                <Canvas 
                    blocks={blocks} setBlocks={setBlocks} setBlocksSilent={setBlocksSilent}
                    selectedId={selectedId} onSelect={setSelectedId} onAddBlock={addBlock}
                    blueprint={blueprint} onUpdateBlueprint={updateBlueprint}
                />

                <CodeModal opened={showCode} onClose={() => setShowCode(false)} blocks={blocks} />

                <AssetManager 
                    opened={assetManagerOpened} onClose={() => setAssetManagerOpened(false)}
                    assets={assets} onAddAsset={addAsset} onRemoveAsset={removeAsset}
                    onSelect={(url) => {
                        if (assetTarget === 'blueprint') {
                            const img = new Image();
                            img.onload = () => {
                                updateBlueprint({ 
                                    url, 
                                    w: img.naturalWidth,
                                    // Опционально можно добавить и h, если захотим потом использовать
                                });
                            };
                            img.src = url;
                        } else if (firstSelectedId) {
                            updateBlockMeta(firstSelectedId, 'bgImage', url);
                        }
                    }}
                    selectedAssetUrl={assetTarget === 'blueprint' ? blueprint.url : activeShape?.meta?.bgImage}
                />

                <FontManager 
                    opened={fontManagerOpened} onClose={() => setFontManagerOpened(false)}
                    fonts={fonts} onAddFont={addFont} onRemoveFont={removeFont}
                />

                <ColorManager 
                    opened={colorManagerOpened} onClose={() => setColorManagerOpened(false)}
                    palette={palette} onAddColor={addColor} onRemoveColor={removeColor}
                />
            </div>
        </MantineProvider>
    )
}

export default App
