import React from 'react';
import { Box, Group, Text, ActionIcon, Stack, ColorInput, Button, Collapse, Slider } from '@mantine/core';
import { IconPhoto, IconTrash, IconPlus, IconPalette, IconChevronDown, IconChevronRight } from '@tabler/icons-react';

export default function BackgroundSection({ 
    activeShape, onUpdateMeta, onOpenAssets, onOpenColors, 
    isOpen = true, onToggle,
    palette = [], onAddColor, onRemoveColor
}) {
    const m = activeShape?.meta || {};
    const bg = m.background || {};

    const updateBg = (updates) => {
        onUpdateMeta(activeShape.id, 'background', { ...bg, ...updates });
    };

    return (
        <Box style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Group 
                p="xs" px="md" justify="space-between" 
                onClick={onToggle}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
            >
                <Group gap={6}>
                    {isOpen ? <IconChevronDown size={14} color="#3b82f6" /> : <IconChevronRight size={14} color="#3b82f6" />}
                    <IconPalette size={14} color="#3b82f6" />
                    <Text size="xs" fw={700} c="dimmed">BACKGROUND</Text>
                </Group>
            </Group>
            
            <Collapse in={isOpen}>
                <Box p="md" pt="xs">
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text size="10px" c="dimmed">COLOR</Text>
                            <ActionIcon size="xs" variant="subtle" onClick={onOpenColors}>
                                <IconPalette size={12} />
                            </ActionIcon>
                        </Group>
                        
                        <ColorInput 
                            size="xs"
                            placeholder="Pick color"
                            value={bg.color || '#ffffff'}
                            onChange={(val) => updateBg({ color: val })}
                            swatches={palette}
                        />

                        <Group justify="space-between" mt="xs">
                            <Text size="10px" c="dimmed">IMAGE</Text>
                            {bg.image && (
                                <ActionIcon size="xs" color="red" variant="subtle" onClick={() => updateBg({ image: null })}>
                                    <IconTrash size={12} />
                                </ActionIcon>
                            )}
                        </Group>

                        {!bg.image ? (
                            <Button 
                                variant="light" 
                                size="xs" 
                                fullWidth
                                leftSection={<IconPlus size={14} />}
                                onClick={onOpenAssets}
                            >
                                Add Image
                            </Button>
                        ) : (
                            <Stack gap="xs">
                                <Button 
                                    variant="subtle" 
                                    size="xs" 
                                    fullWidth
                                    leftSection={<IconPhoto size={14} />}
                                    onClick={onOpenAssets}
                                >
                                    Change Image
                                </Button>
                                
                                <Group justify="space-between">
                                    <Text size="10px" c="dimmed">OPACITY</Text>
                                    <Text size="10px" fw={700} c="white">{Math.round((bg.opacity ?? 1) * 100)}%</Text>
                                </Group>
                                <Slider 
                                    size="xs"
                                    min={0} max={1} step={0.01}
                                    value={bg.opacity ?? 1}
                                    onChange={(val) => updateBg({ opacity: val })}
                                />
                            </Stack>
                        )}
                    </Stack>
                </Box>
            </Collapse>
        </Box>
    );
}
