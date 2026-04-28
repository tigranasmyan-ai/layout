import React from 'react';
import { Box, Group, Text, Stack, Button, ActionIcon, SegmentedControl } from '@mantine/core';
import { IconPhoto, IconTrash, IconPlus, IconChevronDown } from '@tabler/icons-react';

export default function BackgroundSection({ activeShape, onUpdateMeta, isOpen, onToggle, onOpenAssets }) {
    return (
        <Box style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Group justify="space-between" p="xs" style={{ cursor: 'pointer' }} onClick={onToggle}>
                <Group gap="xs">
                    <IconPhoto size={14} color="#ec4899" />
                    <Text size="xs" fw={700} c="dimmed">BACKGROUND</Text>
                </Group>
                <IconChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </Group>
            
            {isOpen && (
                <Stack gap="xs" p="md" pt={0}>
                    <Button 
                        variant="light" 
                        size="xs" 
                        fullWidth
                        leftSection={<IconPlus size={14} />}
                        onClick={onOpenAssets}
                    >
                        Open Assets
                    </Button>

                    {activeShape.meta?.bgImage && (
                        <Group justify="space-between">
                            <Text size="10px" c="dimmed">Image is active</Text>
                            <ActionIcon size="xs" color="red" variant="subtle" onClick={() => onUpdateMeta(activeShape.id, 'bgImage', null)}>
                                <IconTrash size={14} />
                            </ActionIcon>
                        </Group>
                    )}

                    <Text size="10px" fw={700} c="dimmed" mt="xs">SIZE MODE</Text>
                    <SegmentedControl 
                        size="xs" fullWidth
                        disabled={!activeShape.meta?.bgImage}
                        value={activeShape.meta?.bgSize || 'cover'}
                        onChange={(val) => onUpdateMeta(activeShape.id, 'bgSize', val)}
                        data={[
                            { label: 'Cover', value: 'cover' },
                            { label: 'Contain', value: 'contain' },
                            { label: 'Auto', value: 'auto' },
                        ]}
                    />
                </Stack>
            )}
        </Box>
    );
}
