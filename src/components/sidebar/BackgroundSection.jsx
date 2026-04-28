import React from 'react';
import { Box, Group, Text, Stack, FileInput, Button, SegmentedControl } from '@mantine/core';
import { IconPhoto, IconChevronDown } from '@tabler/icons-react';

export default function BackgroundSection({ activeShape, onUpdateMeta, isOpen, onToggle }) {
    if (!activeShape) return null;

    return (
        <Box style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Group 
                p="xs" px="md" justify="space-between" 
                onClick={onToggle}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
            >
                <Group gap={6}>
                    <IconPhoto size={14} color="#ec4899" />
                    <Text size="xs" fw={700} c="dimmed">BACKGROUND</Text>
                </Group>
                <IconChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </Group>
            
            {isOpen && (
                <Stack gap="xs" p="md">
                    <FileInput 
                        label={<Text size="xs" c="dimmed">Upload Background</Text>}
                        placeholder="Choose image..."
                        size="xs"
                        accept="image/*"
                        onChange={(file) => {
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => onUpdateMeta(activeShape.id, 'bgImage', reader.result);
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    {activeShape.meta?.bgImage && (
                        <Button size="compact-xs" variant="subtle" color="red" onClick={() => onUpdateMeta(activeShape.id, 'bgImage', '')}>
                            Remove Image
                        </Button>
                    )}
                    <SegmentedControl 
                        size="xs" fullWidth
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
