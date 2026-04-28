import React from 'react'
import { 
  Box, 
  Button, 
  ScrollArea, 
  Group, 
  Stack, 
  Text, 
  Divider,
  Paper,
  Badge,
  ActionIcon,
  SegmentedControl,
  NumberInput,
  SimpleGrid
} from '@mantine/core'
import { 
  IconBolt, 
  IconFiles, 
  IconSettings, 
  IconArrowsHorizontal, 
  IconArrowsVertical,
  IconLayoutAlignLeft,
  IconLayoutAlignCenter,
  IconLayoutAlignRight,
  IconLayoutAlignTop,
  IconLayoutAlignMiddle,
  IconLayoutAlignBottom,
  IconLayoutDistributeHorizontal,
  IconCircle,
  IconPlus,
  IconCode
} from '@tabler/icons-react'

export default function Sidebar({ 
    activeShape, 
    shapes = [],
    onShowCode, 
    onSelect,
    onAddBlock,
    onMetaUpdate, 
    MonacoComponent
}) {

    const updateMeta = (key, value) => {
        onMetaUpdate({ [key]: value }, activeShape?.id);
    }

    const updateNestedMeta = (group, key, value) => {
        const currentGroup = activeShape?.meta?.[group] || { top: 0, right: 0, bottom: 0, left: 0 };
        // Поддержка старого формата (если group была числом)
        const safeGroup = typeof currentGroup === 'object' ? currentGroup : { top: currentGroup, right: currentGroup, bottom: currentGroup, left: currentGroup };
        
        updateMeta(group, { ...safeGroup, [key]: value });
    }

    const renderNavigatorTree = (items, level = 0) => {
        return items.map(s => {
            const isSelected = activeShape?.id === s.id;
            const children = shapes.filter(child => child && child.parentId === s.id);
            
            return (
                <React.Fragment key={s.id}>
                    <Box 
                        onClick={() => onSelect(s.id)}
                        style={{ 
                            padding: '6px 10px', 
                            paddingLeft: 10 + (level * 16),
                            borderRadius: 4, 
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                            border: isSelected ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid transparent',
                            marginBottom: 2
                        }}
                    >
                        <Group gap="xs" wrap="nowrap">
                            <IconCircle size={ level === 0 ? 8 : 6} fill={isSelected ? '#818cf8' : 'rgba(255,255,255,0.2)'} strokeWidth={0} />
                            <Text size="xs" fw={isSelected ? 700 : 500} c={isSelected ? 'white' : 'dimmed'} truncate>
                                {s.id.toUpperCase()}
                            </Text>
                            {children.length > 0 && <Badge size="xs" variant="light" color="gray">{children.length}</Badge>}
                        </Group>
                    </Box>
                    {children.length > 0 && renderNavigatorTree(children, level + 1)}
                </React.Fragment>
            );
        });
    }

    const rootShapes = shapes.filter(s => s && !s.parentId);
    const m = activeShape?.meta?.margin || { top: 0, right: 0, bottom: 0, left: 0 };
    const p = activeShape?.meta?.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    
    // Безопасное получение значений паддинга (защита от старого формата)
    const safeP = typeof p === 'object' ? p : { top: p, right: p, bottom: p, left: p };

    return (
        <Box className="sidebar glass-dark premium-blur" style={{ 
            width: 320, 
            height: '100vh',
            borderRight: '1px solid rgba(255,255,255,0.05)', 
            display: 'flex', 
            flexDirection: 'column',
            zIndex: 100
        }}>
            <Box p="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Group justify="space-between" mb="md">
                    <Group gap="xs">
                        <IconBolt size={20} color="#4f46e5" />
                        <Text fw={800} size="sm" c="white" lts="1px">FLEX ARCHITECT</Text>
                    </Group>
                    <Badge variant="filled" color="indigo" size="xs">v3.0 PRO</Badge>
                </Group>
                <Group grow gap="xs">
                    <Button leftSection={<IconPlus size={16} />} variant="filled" color="indigo" size="xs" onClick={() => onAddBlock(null)}>
                        New Container
                    </Button>
                    <ActionIcon variant="light" color="gray" size="sm" onClick={onShowCode}><IconCode size={16}/></ActionIcon>
                </Group>
            </Box>

            <ScrollArea scrollbarSize={4} style={{ flex: 1 }}>
                <Stack gap="xl" p="md">
                    <Stack gap="xs">
                        <Group gap="xs" c="dimmed">
                            <IconFiles size={16} />
                            <Text size="xs" fw={700} lts="0.5px">NAVIGATOR</Text>
                        </Group>
                        <Box style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 4 }}>
                            {shapes.length === 0 ? (
                                <Text size="xs" c="dimmed" ta="center" py="xl">No blocks yet</Text>
                            ) : (
                                renderNavigatorTree(rootShapes)
                            )}
                        </Box>
                    </Stack>

                    <Stack gap="md">
                        <Group gap="xs" c="dimmed">
                            <IconSettings size={16} />
                            <Text size="xs" fw={700} lts="0.5px">PROPERTIES</Text>
                        </Group>
                        
                        {activeShape ? (
                            <Stack gap="lg">
                                <Button 
                                    leftSection={<IconPlus size={14} />} 
                                    variant="light" color="indigo" size="xs" fullWidth
                                    onClick={() => onAddBlock(activeShape.id)}
                                >
                                    Add Child
                                </Button>

                                <Divider opacity={0.1} label="Layout" labelPosition="center" />

                                <Stack gap={8}>
                                    <Text size="xs" fw={700} c="dimmed">DIRECTION</Text>
                                    <SegmentedControl fullWidth size="xs" value={activeShape.meta?.direction || 'row'} onChange={(val) => updateMeta('direction', val)}
                                        data={[{ label: <IconArrowsHorizontal size={14}/>, value: 'row' }, { label: <IconArrowsVertical size={14}/>, value: 'column' }]} />
                                </Stack>

                                <Group grow gap="xs">
                                    <Stack gap={4}>
                                        <Text size="xs" fw={700} c="dimmed">JUSTIFY</Text>
                                        <Group grow gap={2}>
                                            <ActionIcon size="sm" variant={activeShape.meta?.justify === 'flex-start' ? 'filled' : 'light'} color="indigo" onClick={() => updateMeta('justify', 'flex-start')}><IconLayoutAlignLeft size={14}/></ActionIcon>
                                            <ActionIcon size="sm" variant={activeShape.meta?.justify === 'center' ? 'filled' : 'light'} color="indigo" onClick={() => updateMeta('justify', 'center')}><IconLayoutAlignCenter size={14}/></ActionIcon>
                                            <ActionIcon size="sm" variant={activeShape.meta?.justify === 'flex-end' ? 'filled' : 'light'} color="indigo" onClick={() => updateMeta('justify', 'flex-end')}><IconLayoutAlignRight size={14}/></ActionIcon>
                                        </Group>
                                    </Stack>
                                    <Stack gap={4}>
                                        <Text size="xs" fw={700} c="dimmed">ALIGN</Text>
                                        <Group grow gap={2}>
                                            <ActionIcon size="sm" variant={activeShape.meta?.align === 'flex-start' ? 'filled' : 'light'} color="indigo" onClick={() => updateMeta('align', 'flex-start')}><IconLayoutAlignTop size={14}/></ActionIcon>
                                            <ActionIcon size="sm" variant={activeShape.meta?.align === 'center' ? 'filled' : 'light'} color="indigo" onClick={() => updateMeta('align', 'center')}><IconLayoutAlignMiddle size={14}/></ActionIcon>
                                            <ActionIcon size="sm" variant={activeShape.meta?.align === 'flex-end' ? 'filled' : 'light'} color="indigo" onClick={() => updateMeta('align', 'flex-end')}><IconLayoutAlignBottom size={14}/></ActionIcon>
                                        </Group>
                                    </Stack>
                                </Group>

                                <NumberInput label="GAP" size="xs" value={activeShape.meta?.gap || 0} onChange={(val) => updateMeta('gap', val)} min={0} />

                                {!activeShape.parentId ? (
                                    <Text size="xs" c="dimmed" ta="center" py="sm" bg="rgba(0,0,0,0.2)" style={{ borderRadius: 4 }}>
                                        Root element cannot have spacing
                                    </Text>
                                ) : (
                                    <>
                                        <Divider opacity={0.1} label="Padding" labelPosition="center" />
                                        <SimpleGrid cols={2} spacing="xs">
                                            <NumberInput label="TOP" size="xs" value={safeP.top} onChange={(v) => updateNestedMeta('padding', 'top', v)} />
                                            <NumberInput label="RIGHT" size="xs" value={safeP.right} onChange={(v) => updateNestedMeta('padding', 'right', v)} />
                                            <NumberInput label="BOTTOM" size="xs" value={safeP.bottom} onChange={(v) => updateNestedMeta('padding', 'bottom', v)} />
                                            <NumberInput label="LEFT" size="xs" value={safeP.left} onChange={(v) => updateNestedMeta('padding', 'left', v)} />
                                        </SimpleGrid>

                                        <Divider opacity={0.1} label="Margin" labelPosition="center" />
                                        <SimpleGrid cols={2} spacing="xs">
                                            <NumberInput label="TOP" size="xs" value={m.top} onChange={(v) => updateNestedMeta('margin', 'top', v)} />
                                            <NumberInput label="RIGHT" size="xs" value={m.right} onChange={(v) => updateNestedMeta('margin', 'right', v)} />
                                            <NumberInput label="BOTTOM" size="xs" value={m.bottom} onChange={(v) => updateNestedMeta('margin', 'bottom', v)} />
                                            <NumberInput label="LEFT" size="xs" value={m.left} onChange={(v) => updateNestedMeta('margin', 'left', v)} />
                                        </SimpleGrid>
                                    </>
                                )}
                            </Stack>
                        ) : (
                            <Paper p="xl" bg="rgba(0,0,0,0.1)" style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12 }}>
                                <Text size="xs" c="dimmed" ta="center">Select a block to edit its styles</Text>
                            </Paper>
                        )}
                    </Stack>
                </Stack>
            </ScrollArea>
        </Box>
    )
}
