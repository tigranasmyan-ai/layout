import React, { useRef } from 'react';
import { COLORS } from '@constants';

export default function SpacingControls({ 
    block, 
    zoom, 
    isSelected, 
    isRoot, 
    onStartDrag, 
    onSetAuto, 
    onEdit, 
    onFill 
}) {
    const clickTimeoutRef = useRef(null);

    if (!isSelected || isRoot) return null;

    const m = block.meta?.margin || { top: 0, right: 0, bottom: 0, left: 0 };
    const p = block.meta?.padding || { top: 0, right: 0, bottom: 0, left: 0 };

    const handleSmartClick = (e, type, side, value) => {
        e.stopPropagation();
        if (clickTimeoutRef.current) {
            // Если это второй клик за 250мс
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
            onFill(side);
        } else {
            // Если это первый клик
            clickTimeoutRef.current = setTimeout(() => {
                clickTimeoutRef.current = null;
                // Только для меток вызываем редактирование
                if (type === 'edit') onEdit(value.type, value.side);
            }, 250);
        }
    };

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3000 }}>
            {/* MARGIN ZONES (Outside) */}
            {['top', 'bottom', 'left', 'right'].map(side => (
                <div 
                    key={`m-${side}`}
                    className="spacing-zone margin-zone"
                    onMouseDown={(e) => { e.stopPropagation(); onStartDrag(e, 'margin', side, m[side]); }}
                    onClick={(e) => handleSmartClick(e, 'zone', side)}
                    style={getZoneStyle('margin', side, m[side], zoom)}
                />
            ))}

            {/* PADDING ZONES (Inside) */}
            {['top', 'bottom', 'left', 'right'].map(side => (
                <div 
                    key={`p-${side}`}
                    className="spacing-zone padding-zone"
                    onMouseDown={(e) => { e.stopPropagation(); onStartDrag(e, 'padding', side, p[side]); }}
                    onClick={(e) => handleSmartClick(e, 'zone', side)}
                    style={getZoneStyle('padding', side, p[side], zoom)}
                />
            ))}

            {/* Numeric Labels */}
            {['top', 'bottom', 'left', 'right'].map(side => (
                <React.Fragment key={`labels-${side}`}>
                    <IndicatorLabel type="margin" side={side} value={m[side]} zoom={zoom} onClick={(e) => handleSmartClick(e, 'edit', side, {type: 'margin', side})} />
                    <IndicatorLabel type="padding" side={side} value={p[side]} zoom={zoom} onClick={(e) => handleSmartClick(e, 'edit', side, {type: 'padding', side})} />
                </React.Fragment>
            ))}
        </div>
    );
}

function getZoneStyle(type, side, value, zoom) {
    const invZoom = 1 / zoom;
    const isMargin = type === 'margin';
    const val = parseInt(value) || 0;
    const minThickness = 16 * invZoom;
    const thickness = Math.max(minThickness, val);
    const gap = 4 * invZoom;
    
    const style = { position: 'absolute', zIndex: 3000 };
    const cursor = (side === 'top' || side === 'bottom' ? 'ns-resize' : 'ew-resize');
    style.cursor = cursor;

    if (side === 'top') {
        style.left = 0; style.right = 0;
        if (isMargin) { style.bottom = `calc(100% + ${gap}px)`; style.height = thickness; }
        else { style.top = gap; style.height = thickness; }
    }
    if (side === 'bottom') {
        style.left = 0; style.right = 0;
        if (isMargin) { style.top = `calc(100% + ${gap}px)`; style.height = thickness; }
        else { style.bottom = gap; style.height = thickness; }
    }
    if (side === 'left') {
        style.top = 0; style.bottom = 0;
        if (isMargin) { style.right = `calc(100% + ${gap}px)`; style.width = thickness; }
        else { style.left = gap; style.width = thickness; }
    }
    if (side === 'right') {
        style.top = 0; style.bottom = 0;
        if (isMargin) { style.left = `calc(100% + ${gap}px)`; style.width = thickness; }
        else { style.right = gap; style.width = thickness; }
    }

    return style;
}

function IndicatorLabel({ type, side, value, zoom, onClick }) {
    if (!value || value === 0 || value === '0') return null;
    const isPadding = type === 'padding';
    const color = isPadding ? COLORS.padding : COLORS.margin;
    const invZoom = 1 / zoom;
    const offsetValue = value === 'auto' ? 40 : parseInt(value);

    const style = {
        position: 'absolute',
        zIndex: 3100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        cursor: 'pointer',
        transform: `scale(${invZoom})`,
        transformOrigin: 'center center'
    };

    const dist = offsetValue / 2;
    if (side === 'top') { style.top = isPadding ? dist : -dist; style.left = '50%'; style.transform += ' translate(-50%, -50%)'; }
    if (side === 'bottom') { style.bottom = isPadding ? dist : -dist; style.left = '50%'; style.transform += ' translate(-50%, 50%)'; }
    if (side === 'left') { style.left = isPadding ? dist : -dist; style.top = '50%'; style.transform += ' translate(-50%, -50%)'; }
    if (side === 'right') { style.right = isPadding ? dist : -dist; style.top = '50%'; style.transform += ' translate(50%, -50%)'; }

    return (
        <div style={style} onMouseDown={e => e.stopPropagation()} onClick={onClick}>
            <span style={{ 
                background: color, color: 'white', 
                fontSize: 9, fontWeight: 900, padding: '1px 4px', borderRadius: 3,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
                {value === 'auto' ? 'AUTO' : value}
            </span>
        </div>
    );
}
