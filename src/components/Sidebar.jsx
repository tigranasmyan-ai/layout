import React, { useRef } from 'react'
import { 
    Box, 
    Text, 
    Group, 
    ScrollArea, 
    ActionIcon, 
    Stack,
    Slider,
    Button,
    FileInput,
    TextInput,
    SegmentedControl,
    Divider,
    NumberInput,
    Select
} from '@mantine/core'
import { 
    IconBox, 
    IconChevronDown, 
    IconBolt,
    IconCode,
    IconLayout2,
    IconBracketsContain,
    IconPhoto,
    IconTrash,
    IconTypography,
    IconAlignLeft,
    IconAlignCenter,
    IconAlignRight
} from '@tabler/icons-react'
import Editor from '@monaco-editor/react'

export default function Sidebar({ 
    activeShape, 
    shapes, 
    onSelect, 
    onAddBlock, 
    onUpdateMeta, 
    onShowCode, 
    onClear,
    blueprint,
    onUpdateBlueprint
}) {
    const editorRef = useRef(null);

    const handleEditorChange = (value) => {
        if (!activeShape) return;
        const prefix = `.${activeShape.id} {`;
        const suffix = `}`;
        let content = value;
        if (!content.startsWith(prefix)) content = prefix + '\n' + content.split('\n').slice(1).join('\n');
        if (!content.endsWith(suffix)) content = content.split('\n').slice(0, -1).join('\n') + '\n' + suffix;
        const lines = content.split('\n');
        const innerContent = lines.slice(1, -1).join('\n');
        onUpdateMeta(activeShape.id, 'customCss', innerContent);
    };

    const handleImageUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                onUpdateBlueprint({ 
                    url: e.target.result,
                    w: img.naturalWidth // Устанавливаем реальную ширину макета
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

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
                            <Text size="xs" fw={activeShape?.id === shape.id ? 700 : 500} c={activeShape?.id === shape.id ? 'white' : 'gray.5'}>
                                {shape.id.split('_')[0].toUpperCase()} <Text span size="10px" opacity={0.4}>#{shape.id.split('_')[1]}</Text>
                            </Text>
                        </Group>
                        <Box ml={16} style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                            {renderTree(shape.id)}
                        </Box>
                    </Box>
                ))}
            </Stack>
        )
    }

    const editorValue = activeShape ? `.${activeShape.id} {\n${activeShape.meta?.customCss || ''}\n}` : '';

    return (
        <Box style={{ width: 320, height: '100%', borderRight: '1px solid rgba(255,255,255,0.1)', background: '#0f0f11', display: 'flex', flexDirection: 'column' }}>
            <Box p="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Group justify="space-between">
                    <Group gap="xs">
                        <IconBolt size={20} color="#4f46e5" />
                        <Text fw={800} size="sm" c="white" lts="1px">FLEX ARCHITECT</Text>
                    </Group>
                    <ActionIcon variant="subtle" color="gray" size="sm" onClick={onShowCode} title="View Code">
                        <IconCode size={16} />
                    </ActionIcon>
                </Group>
            </Box>

            {/* BLUEPRINT SECTION */}
            <Box p="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Group justify="space-between" mb="xs">
                    <Group gap={6}>
                        <IconPhoto size={14} color="#10b981" />
                        <Text size="xs" fw={700} c="dimmed">BLUEPRINT (MOCKUP)</Text>
                    </Group>
                    {blueprint.url && (
                        <ActionIcon size="xs" color="red" variant="subtle" onClick={() => onUpdateBlueprint({ url: null })}>
                            <IconTrash size={12} />
                        </ActionIcon>
                    )}
                </Group>
                
                {!blueprint.url ? (
                    <FileInput 
                        placeholder="Import image mockup..." 
                        size="xs" 
                        accept="image/*"
                        leftSection={<IconPhoto size={14} />}
                        onChange={handleImageUpload}
                    />
                ) : (
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text size="10px" c="dimmed">OPACITY</Text>
                            <Text size="10px" fw={700} c="white">{Math.round(blueprint.opacity * 100)}%</Text>
                        </Group>
                        <Slider 
                            size="xs"
                            min={0} max={1} step={0.01}
                            value={blueprint.opacity}
                            onChange={(val) => onUpdateBlueprint({ opacity: val })}
                        />
                    </Stack>
                )}
            </Box>

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

            {activeShape && (
                (() => {
                    const hasChildren = shapes.some(s => s.parentId === activeShape.id);
                    if (hasChildren) return null;

                    return (
                        <Box p="md" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                            <Group gap={6} mb="xs">
                                <IconTypography size={14} color="#818cf8" />
                                <Text size="xs" fw={700} c="dimmed">CONTENT & TYPOGRAPHY</Text>
                            </Group>
                            
                            <Stack gap="xs">
                                <Select 
                                    label={<Text size="xs" c="dimmed">Semantic Tag</Text>}
                                    size="xs"
                                    value={activeShape.meta?.tag || 'div'}
                                    onChange={(val) => onUpdateMeta(activeShape.id, 'tag', val)}
                                    data={[
                                        { label: 'H1 - Main Heading', value: 'h1' },
                                        { label: 'H2 - Sub Heading', value: 'h2' },
                                        { label: 'H3 - Section Title', value: 'h3' },
                                        { label: 'H4 - Small Title', value: 'h4' },
                                        { label: 'H5 - Tiny Title', value: 'h5' },
                                        { label: 'H6 - Smallest Title', value: 'h6' },
                                        { label: 'P - Paragraph', value: 'p' },
                                    ]}
                                />
                                <TextInput 
                                    label={<Text size="xs" c="dimmed">Block Text Content</Text>}
                                    placeholder="Select tag first..."
                                    size="xs"
                                    disabled={!activeShape.meta?.tag}
                                    value={activeShape.meta?.text || ''}
                                    onChange={(e) => onUpdateMeta(activeShape.id, 'text', e.target.value)}
                                />
                                
                                <Group grow gap="xs">
                                    <NumberInput 
                                        label={<Text size="xs" c="dimmed">Size</Text>}
                                        size="xs"
                                        disabled={!activeShape.meta?.tag}
                                        value={activeShape.meta?.fontSize || 16}
                                        onChange={(val) => onUpdateMeta(activeShape.id, 'fontSize', val)}
                                    />
                                    <Select 
                                        label={<Text size="xs" c="dimmed">Weight</Text>}
                                        size="xs"
                                        disabled={!activeShape.meta?.tag}
                                        value={String(activeShape.meta?.fontWeight || 400)}
                                        onChange={(val) => onUpdateMeta(activeShape.id, 'fontWeight', parseInt(val))}
                                        data={[
                                            { label: '100 - Thin', value: '100' },
                                            { label: '200 - Extra Light', value: '200' },
                                            { label: '300 - Light', value: '300' },
                                            { label: '400 - Regular', value: '400' },
                                            { label: '500 - Medium', value: '500' },
                                            { label: '600 - Semi Bold', value: '600' },
                                            { label: '700 - Bold', value: '700' },
                                            { label: '800 - Extra Bold', value: '800' },
                                            { label: '900 - Black', value: '900' },
                                        ]}
                                    />
                                </Group>

                                <Box>
                                    <Text size="xs" c="dimmed" mb={4}>Text Align (Applies to parent)</Text>
                                    {(() => {
                                        const parent = shapes.find(s => s.id === activeShape.parentId);
                                        const targetId = parent ? parent.id : activeShape.id;
                                        const currentAlign = parent ? (parent.meta?.textAlign || 'left') : (activeShape.meta?.textAlign || 'left');

                                        return (
                                            <SegmentedControl 
                                                size="xs"
                                                fullWidth
                                                disabled={!activeShape.meta?.tag}
                                                value={currentAlign}
                                                onChange={(val) => onUpdateMeta(targetId, 'textAlign', val)}
                                                data={[
                                                    { label: <IconAlignLeft size={14} />, value: 'left' },
                                                    { label: <IconAlignCenter size={14} />, value: 'center' },
                                                    { label: <IconAlignRight size={14} />, value: 'right' },
                                                ]}
                                            />
                                        );
                                    })()}
                                </Box>
                            </Stack>
                        </Box>
                    );
                })()
            )}

            {activeShape && (
                <Box style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: '#141417' }}>
                    <Group p="xs" px="md" bg="rgba(0,0,0,0.2)">
                        <IconBracketsContain size={14} color="#f59e0b" />
                        <Text size="xs" fw={700} c="white">ADVANCED CSS</Text>
                    </Group>
                    
                    <Box style={{ height: 250 }}>
                        <Editor
                            height="100%"
                            defaultLanguage="css"
                            theme="vs-dark"
                            value={editorValue}
                            onChange={handleEditorChange}
                            onMount={(editor) => { editorRef.current = editor; }}
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
                </Box>
            )}
        </Box>
    )
}
