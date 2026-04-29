import React, { useState } from 'react';
import classes from './SpacingManager.module.css';

export const SpacingZones = ({ block, zoom, onStartDrag, onSetAuto }) => {
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
        
        const pos = { left: '50%', top: '50%' };
        const offset = num / 2;

        if (side === 'top') pos.top = isM ? -offset : offset;
        if (side === 'bottom') pos.top = 'auto', pos.bottom = isM ? -offset : offset;
        if (side === 'left') pos.left = isM ? -offset : offset;
        if (side === 'right') pos.left = 'auto', pos.right = isM ? -offset : offset;

        return (
            <div 
                key={`${type}-badge-${side}`}
                className={classes.badge}
                style={{ 
                    ...pos,
                    background: color,
                    padding: `${2*iz}px ${6*iz}px`,
                    borderRadius: 4*iz,
                    fontSize: 9*iz,
                }}
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
                            background: 'rgba(245,158,11,0.05)',
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
                            background: 'rgba(168,85,247,0.05)',
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
                    <SpacingLine type="margin" side={side} value={margin[side]} block={block} zoom={zoom} onStartDrag={onStartDrag} />
                    <SpacingLine type="padding" side={side} value={padding[side]} block={block} zoom={zoom} onStartDrag={onStartDrag} />
                </React.Fragment>
            ))}
        </>
    );
};

const SpacingLine = ({ type, side, value, block, zoom, onStartDrag }) => {
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

    return (
        <div 
            className={classes.spacingLine}
            style={{
                cursor: isV ? 'ns-resize' : 'ew-resize',
                ...(isV ? {
                    left: 0, width: '100%', height: hitArea,
                    [side]: finalOffset - (hitArea / 2)
                } : {
                    top: 0, height: '100%', width: hitArea,
                    [side]: finalOffset - (hitArea / 2)
                })
            }}
            onMouseDown={(e) => onStartDrag(block.id, type, side, e)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                className={classes.lineInner}
                style={{
                    background: color,
                    width: isV ? '100%' : (isHovered ? `${2*iz}px` : `${iz}px`),
                    height: isV ? (isHovered ? `${2*iz}px` : `${iz}px`) : '100%',
                    opacity: isHovered ? 1 : 0.25,
                }} 
            />
        </div>
    );
};

export default SpacingZones;
