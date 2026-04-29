import React from 'react';
import { Box, Stack, Group, Text, ActionIcon, ScrollArea, Tooltip, Divider, Button } from '@mantine/core';
import { 
    IconPlus, IconCode, IconTrash,
    IconSettings, IconPhoto, IconDeviceFloppy, IconFolder, IconTypography 
} from '@tabler/icons-react';

import NavigatorSection from './sidebar/NavigatorSection';
import BackgroundSection from './sidebar/BackgroundSection';
import TypographySection from './sidebar/TypographySection';
import AdvancedCssSection from './sidebar/AdvancedCssSection';
import BlueprintSection from './sidebar/BlueprintSection';
import { getPref, updatePref } from '../utils/storage'

export default function Sidebar({ 
    activeShape, shapes, onSelect, onAddBlock, onUpdateMeta, onShowCode, onOpenAssets, onOpenFonts, onOpenColors,
    onOpenBlueprintAssets,
    onDeleteBlock, onClear, blueprint, onUpdateBlueprint, availableFonts,
    palette, onAddColor, onRemoveColor
}) {
    const [openSections, setOpenSections] = React.useState(() => 
        getPref('sidebarSections', { blueprint: true, background: true, content: true, css: false })
    );

    React.useEffect(() => {
        updatePref('sidebarSections', openSections);
    }, [openSections]);

    const toggleSection = (id) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <Box 
            w={320} h="100vh" 
            style={{ 
                background: '#1a1a1e', 
                borderRight: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                boxShadow: '10px 0 30px rgba(0,0,0,0.5)'
            }}
        >
            {/* HEADER */}
            <Group p="md" justify="space-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#141417' }}>
                <Group gap="xs">
                    <Box w={24} h={24} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconSettings size={14} color="white" />
                    </Box>
                    <Text fw={900} size="sm" style={{ letterSpacing: 1 }}>ARCHITECT</Text>
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
            </Group>


            <ScrollArea scrollbars="y" style={{ flex: 1 }}>
                <NavigatorSection 
                    shapes={shapes} 
                    selectedId={activeShape?.id} 
                    onSelect={onSelect} 
                    onDelete={onDeleteBlock}
                />
                
                <BlueprintSection 
                    blueprint={blueprint} onUpdate={onUpdateBlueprint} 
                    isOpen={openSections.blueprint} onToggle={() => toggleSection('blueprint')} 
                    onOpenAssets={onOpenBlueprintAssets}
                />

                {/* BLOCK SETTINGS (Collapsible) */}
                {activeShape && (
                    <Box style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: '#141417', marginTop: 10 }}>
                        <NavigatorSection 
                            blocks={shapes} 
                            selectedId={activeShape?.id} 
                            onSelect={onSelect} 
                            onRemove={onDeleteBlock} 
                            onClear={onClear}
                        />

                        <BackgroundSection 
                            activeShape={activeShape} onUpdateMeta={onUpdateMeta} 
                            isOpen={openSections.background} onToggle={() => toggleSection('background')} 
                            onOpenAssets={onOpenAssets}
                            onOpenColors={onOpenColors}
                            palette={palette} onAddColor={onAddColor} onRemoveColor={onRemoveColor}
                        />
                        
                        {!shapes.some(s => s && s.parentId === activeShape?.id) && (
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
            <Group p="xs" justify="center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: '#141417' }}>
                <Text size="xs" c="dimmed">Flex Architect v2.0</Text>
            </Group>
        </Box>
    );
}
