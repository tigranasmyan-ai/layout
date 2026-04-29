import React from 'react';
import { Box, Group, Text, ActionIcon, ScrollArea, Tooltip } from '@mantine/core';
import { 
    IconCode, IconTrash, IconSettings 
} from '@tabler/icons-react';

import NavigatorSection from '@components/Sidebar/NavigatorSection/NavigatorSection';
import BackgroundSection from '@components/Sidebar/BackgroundSection/BackgroundSection';
import TypographySection from '@components/Sidebar/TypographySection/TypographySection';
import AdvancedCssSection from '@components/Sidebar/AdvancedCssSection/AdvancedCssSection';
import BlueprintSection from '@components/Sidebar/BlueprintSection/BlueprintSection';
import { getPref, updatePref } from '@utils';

import classes from './Sidebar.module.css';
import { useLayoutStore } from '@store';

export default function Sidebar({ 
    onSelect, onUpdateMeta, onShowCode, onOpenAssets, onOpenFonts, onOpenColors,
    onOpenBlueprintAssets,
    onDeleteBlock, onClear, blueprint, onUpdateBlueprint, availableFonts,
    palette, onAddColor, onRemoveColor
}) {
    const selectedId = useLayoutStore(state => state.selectedId);
    const blocks = useLayoutStore(state => state.blocks);
    const firstSelectedId = React.useMemo(() => selectedId?.split(',')[0], [selectedId]);
    const activeShape = React.useMemo(() => blocks.find(b => b && b.id === firstSelectedId), [blocks, firstSelectedId]);

    const [openSections, setOpenSections] = React.useState(() => 
        getPref('sidebarSections', { navigator: true, blueprint: true, background: true, content: true, css: false })
    );

    React.useEffect(() => {
        updatePref('sidebarSections', openSections);
    }, [openSections]);

    const toggleSection = (id) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <Box className={classes.sidebarContainer}>
            {/* HEADER */}
            <div className={classes.header}>
                <Group gap="xs">
                    <div className={classes.logoIcon}>
                        <IconSettings size={14} color="white" />
                    </div>
                    <Text className={classes.logoText}>ARCHITECT</Text>
                </Group>
                <Group gap={4}>
                    <Tooltip label="Show Code">
                        <ActionIcon variant="light" onClick={onShowCode} color="gray">
                            <IconCode size={18} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Clear All">
                        <ActionIcon variant="light" color="red" onClick={onClear}>
                            <IconTrash size={18} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </div>

            <ScrollArea scrollbars="y" className={classes.scrollArea}>
                <NavigatorSection 
                    blocks={blocks} 
                    selectedId={activeShape?.id} 
                    onSelect={onSelect} 
                    onRemove={onDeleteBlock}
                    onClear={onClear}
                    isOpen={openSections.navigator}
                    onToggle={() => toggleSection('navigator')}
                />
                
                <BlueprintSection 
                    blueprint={blueprint} onUpdate={onUpdateBlueprint} 
                    isOpen={openSections.blueprint} onToggle={() => toggleSection('blueprint')} 
                    onOpenAssets={onOpenBlueprintAssets}
                />

                {/* BLOCK SETTINGS */}
                {activeShape && (
                    <Box className={classes.settingsGroup}>
                        <BackgroundSection 
                            activeShape={activeShape} onUpdateMeta={onUpdateMeta} 
                            isOpen={openSections.background} onToggle={() => toggleSection('background')} 
                            onOpenAssets={onOpenAssets}
                            onOpenColors={onOpenColors}
                            palette={palette} onAddColor={onAddColor} onRemoveColor={onRemoveColor}
                        />
                        
                        {!blocks.some(s => s && s.parentId === activeShape?.id) && (
                            <TypographySection 
                                activeShape={activeShape} onUpdateMeta={onUpdateMeta} 
                                isOpen={openSections.content} onToggle={() => toggleSection('content')} 
                                availableFonts={availableFonts} onOpenFonts={onOpenFonts}
                                onOpenColors={onOpenColors}
                                palette={palette} onAddColor={onAddColor} onRemoveColor={onRemoveColor}
                            />
                        )}

                        <AdvancedCssSection 
                            activeShape={activeShape} onUpdateMeta={onUpdateMeta} 
                            isOpen={openSections.css} onToggle={() => toggleSection('css')} 
                        />
                    </Box>
                )}
            </ScrollArea>

            {/* FOOTER */}
            <div className={classes.footer}>
                <Text size="xs" c="dimmed">Flex Architect v2.0</Text>
            </div>
        </Box>
    );
}
