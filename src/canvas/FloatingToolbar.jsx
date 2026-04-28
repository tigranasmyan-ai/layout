import React, { useState, useEffect } from 'react';
import { 
  IconArrowsHorizontal, 
  IconArrowsVertical,
  IconLayoutAlignLeft,
  IconLayoutAlignCenter,
  IconLayoutAlignRight,
  IconLayoutAlignTop,
  IconLayoutAlignMiddle,
  IconLayoutAlignBottom,
  IconLayoutDistributeHorizontal,
  IconPlus,
  IconCode,
  IconColumns,
  IconColumns1,
  IconColumns2,
  IconColumns3,
  IconNumber2,
  IconNumber3,
  IconNumber4,
  IconNumber5,
  IconFold
} from '@tabler/icons-react';

export default function FloatingToolbar({ block, zoom, hasChildren, onUpdateMeta, onUpdateSize, onAddBlock, onToggleCss, onApplyPreset }) {
    const invZoom = 1 / zoom;
    const { direction = 'row', justify = 'flex-start', align = 'flex-start', wrap = 'nowrap' } = block.meta || {};
    const [showPresets, setShowPresets] = useState(false);
    const [showMultiAdd, setShowMultiAdd] = useState(false);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: `translate(-50%, calc(-100% - 45px)) scale(${invZoom})`,
            transformOrigin: 'bottom center',
            background: 'rgba(20, 20, 25, 0.95)',
            backdropFilter: 'blur(12px)',
            padding: '4px',
            borderRadius: '8px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            zIndex: 3000,
            pointerEvents: 'auto'
        }} onMouseDown={e => e.stopPropagation()}>
            
            {/* ADD BLOCK BUTTONS */}
            <div style={{ display: 'flex', gap: 2, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 2 }}>
                <ToolbarButton onClick={() => onAddBlock(block.id)} highlight="#22c55e" title="Add 1 Block">
                    <IconPlus size={16} strokeWidth={3} />
                </ToolbarButton>
                <div style={{ position: 'relative' }}>
                    <ToolbarButton onClick={() => setShowMultiAdd(!showMultiAdd)} active={showMultiAdd} highlight="#22c55e" title="Multi-Add">
                        <span style={{ fontSize: 10, fontWeight: 800 }}>+N</span>
                    </ToolbarButton>
                    {showMultiAdd && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                            background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                            padding: 4, display: 'flex', gap: 4, boxShadow: '0 10px 20px rgba(0,0,0,0.4)', zIndex: 3001
                        }}>
                            {[2, 3, 4, 5, 10].map(n => (
                                <ToolbarButton key={n} onClick={() => { onAddBlock(block.id, n); setShowMultiAdd(false); }} highlight="#22c55e">
                                    <span style={{ fontSize: 10, fontWeight: 900 }}>{n}</span>
                                </ToolbarButton>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <Divider />

            {/* SIZES */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '0 4px' }}>
                <SizeInput label="W" value={block.w} onChange={(val) => onUpdateSize('w', val)} />
                <SizeInput label="H" value={block.h} onChange={(val) => onUpdateSize('h', val)} />
            </div>

            <Divider />

            {/* PRESETS MENU */}
            <div style={{ position: 'relative' }}>
                <ToolbarButton onClick={() => setShowPresets(!showPresets)} active={showPresets} highlight="#8b5cf6" title="Layout Presets">
                    <IconColumns size={16} />
                </ToolbarButton>
                
                {showPresets && (
                    <div style={{
                        position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                        background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                        padding: 4, display: 'flex', gap: 4, boxShadow: '0 10px 20px rgba(0,0,0,0.4)', zIndex: 3001
                    }}>
                        <ToolbarButton onClick={() => { onApplyPreset('even'); setShowPresets(false); }} title="Even (50/50, 33/33...)">
                            <IconColumns2 size={16} />
                        </ToolbarButton>
                        <ToolbarButton onClick={() => { onApplyPreset('sidebar'); setShowPresets(false); }} title="Sidebar Layout">
                            <IconColumns3 size={16} />
                        </ToolbarButton>
                        <ToolbarButton onClick={() => { onApplyPreset('reset'); setShowPresets(false); }} title="Reset to Auto">
                            <IconColumns1 size={16} />
                        </ToolbarButton>
                    </div>
                )}
            </div>

            <Divider />

            {/* FLEXBOX SETTINGS */}
            {hasChildren && (
                <>
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: 2 }}>
                        <ToolbarButton active={direction === 'row'} onClick={() => onUpdateMeta('direction', 'row')} title="Row"><IconArrowsHorizontal size={14}/></ToolbarButton>
                        <ToolbarButton active={direction === 'column'} onClick={() => onUpdateMeta('direction', 'column')} title="Column"><IconArrowsVertical size={14}/></ToolbarButton>
                        <Divider />
                        <ToolbarButton active={wrap === 'wrap'} onClick={() => onUpdateMeta('wrap', wrap === 'wrap' ? 'nowrap' : 'wrap')} title="Toggle Wrap">
                            <IconFold size={14} style={{ transform: wrap === 'wrap' ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
                        </ToolbarButton>
                    </div>
                    
                    <Divider />
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: 2 }}>
                        <ToolbarButton active={justify === 'flex-start'} onClick={() => onUpdateMeta('justify', 'flex-start')}><IconLayoutAlignLeft size={14}/></ToolbarButton>
                        <ToolbarButton active={justify === 'center'} onClick={() => onUpdateMeta('justify', 'center')}><IconLayoutAlignCenter size={14}/></ToolbarButton>
                        <ToolbarButton active={justify === 'flex-end'} onClick={() => onUpdateMeta('justify', 'flex-end')}><IconLayoutAlignRight size={14}/></ToolbarButton>
                        <ToolbarButton active={justify === 'space-between'} onClick={() => onUpdateMeta('justify', 'space-between')}><IconLayoutDistributeHorizontal size={14}/></ToolbarButton>
                    </div>
                    
                    <Divider />
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: 2 }}>
                        <ToolbarButton active={align === 'flex-start'} onClick={() => onUpdateMeta('align', 'flex-start')}><IconLayoutAlignTop size={14}/></ToolbarButton>
                        <ToolbarButton active={align === 'center'} onClick={() => onUpdateMeta('align', 'center')}><IconLayoutAlignCenter size={14}/></ToolbarButton>
                        <ToolbarButton active={align === 'flex-end'} onClick={() => onUpdateMeta('align', 'flex-end')}><IconLayoutAlignBottom size={14}/></ToolbarButton>
                    </div>
                </>
            )}
        </div>
    );
}

function SizeInput({ label, value, onChange }) {
    const [localValue, setLocalValue] = useState(value);
    useEffect(() => { setLocalValue(value); }, [value]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '2px 4px', border: '1px solid rgba(255,255,255,0.1)' }} onMouseDown={e => e.stopPropagation()}>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#4f46e5', marginRight: 4, opacity: 0.8 }}>{label}</span>
            <input type="text" value={localValue} onChange={(e) => setLocalValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onChange(e.target.value); }} onBlur={(e) => onChange(e.target.value)} style={{ width: 35, background: 'transparent', border: 'none', color: 'white', fontSize: 10, fontWeight: 700, textAlign: 'center', outline: 'none', padding: 0 }} />
        </div>
    );
}

function ToolbarButton({ children, active, onClick, highlight = '#4f46e5', title }) {
    return (
        <div onClick={(e) => { e.stopPropagation(); onClick(); }} title={title} style={{
            padding: '4px 6px', borderRadius: 4, cursor: 'pointer',
            background: active ? highlight : 'transparent',
            color: active ? 'white' : 'rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s',
            border: active ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
        }}
        onMouseEnter={(e) => { if(!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={(e) => { if(!active) e.currentTarget.style.background = 'transparent'; }}
        >
            {children}
        </div>
    );
}

const Divider = () => <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />;
