import React, { useState } from 'react';
import { COLORS } from '../constants';

const Block = ({ 
    block, blocks, blocksByParent, selectedIds, isPanning, zoom, isTransforming,
    onSelect, onUpdateMeta, onUpdateSize, onAddBlock, onStartDrag, onSetAuto, onEdit,
    onSaveEdit, onFill
}) => {
    if (!block) return null;
    const isSelected = selectedIds.includes(block.id);
    const m = block.meta || {};
    const children = blocksByParent[block.id] || [];
    
    const margin = m.margin || { top: 0, right: 0, bottom: 0, left: 0 };
    const padding = m.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const iz = 1 / zoom;

    const blockStyle = {
        position: 'absolute',
        left: block.x,
        top: block.y,
        width: block.w,
        height: block.h,
        display: 'flex',
        flexDirection: m.direction || 'row',
        justifyContent: m.justify || 'flex-start',
        alignItems: m.align || 'flex-start',
        flexWrap: m.wrap || 'nowrap',
        gap: `${m.gap || 0}px`,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        margin: `${margin.top === 'auto' ? '0' : margin.top}px ${margin.right === 'auto' ? 'auto' : margin.right}px ${margin.bottom === 'auto' ? '0' : margin.bottom}px ${margin.left === 'auto' ? 'auto' : margin.left}px`,
        background: m.bgColor || 'rgba(255, 255, 255, 0.05)',
        backgroundImage: m.bgImage ? `url(${m.bgImage})` : 'none',
        backgroundSize: m.bgSize || 'cover',
        borderRadius: `${m.borderRadius || 0}px`,
        color: m.color || 'white',
        zIndex: isSelected ? 10 : 1,
        transition: isTransforming ? 'none' : 'all 0.1s',
        cursor: 'pointer',
        boxSizing: 'border-box',
    };

    return (
        <div 
            style={blockStyle} 
            onClick={(e) => { e.stopPropagation(); onSelect(block.id); }}
            data-id={block.id}
        >
            {m.text && <div style={{ width: '100%', pointerEvents: 'none' }}>{m.text}</div>}

            {isSelected && (
                <SpacingZones 
                    block={block} zoom={zoom} 
                    onStartDrag={onStartDrag} onSetAuto={onSetAuto} onEdit={onEdit}
                />
            )}

            {children.map(child => child && (
                <Block 
                    key={child.id} block={child} blocks={blocks} blocksByParent={blocksByParent}
                    selectedIds={selectedIds} isPanning={isPanning} zoom={zoom} isTransforming={isTransforming}
                    onSelect={onSelect} onUpdateMeta={onUpdateMeta} onUpdateSize={onUpdateSize}
                    onAddBlock={onAddBlock} onStartDrag={onStartDrag} onSetAuto={onSetAuto}
                    onEdit={onEdit} onSaveEdit={onSaveEdit} onFill={onFill}
                />
            ))}
        </div>
    );
};

const SpacingZones = ({ block, zoom, onStartDrag, onSetAuto, onEdit }) => {
    const m = block.meta || {};
    const margin = m.margin || { top: 0, right: 0, bottom: 0, left: 0 };
    const padding = m.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const sides = ['top', 'bottom', 'left', 'right'];
    const iz = 1 / zoom;

    const renderBadge = (type, side, val) => {
        if (!val || val === 0) return null;
        const isM = type === 'margin';
        const num = val === 'auto' ? 0 : parseInt(val);
        const color = isM ? '#f59e0b' : '#a855f7';
        
        const style = {
            position: 'absolute',
            zIndex: 3000,
            padding: `${2*iz}px ${6*iz}px`,
            background: color,
            borderRadius: 4*iz,
            fontSize: 9*iz,
            fontWeight: 900,
            color: 'white',
            cursor: 'pointer',
            boxShadow: `0 ${4*iz}px ${10*iz}px rgba(0,0,0,0.3)`,
            whiteSpace: 'nowrap',
            transform: 'translate(-50%, -50%)',
            left: '50%', top: '50%'
        };

        const pos = { left: '50%', top: '50%' };
        const offset = num / 2;

        if (side === 'top') pos.top = isM ? -offset : offset;
        if (side === 'bottom') pos.top = 'auto', pos.bottom = isM ? -offset : offset;
        if (side === 'left') pos.left = isM ? -offset : offset;
        if (side === 'right') pos.left = 'auto', pos.right = isM ? -offset : offset;

        return (
            <div 
                key={`${type}-badge-${side}`}
                style={{ ...style, ...pos }}
                onDoubleClick={(e) => { e.stopPropagation(); onEdit(block.id, type, side); }}
            >
                {val === 'auto' ? 'AUTO' : `${num}px`}
            </div>
        );
    };

    return (
        <>
            {/* Background Gradients & Badges */}
            {sides.map(side => {
                const mv = margin[side];
                const isV = side === 'top' || side === 'bottom';
                if (!mv || mv === 'auto') return null;
                return (
                    <React.Fragment key={`m-zone-${side}`}>
                        <div style={{
                            position: 'absolute', zIndex: -1, pointerEvents: 'none',
                            background: isV ? `linear-gradient(${side === 'top' ? 'to top' : 'to bottom'}, rgba(245,158,11,0.1), transparent)` : `linear-gradient(${side === 'left' ? 'to left' : 'to right'}, rgba(245,158,11,0.1), transparent)`,
                            ...(side === 'top' ? { top: -mv, left: 0, width: '100%', height: mv } : {}),
                            ...(side === 'bottom' ? { bottom: -mv, left: 0, width: '100%', height: mv } : {}),
                            ...(side === 'left' ? { left: -mv, top: 0, width: mv, height: '100%' } : {}),
                            ...(side === 'right' ? { right: -mv, top: 0, width: mv, height: '100%' } : {}),
                        }} />
                        {renderBadge('margin', side, mv)}
                    </React.Fragment>
                );
            })}

            {sides.map(side => {
                const pv = padding[side];
                const isV = side === 'top' || side === 'bottom';
                if (!pv || pv === 0) return null;
                return (
                    <React.Fragment key={`p-zone-${side}`}>
                        <div style={{
                            position: 'absolute', zIndex: -1, pointerEvents: 'none',
                            background: isV ? `linear-gradient(${side === 'top' ? 'to bottom' : 'to top'}, rgba(168,85,247,0.1), transparent)` : `linear-gradient(${side === 'left' ? 'to right' : 'to left'}, rgba(168,85,247,0.1), transparent)`,
                            ...(side === 'top' ? { top: 0, left: 0, width: '100%', height: pv } : {}),
                            ...(side === 'bottom' ? { bottom: 0, left: 0, width: '100%', height: pv } : {}),
                            ...(side === 'left' ? { left: 0, top: 0, width: pv, height: '100%' } : {}),
                            ...(side === 'right' ? { right: 0, top: 0, width: pv, height: '100%' } : {}),
                        }} />
                        {renderBadge('padding', side, pv)}
                    </React.Fragment>
                );
            })}

            {/* Handle Lines */}
            {sides.map(side => (
                <React.Fragment key={`h-${side}`}>
                    <SpacingLine type="margin" side={side} value={margin[side]} block={block} zoom={zoom} onStartDrag={onStartDrag} onEdit={onEdit} />
                    <SpacingLine type="padding" side={side} value={padding[side]} block={block} zoom={zoom} onStartDrag={onStartDrag} onEdit={onEdit} />
                </React.Fragment>
            ))}
        </>
    );
};

const SpacingLine = ({ type, side, value, block, zoom, onStartDrag, onEdit }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isM = type === 'margin';
    const num = value === 'auto' ? 0 : (parseInt(value) || 0);
    const color = isM ? '#f59e0b' : '#a855f7';
    const iz = 1 / zoom;
    const isV = side === 'top' || side === 'bottom';
    
    const baseOffset = isM ? -num : num;
    const minGap = (isM ? -8 : 8) * iz;
    const finalOffset = num === 0 ? minGap : baseOffset;

    const hitArea = 16 * iz;

    const lineStyle = {
        position: 'absolute',
        zIndex: 2000,
        pointerEvents: 'auto',
        cursor: isV ? 'ns-resize' : 'ew-resize',
        background: 'transparent',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        ...(isV ? {
            left: 0, width: '100%', height: hitArea,
            [side]: finalOffset - (hitArea / 2)
        } : {
            top: 0, height: '100%', width: hitArea,
            [side]: finalOffset - (hitArea / 2)
        })
    };

    return (
        <div 
            style={lineStyle}
            onMouseDown={(e) => onStartDrag(block.id, type, side, e)}
            onDoubleClick={() => onEdit(block.id, type, side)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{
                background: color,
                width: isV ? '100%' : (isHovered ? `${2*iz}px` : `${iz}px`),
                height: isV ? (isHovered ? `${2*iz}px` : `${iz}px`) : '100%',
                opacity: isHovered ? 1 : 0.25,
                boxShadow: isHovered ? `0 0 ${6*iz}px ${color}` : 'none',
                transition: 'all 0.1s'
            }} />
        </div>
    );
};

export default Block;
