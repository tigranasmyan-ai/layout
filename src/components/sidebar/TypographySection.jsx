import React from 'react';
import { Box, Group, Text, Stack, Select, TextInput, NumberInput } from '@mantine/core';
import { IconTypography, IconChevronDown } from '@tabler/icons-react';

export default function TypographySection({ activeShape, shapes, onUpdateMeta, isOpen, onToggle }) {
    if (!activeShape) return null;
    
    const hasChildren = shapes.some(s => s && s.parentId === activeShape.id);
    if (hasChildren) return null;

    return (
        <Box style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Group 
                p="xs" px="md" justify="space-between" 
                onClick={onToggle}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
            >
                <Group gap={6}>
                    <IconTypography size={14} color="#818cf8" />
                    <Text size="xs" fw={700} c="dimmed">CONTENT & TYPOGRAPHY</Text>
                </Group>
                <IconChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </Group>

            {isOpen && (
                <Stack gap="xs" p="md">
                    <Select 
                        label={<Text size="xs" c="dimmed">Semantic Tag</Text>}
                        size="xs"
                        value={activeShape.meta?.tag || 'div'}
                        onChange={(val) => onUpdateMeta(activeShape.id, 'tag', val)}
                        data={[
                            { label: 'H1 - Main Heading', value: 'h1' },
                            { label: 'H2 - Sub Heading', value: 'h2' },
                            { label: 'H3 - Section Title', value: 'h3' },
                            { label: 'H4 - Small Title', value: 'h4' },
                            { label: 'H5 - Tiny Title', value: 'h5' },
                            { label: 'H6 - Smallest Title', value: 'h6' },
                            { label: 'P - Paragraph', value: 'p' },
                        ]}
                    />
                    <TextInput 
                        label={<Text size="xs" c="dimmed">Block Text Content</Text>}
                        placeholder="Select tag first..."
                        size="xs"
                        disabled={!activeShape.meta?.tag}
                        value={activeShape.meta?.text || ''}
                        onChange={(e) => onUpdateMeta(activeShape.id, 'text', e.target.value)}
                    />
                    <Group grow gap="xs">
                        <NumberInput 
                            label={<Text size="xs" c="dimmed">Size</Text>}
                            size="xs" disabled={!activeShape.meta?.tag}
                            value={activeShape.meta?.fontSize || 16}
                            onChange={(val) => onUpdateMeta(activeShape.id, 'fontSize', val)}
                        />
                        <Select 
                            label={<Text size="xs" c="dimmed">Weight</Text>}
                            size="xs" disabled={!activeShape.meta?.tag}
                            value={String(activeShape.meta?.fontWeight || 400)}
                            onChange={(val) => onUpdateMeta(activeShape.id, 'fontWeight', parseInt(val))}
                            data={[
                                { label: '100', value: '100' },
                                { label: '400', value: '400' },
                                { label: '700', value: '700' },
                                { label: '900', value: '900' },
                            ]}
                        />
                    </Group>
                </Stack>
            )}
        </Box>
    );
}
