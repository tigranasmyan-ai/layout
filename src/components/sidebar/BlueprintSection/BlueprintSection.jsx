import React from 'react';
import { Box, Group, Text, Button, ActionIcon, Stack, Slider, Collapse } from '@mantine/core';
import { IconPhoto, IconTrash, IconPlus, IconLayout2, IconChevronDown, IconChevronRight } from '@tabler/icons-react';

export default function BlueprintSection({ 
    blueprint, onUpdate, onOpenAssets, 
    isOpen = true, onToggle 
}) {
    return (
        <Box style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Group 
                p="xs" px="md" justify="space-between" 
                onClick={onToggle}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
            >
                <Group gap={6}>
                    {isOpen ? <IconChevronDown size={14} color="#10b981" /> : <IconChevronRight size={14} color="#10b981" />}
                    <IconLayout2 size={14} color="#10b981" />
                    <Text size="xs" fw={700} c="dimmed">MOCKUP</Text>
                </Group>
                {blueprint.url && isOpen && (
                    <ActionIcon size="xs" color="red" variant="subtle" onClick={(e) => { e.stopPropagation(); onUpdate({ url: null }); }}>
                        <IconTrash size={12} />
                    </ActionIcon>
                )}
            </Group>
            
            <Collapse in={isOpen}>
                <Box p="md" pt="xs">
                    {!blueprint.url ? (
                        <Button 
                            variant="light" 
                            size="xs" 
                            fullWidth
                            leftSection={<IconPlus size={14} />}
                            onClick={onOpenAssets}
                        >
                            Add Mockup
                        </Button>
                    ) : (
                        <Stack gap="xs">
                            <Button 
                                variant="subtle" 
                                size="xs" 
                                fullWidth
                                leftSection={<IconPhoto size={14} />}
                                onClick={onOpenAssets}
                                styles={{ label: { fontSize: '10px' } }}
                            >
                                Change Mockup
                            </Button>
                            
                            <Group justify="space-between">
                                <Text size="10px" c="dimmed">OPACITY</Text>
                                <Text size="10px" fw={700} c="white">{Math.round(blueprint.opacity * 100)}%</Text>
                            </Group>
                            <Slider 
                                size="xs"
                                min={0} max={1} step={0.01}
                                value={blueprint.opacity}
                                onChange={(val) => onUpdate({ opacity: val })}
                            />
                        </Stack>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
}
