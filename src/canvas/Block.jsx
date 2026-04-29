import React, { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';

export default function Block({ 
    block, blocks, blocksByParent, selectedIds, isPanning, zoom, isTransforming,
    draggingType, editingSpace, onSaveEdit,
    onSelect, onUpdateMeta, onUpdateSize, onAddBlock, onStartDrag, onSetAuto, onEdit, onFill
}) {
    if (!block) return null;
    const isSelected = selectedIds.includes(block.id);
    const m = block.meta || {};
    const children = blocksByParent[block.id] || [];

    const formatSpacing = (val) => {
        if (val === 'auto') return 'auto';
        if (val === undefined || val === null) return '0px';
        return `${val}px`;
    };

    const style = {
        position: block.parentId ? 'relative' : 'absolute',
        left: block.parentId ? undefined : block.x,
        top: block.parentId ? undefined : block.y,
        width: typeof block.w === 'number' ? `${block.w}px` : block.w,
        height: typeof block.h === 'number' ? `${block.h}px` : block.h,
        display: 'flex',
        flexDirection: m.direction || 'row',
        justifyContent: m.justify || 'flex-start',
        alignItems: m.align || 'flex-start',
        flexWrap: m.wrap || 'nowrap',
        gap: `${m.gap || 0}px`,
        padding: `${formatSpacing(m.padding?.top)} ${formatSpacing(m.padding?.right)} ${formatSpacing(m.padding?.bottom)} ${formatSpacing(m.padding?.left)}`,
        margin: `${formatSpacing(m.margin?.top)} ${formatSpacing(m.margin?.right)} ${formatSpacing(m.margin?.bottom)} ${formatSpacing(m.margin?.left)}`,
        flexGrow: m.flexGrow || 0,
        flexShrink: m.flexShrink || 0,
        flexBasis: m.flexBasis || 'auto',
        alignSelf: m.alignSelf || 'auto',
        backgroundColor: m.bgColor || 'rgba(255,255,255,0.05)',
        backgroundImage: m.bgImage ? `url(${m.bgImage})` : 'none',
        backgroundSize: m.bgSize || 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: `${m.borderRadius || 0}px`,
        border: `1px solid ${isSelected ? '#4f46e5' : (m.borderColor || 'rgba(255,255,255,0.1)')}`,
        color: m.color || '#ffffff',
        fontFamily: m.fontFamily || 'Inter, sans-serif',
        fontSize: m.fontSize || '16px',
        fontWeight: m.fontWeight || '400',
        textAlign: m.textAlign || 'left',
        boxShadow: isSelected ? '0 0 30px rgba(0, 0, 0, 0.5)' : 'none',
        zIndex: isSelected ? 99999 : 1,
        transition: 'none',
        cursor: isPanning ? 'grab' : 'pointer',
        boxSizing: 'border-box',
        overflow: m.overflow || 'visible',
    };

    return (
        <div data-id={block.id} style={style} onClick={(e) => { e.stopPropagation(); onSelect(block.id); }}>
            {m.text && (
                <div style={{ width: '100%', pointerEvents: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {m.text}
                </div>
            )}

            {children.map(child => child && (
                <Block 
                    key={child.id} block={child} blocks={blocks} blocksByParent={blocksByParent}
                    selectedIds={selectedIds} isPanning={isPanning} zoom={zoom} isTransforming={isTransforming}
                    draggingType={draggingType} editingSpace={editingSpace} onSaveEdit={onSaveEdit}
                    onSelect={onSelect} onUpdateMeta={onUpdateMeta} onUpdateSize={onUpdateSize}
                    onAddBlock={onAddBlock} onStartDrag={onStartDrag} onSetAuto={onSetAuto}
                    onEdit={onEdit} onFill={onFill}
                />
            ))}

            {isSelected && !isPanning && (
                <>

                    <SpacingZones 
                        block={block} onStartDrag={onStartDrag} onSetAuto={onSetAuto} 
                        onEdit={onEdit} zoom={zoom} draggingType={draggingType} 
                        editingSpace={editingSpace} onSaveEdit={onSaveEdit} 
                    />
                </>
            )}
        </div>
    );
}

const SpacingZones = ({ block, onStartDrag, onSetAuto, onEdit, zoom, draggingType, editingSpace, onSaveEdit }) => {
    if (!block) return null;
    const m = block.meta || {};
    const sides = ['top', 'right', 'bottom', 'left'];
    const margin = m.margin || { top: 0, right: 0, bottom: 0, left: 0 };
    const padding = m.padding || { top: 0, right: 0, bottom: 0, left: 0 };

    return (
        <>
            {/* Visual Margin Zones */}
            {sides.map(side => {
                const val = margin[side];
                if (!val || val === 'auto') return null;
                const style = {
                    position: 'absolute',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px dashed rgba(245, 158, 11, 0.3)',
                    pointerEvents: 'none',
                    zIndex: -1
                };
                if (side === 'top') Object.assign(style, { top: -val, left: 0, width: '100%', height: val });
                if (side === 'bottom') Object.assign(style, { bottom: -val, left: 0, width: '100%', height: val });
                if (side === 'left') Object.assign(style, { left: -val, top: 0, width: val, height: '100%' });
                if (side === 'right') Object.assign(style, { right: -val, top: 0, width: val, height: '100%' });
                return <div key={`m-zone-${side}`} style={style} />;
            })}

            {/* Visual Padding Zones */}
            {sides.map(side => {
                const val = padding[side];
                if (!val) return null;
                const style = {
                    position: 'absolute',
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px dashed rgba(168, 85, 247, 0.3)',
                    pointerEvents: 'none',
                    zIndex: -1
                };
                if (side === 'top') Object.assign(style, { top: 0, left: 0, width: '100%', height: val });
                if (side === 'bottom') Object.assign(style, { bottom: 0, left: 0, width: '100%', height: val });
                if (side === 'left') Object.assign(style, { left: 0, top: 0, width: val, height: '100%' });
                if (side === 'right') Object.assign(style, { right: 0, top: 0, width: val, height: '100%' });
                return <div key={`p-zone-${side}`} style={style} />;
            })}

            {sides.map(side => {
                const showM = !draggingType || draggingType === 'margin';
                const showP = !draggingType || draggingType === 'padding';
                return (
                    <React.Fragment key={side}>
                        {showM && (
                            <SpacingHandle 
                                type="margin" side={side} value={m.margin?.[side] || 0} block={block} zoom={zoom}
                                isEditing={editingSpace?.id === block.id && editingSpace?.type === 'margin' && editingSpace?.side === side}
                                onStartDrag={(e) => onStartDrag(block.id, 'margin', side, e)}
                                onEdit={() => onEdit(block.id, 'margin', side)}
                                onSetAuto={() => onSetAuto(block.id, side)}
                                onSaveEdit={onSaveEdit} onCancelEdit={() => onEdit(null)}
                            />
                        )}
                        {showP && (
                            <SpacingHandle 
                                type="padding" side={side} value={m.padding?.[side] || 0} block={block} zoom={zoom}
                                isEditing={editingSpace?.id === block.id && editingSpace?.type === 'padding' && editingSpace?.side === side}
                                onStartDrag={(e) => onStartDrag(block.id, 'padding', side, e)}
                                onEdit={() => onEdit(block.id, 'padding', side)}
                                onSaveEdit={onSaveEdit} onCancelEdit={() => onEdit(null)}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
};

const SpacingHandle = ({ type, side, value, block, zoom, isEditing, onStartDrag, onEdit, onSetAuto, onSaveEdit, onCancelEdit }) => {
    if (!block) return null;
    const isMargin = type === 'margin';
    const numVal = value === 'auto' ? 0 : (parseInt(value) || 0);
    const handleDistance = Math.max(15, numVal);
    const handleColor = isMargin ? '#f59e0b' : '#a855f7';

    const getPos = () => {
        const d = handleDistance;
        if (side === 'top') return { top: isMargin ? -d : d, left: 0, width: '100%', height: 10, cursor: 'ns-resize' };
        if (side === 'bottom') return { bottom: isMargin ? -d : d, left: 0, width: '100%', height: 10, cursor: 'ns-resize' };
        if (side === 'left') return { left: isMargin ? -d : d, top: 0, width: 10, height: '100%', cursor: 'ew-resize' };
        if (side === 'right') return { right: isMargin ? -d : d, top: 0, width: 10, height: '100%', cursor: 'ew-resize' };
    };

    return (
        <div 
            className={`spacing-handle-container ${type}-handle`}
            style={{ position: 'absolute', zIndex: 1000, pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', ...getPos() }}
            onMouseDown={onStartDrag}
            onDoubleClick={onEdit}
        >
            <div style={{ 
                position: 'absolute', background: handleColor, boxShadow: `0 0 8px ${handleColor}`,
                ...( (side === 'top' || side === 'bottom') ? { height: 2, width: '40px', borderRadius: 2 } : { width: 2, height: '40px', borderRadius: 2 } )
            }} />

            {!isEditing && numVal !== 0 && (
                <div style={{ 
                    position: 'absolute', padding: '2px 4px', background: handleColor, borderRadius: 4, fontSize: 9, fontWeight: 900, color: 'white',
                    transform: (side === 'top' || side === 'bottom') ? 'translateY(-12px)' : 'translateX(25px)', whiteSpace: 'nowrap'
                }}>
                    {value === 'auto' ? 'AUTO' : `${numVal}px`}
                </div>
            )}

            {isEditing && (
                <InlineInput value={value} onSave={onSaveEdit} onCancel={onCancelEdit} color={handleColor} />
            )}

            {isMargin && (
                <div 
                    onClick={(e) => { e.stopPropagation(); onSetAuto(); }}
                    style={{ 
                        position: 'absolute', width: 8, height: 8, borderRadius: '50%', border: `1px solid ${handleColor}`, background: value === 'auto' ? handleColor : 'transparent',
                        transform: (side === 'top' || side === 'bottom') ? 'translateX(30px)' : 'translateY(30px)', cursor: 'pointer'
                    }}
                />
            )}
        </div>
    );
};

const InlineInput = ({ value, onSave, onCancel, color = '#f59e0b' }) => {
    const [val, setVal] = useState(value === 0 || value === 'auto' ? '' : value);
    return (
        <input 
            autoFocus
            style={{ position: 'absolute', zIndex: 2000, width: 40, height: 20, background: '#1a1a1e', border: `1px solid ${color}`, color: 'white', fontSize: '10px', fontWeight: 900, textAlign: 'center', outline: 'none', borderRadius: 4 }}
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => {
                e.stopPropagation();
                if (e.key === 'Enter') onSave(val);
                if (e.key === 'Escape') onCancel();
            }}
            onBlur={() => onSave(val)}
            onMouseDown={e => e.stopPropagation()}
        />
    );
};

