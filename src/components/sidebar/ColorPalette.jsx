import React from 'react';
import { Box, Group, ColorInput, ActionIcon, Tooltip } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';

export default function ColorPalette({ palette = [], onSelect, onAdd, onRemove }) {
    return (
        <Stack gap={6}>
            <Group gap={6} wrap="wrap">
                {palette.map((color, i) => (
                    <Box key={i} style={{ position: 'relative' }} className="color-swatch-wrapper">
                        <Tooltip label={color} size="xs" openDelay={500}>
                            <Box 
                                onClick={() => onSelect(color)}
                                style={{
                                    width: 22, height: 22, borderRadius: 4, background: color,
                                    cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'transform 0.1s'
                                }}
                                className="hover-scale"
                            />
                        </Tooltip>
                        <ActionIcon 
                            size={12} variant="filled" color="red" radius="xl"
                            style={{ position: 'absolute', top: -6, right: -6, zIndex: 5, opacity: 0 }}
                            className="remove-color-btn"
                            onClick={(e) => { e.stopPropagation(); onRemove(color); }}
                        >
                            <IconX size={8} />
                        </ActionIcon>
                    </Box>
                ))}
                
                <ColorInput 
                    size="xs" variant="unstyled"
                    styles={{ input: { display: 'none' }, wrapper: { width: 22, height: 22 } }}
                    onChangeEnd={(val) => onAdd(val)}
                    leftSection={<IconPlus size={14} color="gray" />}
                    style={{ 
                        width: 22, height: 22, borderRadius: 4, 
                        border: '1px dashed rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                />
            </Group>

            <style>{`
                .color-swatch-wrapper:hover .remove-color-btn { opacity: 1 !important; }
                .hover-scale:hover { transform: scale(1.1); }
            `}</style>
        </Stack>
    );
}

const Stack = ({ children, gap, style }) => <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, ...style }}>{children}</div>;
