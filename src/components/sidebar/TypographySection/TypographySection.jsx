import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Group, Text, ActionIcon, Stack, Select, TextInput, Textarea, Modal, Button 
} from '@mantine/core';
import { IconChevronDown, IconTypography, IconPlus, IconArrowsMaximize, IconChevronRight } from '@tabler/icons-react';

export default function TypographySection({ 
    activeShape, onUpdateMeta, availableFonts = [], onOpenFonts,
    isOpen = true, onToggle 
}) {
    const m = activeShape?.meta || {};
    const textStyle = m.text || {};
    
    // Local state for debouncing
    const [localText, setLocalText] = useState(textStyle.content || '');
    const timerRef = useRef(null);

    useEffect(() => {
        setLocalText(textStyle.content || '');
    }, [activeShape?.id, textStyle.content]);

    const updateTextStyle = (updates) => {
        onUpdateMeta(activeShape.id, 'text', { ...textStyle, ...updates });
    };

    const handleTextChange = (val) => {
        setLocalText(val);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            updateTextStyle({ content: val });
        }, 500);
    };

    return (
        <Box style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Group 
                p="xs" px="md" justify="space-between" 
                onClick={onToggle}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
            >
                <Group gap={6}>
                    {isOpen ? <IconChevronDown size={14} color="#ec4899" /> : <IconChevronRight size={14} color="#ec4899" />}
                    <IconTypography size={14} color="#ec4899" />
                    <Text size="xs" fw={700} c="dimmed">TYPOGRAPHY</Text>
                </Group>
            </Group>

            {isOpen && (
                <Box p="md" pt="xs">
                    <Stack gap="xs">
                        <Text size="10px" c="dimmed">FONT FAMILY</Text>
                        <Group gap={4}>
                            <Select
                                size="xs"
                                flex={1}
                                data={availableFonts.map(f => ({ value: f.family, label: f.family }))}
                                value={textStyle.fontFamily || 'Inter'}
                                onChange={(val) => updateTextStyle({ fontFamily: val })}
                                searchable
                            />
                            <ActionIcon variant="light" onClick={onOpenFonts} color="pink">
                                <IconPlus size={16} />
                            </ActionIcon>
                        </Group>

                        <Group grow gap="xs">
                            <Stack gap={4}>
                                <Text size="10px" c="dimmed">SIZE</Text>
                                <TextInput 
                                    size="xs" 
                                    value={textStyle.fontSize || '16px'}
                                    onChange={(e) => updateTextStyle({ fontSize: e.currentTarget.value })}
                                />
                            </Stack>
                            <Stack gap={4}>
                                <Text size="10px" c="dimmed">WEIGHT</Text>
                                <Select
                                    size="xs"
                                    data={['100', '200', '300', '400', '500', '600', '700', '800', '900']}
                                    value={String(textStyle.fontWeight || '400')}
                                    onChange={(val) => updateTextStyle({ fontWeight: val })}
                                />
                            </Stack>
                        </Group>

                        <Stack gap={4}>
                            <Text size="10px" c="dimmed">CONTENT</Text>
                            <Textarea 
                                size="xs"
                                minRows={3}
                                value={localText}
                                onChange={(e) => handleTextChange(e.currentTarget.value)}
                            />
                        </Stack>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}
