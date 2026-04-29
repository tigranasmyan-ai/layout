import React, { useState, useEffect, useRef } from 'react';
import { Box, Group, Text, Collapse } from '@mantine/core';
import { IconBracketsContain, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import Editor from '@monaco-editor/react';

export default function AdvancedCssSection({ 
    activeShape, onUpdateMeta, 
    isOpen = false, onToggle 
}) {
    const m = activeShape?.meta || {};
    const [localCss, setLocalCss] = useState(m.customCss || '');
    const timerRef = useRef(null);

    useEffect(() => {
        setLocalCss(m.customCss || '');
    }, [activeShape?.id, m.customCss]);

    const handleCssChange = (val) => {
        setLocalCss(val);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onUpdateMeta(activeShape.id, 'customCss', val);
        }, 800);
    };

    return (
        <Box style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Group 
                p="xs" px="md" justify="space-between" 
                onClick={onToggle}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
            >
                <Group gap={6}>
                    {isOpen ? <IconChevronDown size={14} color="#a855f7" /> : <IconChevronRight size={14} color="#a855f7" />}
                    <IconBracketsContain size={14} color="#a855f7" />
                    <Text size="xs" fw={700} c="dimmed">ADVANCED CSS</Text>
                </Group>
            </Group>

            <Collapse in={isOpen}>
                <Box p="xs">
                    <Editor
                        height="200px"
                        defaultLanguage="css"
                        theme="vs-dark"
                        value={localCss}
                        onChange={handleCssChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 12,
                            lineNumbers: 'off',
                            folding: false,
                            scrollBeyondLastLine: false,
                            backgroundColor: '#1a1a1e'
                        }}
                    />
                </Box>
            </Collapse>
        </Box>
    );
}
