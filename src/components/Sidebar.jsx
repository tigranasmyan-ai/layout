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
  ActionIcon
} from '@mantine/core'
import { 
  IconBolt, 
  IconFiles, 
  IconSettings, 
  IconCircle, 
  IconPlus, 
  IconCode,
  IconTrash
} from '@tabler/icons-react'

export default function Sidebar({ 
    activeShape, 
    shapes = [],
    onShowCode, 
    onSelect,
    onAddBlock,
    onClear
}) {

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

    return (
        <Box className="sidebar glass-dark premium-blur" style={{ 
            width: 300, 
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
                    <ActionIcon variant="subtle" color="red" size="sm" onClick={onClear} title="Clear Canvas">
                        <IconTrash size={16} />
                    </ActionIcon>
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
                            <Text size="xs" fw={700} lts="0.5px">STRUCTURE</Text>
                        </Group>
                        
                        {activeShape ? (
                            <Stack gap="lg">
                                <Button 
                                    leftSection={<IconPlus size={14} />} 
                                    variant="light" color="indigo" size="xs" fullWidth
                                    onClick={() => onAddBlock(activeShape.id)}
                                >
                                    Add Child Block
                                </Button>
                                <Divider opacity={0.1} />
                                <Text size="xs" c="dimmed" ta="center" italic>
                                    Use canvas handles to adjust spacing
                                </Text>
                            </Stack>
                        ) : (
                            <Paper p="xl" bg="rgba(0,0,0,0.1)" style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12 }}>
                                <Text size="xs" c="dimmed" ta="center">Select a block to manage hierarchy</Text>
                            </Paper>
                        )}
                    </Stack>
                </Stack>
            </ScrollArea>
        </Box>
    )
}
