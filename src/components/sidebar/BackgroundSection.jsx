import React from 'react';
import { Box, Group, Text, ActionIcon, Stack, ColorInput, Select, Button } from '@mantine/core';
import { IconChevronDown, IconBrush, IconPhoto, IconSettings, IconPlus } from '@tabler/icons-react';

export default function BackgroundSection({ 
    activeShape, onUpdateMeta, isOpen, onToggle, onOpenAssets, onOpenColors, palette = []
}) {
    const m = activeShape?.meta || {};

    const colorOptions = palette.map(c => ({ value: c.value, label: c.name }));
    const selectedPaletteColor = palette.find(c => c.value === m.bgColor);
    const displayValue = selectedPaletteColor ? selectedPaletteColor.value : null;

    return (
        <Box style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Group 
                p="xs" px="md" justify="space-between" 
                style={{ cursor: 'pointer', background: isOpen ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                onClick={onToggle}
            >
                <Group gap="xs">
                    <IconBrush size={14} color="gray" />
                    <Text size="xs" fw={700} c="dimmed">BACKGROUND</Text>
                </Group>
                <IconChevronDown size={14} style={{ transform: isOpen ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
            </Group>

            {isOpen && (
                <Stack p="md" gap="sm">
                    <Box>
                        <Group justify="space-between" mb={4}>
                            <Text size="xs" fw={500}>Background Color</Text>
                            <ActionIcon variant="subtle" size="xs" onClick={onOpenColors} title="Manage Palette">
                                <IconSettings size={12} />
                            </ActionIcon>
                        </Group>
                        {palette.length > 0 ? (
                            <Select 
                                size="xs"
                                placeholder="Select from palette"
                                data={colorOptions}
                                value={displayValue}
                                onChange={(val) => onUpdateMeta(activeShape.id, 'bgColor', val)}
                            />
                        ) : (
                            <Button fullWidth size="xs" variant="light" leftSection={<IconPlus size={14}/>} onClick={onOpenColors}>
                                Add Project Colors
                            </Button>
                        )}
                    </Box>

                    <Box>
                        <Text size="xs" fw={500} mb={6}>Image</Text>
                        {m.bgImage ? (
                            <Stack gap={4}>
                                <Box style={{ height: 60, borderRadius: 4, background: `url(${m.bgImage}) center/cover`, border: '1px solid rgba(255,255,255,0.1)' }} />
                                <Group grow gap="xs">
                                    <Select 
                                        size="xs"
                                        data={['cover', 'contain', 'auto']}
                                        value={m.bgSize || 'cover'}
                                        onChange={(val) => onUpdateMeta(activeShape.id, 'bgSize', val)}
                                    />
                                    <Button size="xs" variant="light" color="red" onClick={() => onUpdateMeta(activeShape.id, 'bgImage', null)}>Remove</Button>
                                </Group>
                            </Stack>
                        ) : (
                            <Button fullWidth size="xs" variant="light" leftSection={<IconPhoto size={14}/>} onClick={onOpenAssets}>
                                Choose Image
                            </Button>
                        )}
                    </Box>
                </Stack>
            )}
        </Box>
    );
}
