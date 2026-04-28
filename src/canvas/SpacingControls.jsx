import React from 'react';
import { COLORS } from '../constants';

export default function SpacingControls({ 
    block, 
    zoom, 
    isSelected, 
    isRoot, 
    onStartDrag, 
    onSetAuto, 
    onEdit 
}) {
    if (!isSelected || isRoot) return null;

    const m = block.meta?.margin || { top: 0, right: 0, bottom: 0, left: 0 };
    const p = block.meta?.padding || { top: 0, right: 0, bottom: 0, left: 0 };

    return (
        <>
            {/* OVERLAYS */}
            <div style={{ position: 'absolute', top: -m.top, left: 0, right: 0, height: m.top, background: 'rgba(245, 158, 11, 0.15)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -m.bottom, left: 0, right: 0, height: m.bottom, background: 'rgba(245, 158, 11, 0.15)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: -m.left, top: 0, bottom: 0, width: m.left, background: 'rgba(245, 158, 11, 0.15)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: -m.right, top: 0, bottom: 0, width: m.right, background: 'rgba(245, 158, 11, 0.15)', pointerEvents: 'none' }} />

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: p.top, background: 'rgba(168, 85, 247, 0.15)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: p.bottom, background: 'rgba(168, 85, 247, 0.15)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: p.left, background: 'rgba(168, 85, 247, 0.15)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: p.right, background: 'rgba(168, 85, 247, 0.15)', pointerEvents: 'none' }} />

            {/* INDICATORS & HANDLES */}
            {['top', 'bottom', 'left', 'right'].map(side => (
                <React.Fragment key={side}>
                    {/* Margin Handle */}
                    <div 
                        onDoubleClick={() => onSetAuto(side)} 
                        onMouseDown={(e) => onStartDrag(e, 'margin', side, m[side])} 
                        className={`handle m-${side[0]}`} 
                        style={getHandleStyle('margin', side, m[side], zoom)} 
                    />
                    {/* Padding Handle */}
                    <div 
                        onMouseDown={(e) => onStartDrag(e, 'padding', side, p[side])} 
                        className={`handle p-${side[0]}`} 
                        style={getHandleStyle('padding', side, p[side], zoom)} 
                    />
                    
                    {/* Numeric Labels */}
                    <IndicatorLabel type="margin" side={side} value={m[side]} zoom={zoom} onEdit={onEdit} />
                    <IndicatorLabel type="padding" side={side} value={p[side]} zoom={zoom} onEdit={onEdit} />
                </React.Fragment>
            ))}
        </>
    );
}

function IndicatorLabel({ type, side, value, zoom, onEdit }) {
    const isPadding = type === 'padding';
    const color = isPadding ? COLORS.padding : COLORS.margin;
    const invZoom = 1 / zoom;
    
    // Для "auto" используем фиксированное экранное расстояние
    const offsetValue = value === 'auto' ? 40 * invZoom : value;

    if (value !== 'auto' && (value * zoom) < 12) return null;

    const style = {
        position: 'absolute',
        zIndex: 2001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        cursor: 'text',
        transformOrigin: 'center center'
    };

    const pos = offsetValue / 2;

    if (side === 'top') { style.top = isPadding ? pos : -pos; style.left = '50%'; style.transform = `translate(-50%, -50%) scale(${invZoom})`; }
    if (side === 'bottom') { style.bottom = isPadding ? pos : -pos; style.left = '50%'; style.transform = `translate(-50%, 50%) scale(${invZoom})`; }
    if (side === 'left') { style.left = isPadding ? pos : -pos; style.top = '50%'; style.transform = `translate(-50%, -50%) scale(${invZoom})`; }
    if (side === 'right') { style.right = isPadding ? pos : -pos; style.top = '50%'; style.transform = `translate(50%, -50%) scale(${invZoom})`; }

    return (
        <div style={style} onClick={(e) => { e.stopPropagation(); onEdit(type, side); }}>
            <span style={{ 
                background: color, color: 'white', 
                fontSize: value === 'auto' ? 8 : 9, fontWeight: 900, 
                padding: '1px 4px', borderRadius: 3,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(4px)'
            }}>
                {value === 'auto' ? 'AUTO' : value}
            </span>
        </div>
    );
}

function getHandleStyle(type, side, value, zoom) {
    const invZoom = 1 / zoom;
    const isMargin = type === 'margin';
    
    // Размер ручки всегда остается удобным для клика (около 15-20 экранных пикселей)
    const handleSize = 15 * invZoom;
    const hoverOffset = (isMargin ? 20 : 0) * invZoom;
    
    const base = { position: 'absolute', zIndex: 1000, cursor: (side === 'top' || side === 'bottom' ? 'ns-resize' : 'ew-resize') };
    
    if (side === 'top') return { ...base, top: isMargin ? -hoverOffset - handleSize : 0, left: 0, right: 0, height: handleSize };
    if (side === 'bottom') return { ...base, bottom: isMargin ? -hoverOffset - handleSize : 0, left: 0, right: 0, height: handleSize };
    if (side === 'left') return { ...base, left: isMargin ? -hoverOffset - handleSize : 0, top: 0, bottom: 0, width: handleSize };
    if (side === 'right') return { ...base, right: isMargin ? -hoverOffset - handleSize : 0, top: 0, bottom: 0, width: handleSize };
    return base;
}
