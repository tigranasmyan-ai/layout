import React from 'react';
import { Box, Group, Text, Stack, ActionIcon, Button, Collapse } from '@mantine/core';
import { IconLayout2, IconChevronDown, IconBox, IconTrash, IconChevronRight } from '@tabler/icons-react';
import { getPref, updatePref, groupBlocksByParent } from '@utils';

function NavigatorSection({ 
    blocks, selectedId, onSelect, onRemove, onClear, 
    isOpen = true, onToggle 
}) {
    const [collapsedIds, setCollapsedIds] = React.useState(() => {
        const saved = getPref('collapsedLayers', []);
        return new Set(saved);
    });

    const blocksByParent = React.useMemo(() => groupBlocksByParent(blocks), [blocks]);

    React.useEffect(() => {
        updatePref('collapsedLayers', [...collapsedIds]);
    }, [collapsedIds]);

    const toggleCollapse = (id, e) => {
        e.stopPropagation();
        setCollapsedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const renderTree = (parentId = 'root') => {
        const children = blocksByParent[parentId] || [];
        if (children.length === 0) return null;

        return (
            <Stack gap={2} mt={parentId === 'root' ? 0 : 4}>
                {children.map(shape => {
                    const hasChildren = (blocksByParent[shape.id] || []).length > 0;
                    const isCollapsed = collapsedIds.has(shape.id);

                    return (
                        <Box key={shape.id}>
                            <Group 
                                gap="xs" px="xs" py={6}
                                style={{ 
                                    borderRadius: 4, cursor: 'pointer',
                                    background: selectedId === shape.id ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                                    border: selectedId === shape.id ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid transparent',
                                    transition: 'all 0.1s'
                                }}
                                onClick={() => onSelect(shape.id)}
                            >
                                {hasChildren ? (
                                    <IconChevronDown 
                                        size={14} 
                                        opacity={0.5} 
                                        onClick={(e) => toggleCollapse(shape.id, e)}
                                        style={{ 
                                            transform: isCollapsed ? 'rotate(-90deg)' : 'none',
                                            transition: 'transform 0.2s'
                                        }}
                                    />
                                ) : (
                                    <Box w={14} />
                                )}
                                <IconBox size={16} color={selectedId === shape.id ? '#818cf8' : '#4b5563'} />
                                <Text size="xs" fw={selectedId === shape.id ? 700 : 500} c={selectedId === shape.id ? 'white' : 'gray.5'} flex={1}>
                                    {shape.id.split('_')[0].toUpperCase()} <Text span size="10px" opacity={0.4}>#{shape.id.split('_')[1]}</Text>
                                </Text>
                                <ActionIcon 
                                    size="xs" variant="subtle" color="red" 
                                    onClick={(e) => { e.stopPropagation(); onRemove(shape.id); }}
                                    style={{ opacity: selectedId === shape.id ? 1 : 0 }}
                                    className="navigator-delete"
                                >
                                    <IconTrash size={10} />
                                </ActionIcon>
                            </Group>
                            {!isCollapsed && hasChildren && (
                                <Box ml={16} style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                                    {renderTree(shape.id)}
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Stack>
        );
    };

    return (
        <Box style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Group 
                p="xs" px="md" justify="space-between" 
                bg="rgba(255,255,255,0.02)" 
                onClick={onToggle}
                style={{ cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
                <Group gap={6}>
                    {isOpen ? <IconChevronDown size={14} color="gray" /> : <IconChevronRight size={14} color="gray" />}
                    <IconLayout2 size={14} color="gray" />
                    <Text size="xs" fw={700} c="dimmed">NAVIGATOR</Text>
                </Group>
                {isOpen && (
                    <Button size="compact-xs" variant="subtle" color="red" onClick={(e) => { e.stopPropagation(); onClear(); }} styles={{ label: { fontSize: '9px' } }}>CLEAR ALL</Button>
                )}
            </Group>
            
            <Collapse in={isOpen}>
                <Box p="xs" style={{ maxHeight: 400, overflowY: 'auto' }}>
                    {renderTree()}
                </Box>
            </Collapse>
        </Box>
    );
}

export default React.memo(NavigatorSection);
