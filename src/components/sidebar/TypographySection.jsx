import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Group, Text, ActionIcon, Stack, Select, TextInput, Textarea, Modal, Button 
} from '@mantine/core';
import { IconChevronDown, IconTypography, IconPlus, IconArrowsMaximize, IconSettings } from '@tabler/icons-react';

const SYSTEM_FONTS = [
    { value: 'Inter, sans-serif', label: 'Inter (Default)' },
    { value: 'serif', label: 'Serif' },
    { value: 'sans-serif', label: 'Sans-serif' },
    { value: 'monospace', label: 'Monospace' },
];

export default function TypographySection({ 
    activeShape, onUpdateMeta, isOpen, onToggle, availableFonts = [], onOpenFonts, onOpenColors, palette = []
}) {
    const [fullEditorOpened, setFullEditorOpened] = useState(false);
    const [localText, setLocalText] = useState('');
    const [localFontSize, setLocalFontSize] = useState('');
    const timerRef = useRef({});

    const m = activeShape?.meta || {};

    useEffect(() => {
        if (activeShape) {
            setLocalText(activeShape.meta?.text || '');
            setLocalFontSize(activeShape.meta?.fontSize || '16px');
        }
    }, [activeShape?.id]);

    const debouncedUpdate = (key, value) => {
        if (timerRef.current[key]) clearTimeout(timerRef.current[key]);
        timerRef.current[key] = setTimeout(() => {
            onUpdateMeta(activeShape.id, key, value);
        }, 800);
    };

    if (!activeShape) return null;
    
    const fontOptions = [
        ...SYSTEM_FONTS,
        ...availableFonts.map(f => ({ value: f.family, label: f.family }))
    ];

    const colorOptions = palette.map(c => ({ value: c.value, label: c.name }));
    const selectedPaletteColor = palette.find(c => c.value === m.color);
    const displayColorValue = selectedPaletteColor ? selectedPaletteColor.value : null;

    return (
        <Box style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Group 
                p="xs" px="md" justify="space-between" 
                style={{ cursor: 'pointer', background: isOpen ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                onClick={onToggle}
            >
                <Group gap="xs">
                    <IconTypography size={14} color="gray" />
                    <Text size="xs" fw={700} c="dimmed">TYPOGRAPHY</Text>
                </Group>
                <IconChevronDown size={14} style={{ transform: isOpen ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
            </Group>

            {isOpen && (
                <Stack p="xs" gap={8}>
                    <Group grow gap="xs">
                        <Select 
                            label="Family"
                            size="xs"
                            data={fontOptions}
                            value={m.fontFamily || 'Inter, sans-serif'}
                            onChange={(val) => onUpdateMeta(activeShape.id, 'fontFamily', val)}
                        />
                        <Box>
                            <Text size="xs" fw={500} mb={4}>Tag</Text>
                            <Group gap={4}>
                                <Select 
                                    size="xs"
                                    style={{ flex: 1 }}
                                    data={['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']}
                                    value={m.tag || 'p'}
                                    onChange={(val) => onUpdateMeta(activeShape.id, 'tag', val)}
                                />
                                <ActionIcon variant="light" size="xs" onClick={onOpenFonts} title="Manage Fonts">
                                    <IconPlus size={14} />
                                </ActionIcon>
                            </Group>
                        </Box>
                    </Group>

                    <Box>
                        <Group justify="space-between" mb={4}>
                            <Text size="xs" fw={500}>Text Color</Text>
                            <ActionIcon variant="subtle" size="xs" onClick={onOpenColors} title="Manage Palette">
                                <IconSettings size={12} />
                            </ActionIcon>
                        </Group>
                        {palette.length > 0 ? (
                            <Select 
                                size="xs"
                                placeholder="Select from palette"
                                data={colorOptions}
                                value={displayColorValue}
                                onChange={(val) => onUpdateMeta(activeShape.id, 'color', val)}
                            />
                        ) : (
                            <Button fullWidth size="xs" variant="light" leftSection={<IconPlus size={14}/>} onClick={onOpenColors}>
                                Setup Palette
                            </Button>
                        )}
                    </Box>

                    <Box style={{ position: 'relative' }}>
                        <Textarea 
                            label="Text"
                            placeholder="Content..."
                            size="xs"
                            autosize
                            minRows={1}
                            maxRows={6}
                            value={localText}
                            onChange={(e) => {
                                setLocalText(e.target.value);
                                debouncedUpdate('text', e.target.value);
                            }}
                            styles={{ input: { paddingRight: 30 } }}
                        />
                        <ActionIcon 
                            variant="subtle" 
                            size="xs" 
                            style={{ position: 'absolute', right: 4, bottom: 4, zIndex: 5 }}
                            onClick={() => setFullEditorOpened(true)}
                        >
                            <IconArrowsMaximize size={12} />
                        </ActionIcon>
                    </Box>

                    <Group grow gap="xs">
                        <TextInput 
                            label="Size"
                            size="xs"
                            placeholder="16px"
                            value={localFontSize}
                            onChange={(e) => {
                                setLocalFontSize(e.target.value);
                                debouncedUpdate('fontSize', e.target.value);
                            }}
                        />
                        <Select 
                            label="Weight"
                            size="xs"
                            data={['300', '400', '500', '600', '700', '800', '900']}
                            value={String(m.fontWeight || '400')}
                            onChange={(val) => onUpdateMeta(activeShape.id, 'fontWeight', val)}
                        />
                    </Group>
                </Stack>
            )}

            <Modal
                opened={fullEditorOpened}
                onClose={() => setFullEditorOpened(false)}
                title={<Text fw={700}>Edit Content</Text>}
                size="lg"
                centered
                styles={{ content: { background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)' }, header: { background: '#1a1a1e' } }}
            >
                <Textarea 
                    placeholder="Type your content here..."
                    minRows={10}
                    autosize
                    value={localText}
                    onChange={(e) => {
                        setLocalText(e.target.value);
                        debouncedUpdate('text', e.target.value);
                    }}
                />
                <Group justify="flex-end" mt="md">
                    <Button onClick={() => setFullEditorOpened(false)}>Done</Button>
                </Group>
            </Modal>
        </Box>
    );
}
