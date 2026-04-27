import React from 'react'
import { 
  ActionIcon, 
  Button, 
  ScrollArea, 
  Group, 
  Stack, 
  Text, 
  Divider,
  Tooltip,
  Paper,
  Badge
} from '@mantine/core'
import { 
  IconEye, 
  IconEyeOff, 
  IconLock, 
  IconLockOpen, 
  IconPhoto, 
  IconCode, 
  IconDownload, 
  IconTrash, 
  IconBolt,
  IconPalette,
  IconFiles
} from '@tabler/icons-react'

export default function Sidebar({ 
    activeShape, 
    shapes, 
    showPhotos, 
    setShowPhotos, 
    isGlobalLock, 
    toggleGlobalLock, 
    onAddImage, 
    onShowCode, 
    onExport, 
    onMetaUpdate, 
    onDeleteShape,
    cssPreview,
    MonacoComponent
}) {
    const bgShapes = shapes.filter(s => s.meta?.bgImage)

    return (
        <aside className="sidebar premium-blur glass-dark">
            <Stack gap={0} h="100%">
                {/* HEADER */}
                <Paper p="md" bg="transparent">
                    <Group justify="space-between" wrap="nowrap">
                        <Group gap="xs">
                            <IconBolt size={22} color="#3b82f6" fill="#3b82f6" />
                            <Text fw={700} size="lg" tracking="tight">Flex Architect</Text>
                            <Badge size="xs" variant="light" color="blue">v2.8</Badge>
                        </Group>
                        <Group gap={4}>
                            <Tooltip label="Toggle Visibility">
                                <ActionIcon variant="subtle" color="gray" onClick={() => setShowPhotos(!showPhotos)}>
                                    {showPhotos ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                                </ActionIcon>
                            </Tooltip>
                            <Tooltip label={isGlobalLock ? 'Unlock Layers' : 'Lock Layers'}>
                                <ActionIcon variant="subtle" color={isGlobalLock ? 'gray' : 'blue'} onClick={toggleGlobalLock}>
                                    {isGlobalLock ? <IconLock size={18} /> : <IconLockOpen size={18} />}
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>
                    
                    <Group grow mt="md" gap="xs">
                        <Button leftSection={<IconPhoto size={16} />} variant="light" size="xs" onClick={onAddImage}>Image</Button>
                        <Button leftSection={<IconCode size={16} />} variant="light" color="gray" size="xs" onClick={onShowCode}>Source</Button>
                        <Button leftSection={<IconDownload size={16} />} variant="filled" color="blue" size="xs" onClick={onExport}>Export</Button>
                    </Group>
                </Paper>

                <Divider color="rgba(255,255,255,0.1)" />

                {/* CONTENT */}
                <ScrollArea scrollbars="y" flex={1} p="md">
                    <Stack gap="xl">
                        {/* STYLE EDITOR */}
                        <Stack gap="xs">
                            <Group gap="xs">
                                <IconPalette size={16} color="#3b82f6" />
                                <Text size="xs" fw={700} c="dimmed">STYLE EDITOR</Text>
                                {activeShape && <Badge variant="dot" size="xs">.{activeShape.id.slice(-4)}</Badge>}
                            </Group>
                            
                            {activeShape ? (
                                <Paper withBorder p={0} bg="rgba(0,0,0,0.2)" style={{ overflow: 'hidden' }}>
                                    <MonacoComponent 
                                        blockName={activeShape.id.replace('shape:', 'box-')} 
                                        value={activeShape.meta?.manualCSS || ''} 
                                        onChange={(val) => onMetaUpdate({ manualCSS: val }, activeShape.id)} 
                                    />
                                </Paper>
                            ) : (
                                <Paper p="xl" bg="rgba(255,255,255,0.03)" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <Stack align="center" gap="xs">
                                        <IconBolt size={32} opacity={0.1} />
                                        <Text size="xs" c="dimmed" ta="center">Select a block to edit styles</Text>
                                    </Stack>
                                </Paper>
                            )}
                        </Stack>

                        {/* ATTACHED PHOTOS */}
                        <Stack gap="xs">
                            <Group gap="xs">
                                <IconPhoto size={16} color="#3b82f6" />
                                <Text size="xs" fw={700} c="dimmed">PHOTOS ({bgShapes.length})</Text>
                            </Group>
                            
                            {bgShapes.length > 0 ? (
                                <Stack gap="xs">
                                    {bgShapes.map(s => (
                                        <Paper key={s.id} p={4} withBorder bg="rgba(255,255,255,0.02)">
                                            <Group justify="space-between" wrap="nowrap">
                                                <Group gap="xs" wrap="nowrap">
                                                    <div style={{ width: 32, height: 32, borderRadius: 4, backgroundImage: `url(${s.meta.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                                    <Text size="xs" truncate maw={100}>box-{s.id.slice(-4)}</Text>
                                                </Group>
                                                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => onDeleteShape(s.id)}>
                                                    <IconTrash size={14} />
                                                </ActionIcon>
                                            </Group>
                                        </Paper>
                                    ))}
                                </Stack>
                            ) : (
                                <Text size="xs" c="dimmed" fs="italic">No images attached</Text>
                            )}
                        </Stack>

                        {/* LIVE CSS FEED */}
                        <Stack gap="xs">
                            <Group gap="xs">
                                <IconFiles size={16} color="#3b82f6" />
                                <Text size="xs" fw={700} c="dimmed">LIVE CSS FEED</Text>
                            </Group>
                            <Paper p="xs" bg="rgba(0,0,0,0.4)" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                                <pre style={{ margin: 0, fontSize: 10, color: '#94a3b8', overflowX: 'auto' }}>
                                    <code>{cssPreview}</code>
                                </pre>
                            </Paper>
                        </Stack>
                    </Stack>
                </ScrollArea>
            </Stack>
        </aside>
    )
}
