import React from 'react';
import { Box, Group, Text, ScrollArea, Stack, ActionIcon } from '@mantine/core';
import { IconLayout2, IconChevronDown, IconBox, IconTrash } from '@tabler/icons-react';

export default function NavigatorSection({ shapes, activeShape, onSelect, onClear }) {
    const renderTree = (parentId = 'root') => {
        const children = shapes.filter(s => s && (s.parentId || 'root') === parentId);
        if (children.length === 0) return null;

        return (
            <Stack gap={2} mt={parentId === 'root' ? 0 : 4}>
                {children.map(shape => (
                    <Box key={shape.id}>
                        <Group 
                            gap="xs" px="xs" py={6}
                            style={{ 
                                borderRadius: 4, cursor: 'pointer',
                                background: activeShape?.id === shape.id ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                                border: activeShape?.id === shape.id ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid transparent',
                                transition: 'all 0.1s'
                            }}
                            onClick={() => onSelect(shape.id)}
                        >
                            {shapes.some(s => s && s.parentId === shape.id) ? <IconChevronDown size={14} opacity={0.5} /> : <Box w={14} />}
                            <IconBox size={16} color={activeShape?.id === shape.id ? '#818cf8' : '#4b5563'} />
                            <Text size="xs" fw={activeShape?.id === shape.id ? 700 : 500} c={activeShape?.id === shape.id ? 'white' : 'gray.5'} flex={1}>
                                {shape.id.split('_')[0].toUpperCase()} <Text span size="10px" opacity={0.4}>#{shape.id.split('_')[1]}</Text>
                            </Text>
                            <ActionIcon 
                                size="xs" variant="subtle" color="red" 
                                onClick={(e) => { e.stopPropagation(); onClear(shape.id); }}
                                style={{ opacity: activeShape?.id === shape.id ? 1 : 0 }}
                                className="navigator-delete"
                            >
                                <IconTrash size={10} />
                            </ActionIcon>
                        </Group>
                        <Box ml={16} style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                            {renderTree(shape.id)}
                        </Box>
                    </Box>
                ))}
            </Stack>
        );
    };

    return (
        <Box flex={1} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Group p="xs" px="md" justify="space-between" bg="rgba(255,255,255,0.02)">
                <Group gap={6}>
                    <IconLayout2 size={14} color="gray" />
                    <Text size="xs" fw={700} c="dimmed">NAVIGATOR</Text>
                </Group>
            </Group>
            <ScrollArea scrollbars="y" style={{ flex: 1 }} p="xs">
                {renderTree()}
            </ScrollArea>
        </Box>
    );
}
