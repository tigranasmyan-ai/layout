import React from 'react'
import { Box, Text, Group, ScrollArea, ActionIcon } from '@mantine/core'
import { IconBolt, IconCode } from '@tabler/icons-react'

// Sub-components
import BlueprintSection from './sidebar/BlueprintSection'
import NavigatorSection from './sidebar/NavigatorSection'
import BackgroundSection from './sidebar/BackgroundSection'
import TypographySection from './sidebar/TypographySection'
import AdvancedCssSection from './sidebar/AdvancedCssSection'

export default function Sidebar({ 
    activeShape, 
    shapes, 
    onSelect, 
    onUpdateMeta, 
    onShowCode, 
    onClear,
    blueprint,
    onUpdateBlueprint
}) {
    const [openSections, setOpenSections] = React.useState({
        background: true,
        content: true,
        css: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <Box style={{ width: 320, height: '100%', borderRight: '1px solid rgba(255,255,255,0.1)', background: '#0f0f11', display: 'flex', flexDirection: 'column' }}>
            {/* HEADER */}
            <Box p="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Group justify="space-between">
                    <Group gap="xs">
                        <IconBolt size={20} color="#4f46e5" />
                        <Text fw={800} size="sm" c="white" lts="1px">FLEX ARCHITECT</Text>
                    </Group>
                    <ActionIcon variant="subtle" color="gray" size="sm" onClick={onShowCode} title="View Code">
                        <IconCode size={16} />
                    </ActionIcon>
                </Group>
            </Box>

            {/* BLUEPRINT */}
            <BlueprintSection 
                blueprint={blueprint} 
                onUpdateBlueprint={onUpdateBlueprint} 
            />

            {/* NAVIGATOR */}
            <NavigatorSection 
                shapes={shapes} 
                activeShape={activeShape} 
                onSelect={onSelect} 
                onClear={onClear} 
            />

            {/* BLOCK SETTINGS (Collapsible) */}
            {activeShape && (
                <ScrollArea offsetScrollbars p="0" style={{ maxHeight: '60vh', borderTop: '1px solid rgba(255,255,255,0.1)', background: '#141417' }}>
                    <BackgroundSection 
                        activeShape={activeShape} 
                        onUpdateMeta={onUpdateMeta} 
                        isOpen={openSections.background} 
                        onToggle={() => toggleSection('background')} 
                    />
                    
                    <TypographySection 
                        activeShape={activeShape} 
                        shapes={shapes} 
                        onUpdateMeta={onUpdateMeta} 
                        isOpen={openSections.content} 
                        onToggle={() => toggleSection('content')} 
                    />

                    <AdvancedCssSection 
                        activeShape={activeShape} 
                        onUpdateMeta={onUpdateMeta} 
                        isOpen={openSections.css} 
                        onToggle={() => toggleSection('css')} 
                    />
                </ScrollArea>
            )}
        </Box>
    );
}
