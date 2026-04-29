import React, { useState, useEffect, useRef } from 'react';
import { Box, Group, Text } from '@mantine/core';
import { IconBracketsContain, IconChevronDown } from '@tabler/icons-react';
import Editor from '@monaco-editor/react';

export default function AdvancedCssSection({ activeShape, onUpdateMeta, isOpen, onToggle }) {
    const [localCss, setLocalCss] = useState('');
    const timerRef = useRef(null);

    useEffect(() => {
        if (activeShape) {
            setLocalCss(activeShape.meta?.customCss || '');
        }
    }, [activeShape?.id]);

    if (!activeShape) return null;

    const editorValue = `.${activeShape.id} {\n${localCss}\n}`;

    const handleEditorChange = (value) => {
        const prefix = `.${activeShape.id} {`;
        const suffix = `}`;
        let content = value;
        
        if (!content.startsWith(prefix)) content = prefix + '\n' + content.split('\n').slice(1).join('\n');
        if (!content.endsWith(suffix)) content = content.split('\n').slice(0, -1).join('\n') + '\n' + suffix;
        
        const lines = content.split('\n');
        const innerContent = lines.slice(1, -1).join('\n');
        
        // Сначала обновляем локальный стейт для мгновенной реакции
        setLocalCss(innerContent);

        // Дебаунс для сохранения в историю
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onUpdateMeta(activeShape.id, 'customCss', innerContent);
        }, 800); // Сохраняем в историю только если юзер замер на 0.8 сек
    };

    return (
        <Box>
            <Group 
                p="xs" px="md" justify="space-between" 
                onClick={onToggle}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
            >
                <Group gap={6}>
                    <IconBracketsContain size={14} color="#f59e0b" />
                    <Text size="xs" fw={700} c="dimmed">ADVANCED CSS</Text>
                </Group>
                <IconChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </Group>

            {isOpen && (
                <Box style={{ height: 250 }}>
                    <Editor
                        height="100%"
                        defaultLanguage="css"
                        theme="vs-dark"
                        value={editorValue}
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 12,
                            lineNumbers: 'on',
                            padding: { top: 10, bottom: 10 },
                            scrollBeyondLastLine: false,
                            wordWrap: 'on'
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}
