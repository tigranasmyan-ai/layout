import React from 'react'
import { 
  ActionIcon, 
  SegmentedControl, 
  Select, 
  Group, 
  Divider,
  Tooltip
} from '@mantine/core'
import { 
  IconAlignLeft, 
  IconAlignCenter, 
  IconAlignRight, 
  IconAlignJustified, 
  IconAlignBoxTopCenter, 
  IconAlignBoxCenterMiddle, 
  IconAlignBoxBottomCenter,
  IconMaximize,
  IconTrash,
  IconArrowRight,
  IconArrowDown,
  IconTextWrap
} from '@tabler/icons-react'
import ScrubInput from './ScrubInput'

export default function HUD({ 
    activeShape, 
    editor, 
    camera, 
    hasChildren, 
    onUpdate, 
    onToggleRule, 
    onToggleFill 
}) {
    if (!activeShape) return null;

    const m = activeShape.meta || {};
    const w = Math.round(activeShape.props?.w || 0);
    const h = Math.round(activeShape.props?.h || 0);

    return (
        <div className="shape-context-hud pro-hud" style={{ 
            position: 'absolute', 
            left: (activeShape.x + camera.x) * camera.z, 
            top: (activeShape.y + camera.y) * camera.z - 12,
            transform: `translate(0, -100%) scale(${Math.max(0.7, Math.min(1, camera.z))})`,
            transformOrigin: 'bottom left',
            zIndex: 200000 
        }}>
            <Group gap="xs" p="xs" className="hud-toolbar premium-blur glass-dark floating-island" wrap="nowrap">
                {/* TAG SELECTOR */}
                <Select
                    size="xs"
                    w={80}
                    value={m.tag || 'div'}
                    onChange={(val) => onUpdate({tag: val}, activeShape.id)}
                    data={['div', 'section', 'article', 'aside', 'nav', 'header', 'footer'].map(t => ({ value: t, label: t.toUpperCase() }))}
                    comboboxProps={{ withinPortal: false }}
                />

                <Divider orientation="vertical" />

                {/* DIRECTION */}
                <SegmentedControl
                    size="xs"
                    value={m.direction === 'column' ? 'column' : 'row'}
                    onChange={(val) => onUpdate({direction: val}, activeShape.id)}
                    data={[
                        { label: <IconArrowRight size={14} />, value: 'row' },
                        { label: <IconArrowDown size={14} />, value: 'column' }
                    ]}
                />

                <Divider orientation="vertical" />

                {/* FLEXBOX CONTROLS */}
                {(hasChildren || activeShape.type === 'flex') && (
                    <>
                        <SegmentedControl
                            size="xs"
                            value={m.justify || 'flex-start'}
                            onChange={(val) => onToggleRule('justify', val)}
                            data={[
                                { label: <IconAlignLeft size={14} />, value: 'flex-start' },
                                { label: <IconAlignCenter size={14} />, value: 'center' },
                                { label: <IconAlignRight size={14} />, value: 'flex-end' },
                                { label: <IconAlignJustified size={14} />, value: 'space-between' }
                            ]}
                        />
                        <Divider orientation="vertical" />
                        <SegmentedControl
                            size="xs"
                            value={m.align || 'flex-start'}
                            onChange={(val) => onToggleRule('align', val)}
                            data={[
                                { label: <IconAlignBoxTopCenter size={14} />, value: 'flex-start' },
                                { label: <IconAlignBoxCenterMiddle size={14} />, value: 'center' },
                                { label: <IconAlignBoxBottomCenter size={14} />, value: 'flex-end' }
                            ]}
                        />
                        <Divider orientation="vertical" />
                    </>
                )}

                {/* BEHAVIOR */}
                <Group gap={4}>
                    <Tooltip label="Flex Wrap">
                        <ActionIcon 
                            size="md" 
                            variant={m.isWrap ? 'filled' : 'light'} 
                            onClick={() => onUpdate({isWrap: !m.isWrap}, activeShape.id)}
                        >
                            <IconTextWrap size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Fill Space">
                        <ActionIcon 
                            size="md" 
                            variant={m.isGrow ? 'filled' : 'light'} 
                            onClick={() => onToggleFill()}
                        >
                            <IconMaximize size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <ActionIcon 
                        size="md" 
                        variant={m.isFullH ? 'filled' : 'light'} 
                        onClick={() => onUpdate({isFullH: !m.isFullH}, activeShape.id)}
                    >
                        <span style={{ fontSize: 9, fontWeight: 'bold' }}>H100</span>
                    </ActionIcon>
                </Group>

                <Divider orientation="vertical" />

                {/* DIMENSIONS */}
                <Group gap={8} wrap="nowrap">
                    <ScrubInput label="W" value={m.isFullW ? '100%' : (m.isAutoW ? 'auto' : w)} onChange={(val) => { 
                        const isStr = typeof val === 'string', isAuto = isStr && val.toLowerCase() === 'auto'
                        editor.updateShape({ id: activeShape.id, props: { w: isStr ? w : val }, meta: { ...m, isFullW: isStr && val.includes('%'), isAutoW: isAuto, isGrow: false } })
                        onUpdate({}, activeShape.id) 
                    }} />
                    <ScrubInput label="P" value={m.padding ?? 20} onChange={(val) => onUpdate({ padding: val }, activeShape.id)} />
                    <ScrubInput label="G" value={m.gap ?? 0} onChange={(val) => onUpdate({ gap: val }, activeShape.id)} />
                    <ScrubInput label="H" value={m.isFullH ? '100%' : (m.isAutoH ? 'auto' : h)} onChange={(val) => { 
                        const isStr = typeof val === 'string', isAuto = isStr && val.toLowerCase() === 'auto'
                        editor.updateShape({ id: activeShape.id, props: { h: isStr ? h : val }, meta: { ...m, isFullH: isStr && val.includes('%'), isAutoH: isAuto } })
                        onUpdate({}, activeShape.id) 
                    }} />
                </Group>

                {m.bgImage && (
                    <>
                        <Divider orientation="vertical" />
                        <ActionIcon color="red" variant="light" onClick={() => onUpdate({ bgImage: null }, activeShape.id)} title="Remove Photo">
                            <IconTrash size={16} />
                        </ActionIcon>
                    </>
                )}
            </Group>
        </div>
    );
}
