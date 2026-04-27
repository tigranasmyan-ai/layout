import React, { useRef, useState, useEffect } from 'react';

const Handle = ({ x, y, value, onChange, color, direction = 'vertical' }) => {
    const [isDragging, setIsDragging] = useState(false);
    const startPos = useRef(0);
    const startVal = useRef(0);

    const handleMouseDown = (e) => {
        e.stopPropagation();
        setIsDragging(true);
        startPos.current = direction === 'vertical' ? e.clientY : e.clientX;
        startVal.current = Number(value) || 0;
        document.body.style.cursor = direction === 'vertical' ? 'ns-resize' : 'ew-resize';
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            const currentPos = direction === 'vertical' ? e.clientY : e.clientX;
            const delta = currentPos - startPos.current;
            const shiftMult = e.shiftKey ? 10 : 1;
            const altKey = e.altKey;
            
            // By default, just pass the raw delta and let the parent decide how to interpret it.
            onChange(startVal.current, delta, shiftMult, altKey);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.cursor = '';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, onChange, direction]);

    const hasValue = value > 0;

    return (
        <div
            onMouseDown={handleMouseDown}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                minWidth: hasValue ? 16 : (direction === 'vertical' ? 12 : 6),
                height: hasValue ? 16 : (direction === 'vertical' ? 6 : 12),
                borderRadius: hasValue ? 8 : 4,
                backgroundColor: color,
                border: '1.5px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                transform: 'translate(-50%, -50%)',
                cursor: direction === 'vertical' ? 'ns-resize' : 'ew-resize',
                zIndex: 200000,
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 9,
                fontWeight: 'bold',
                padding: hasValue ? '0 4px' : '0',
                userSelect: 'none',
                fontFamily: 'sans-serif',
                transition: 'all 0.15s ease-out'
            }}
        >
            {hasValue ? value : ''}
        </div>
    );
};

const AutoBtn = ({ x, y, active, onClick }) => (
    <div
        onMouseDown={(e) => { e.stopPropagation(); onClick(); }}
        style={{
            position: 'absolute',
            left: x, top: y,
            width: 14, height: 14, borderRadius: 4,
            background: active ? '#ff9800' : 'rgba(255, 152, 0, 0.2)',
            color: active ? '#fff' : '#ff9800',
            fontSize: 9, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', pointerEvents: 'auto', transform: 'translate(-50%, -50%)', zIndex: 200001,
            userSelect: 'none', border: '1px solid rgba(255, 152, 0, 0.5)'
        }}
    >
        A
    </div>
);

export default function SpacingOverlay({ activeShape, camera, onUpdate, editor }) {
    if (!activeShape || activeShape.type !== 'geo') return null;

    const meta = activeShape.meta || {};
    const pT = Number(meta.paddingTop ?? meta.padding) || 0;
    const pR = Number(meta.paddingRight ?? meta.padding) || 0;
    const pB = Number(meta.paddingBottom ?? meta.padding) || 0;
    const pL = Number(meta.paddingLeft ?? meta.padding) || 0;
    const mT = Number(meta.marginTop ?? meta.margin) || 0;
    const mR = Number(meta.marginRight ?? meta.margin) || 0;
    const mB = Number(meta.marginBottom ?? meta.margin) || 0;
    const mL = Number(meta.marginLeft ?? meta.margin) || 0;

    const isMtA = !!meta.mtA;
    const isMrA = !!meta.mrA;
    const isMbA = !!meta.mbA;
    const isMlA = !!meta.mlA;

    const x = (activeShape.x + camera.x) * camera.z;
    const y = (activeShape.y + camera.y) * camera.z;
    const w = (activeShape.props?.w || 0) * camera.z;
    const h = (activeShape.props?.h || 0) * camera.z;

    const pTz = pT * camera.z; const pRz = pR * camera.z; const pBz = pB * camera.z; const pLz = pL * camera.z;
    const mTz = mT * camera.z; const mRz = mR * camera.z; const mBz = mB * camera.z; const mLz = mL * camera.z;

    const makeHandleChange = (multiplier, propName, isPadding) => (startVal, delta, shiftMult, altKey) => {
        const change = Math.round((delta * multiplier) / camera.z) * (shiftMult > 1 ? 2 : 1);
        let newVal = startVal + change;
        if (newVal < 0) newVal = 0;
        
        if (isPadding) {
            const maxW = (activeShape.props?.w || 0) / 2;
            const maxH = (activeShape.props?.h || 0) / 2;
            const maxP = (propName === 'paddingTop' || propName === 'paddingBottom') ? maxH : maxW;
            if (newVal > maxP) newVal = Math.round(maxP);
        }
        
        if (altKey) {
            onUpdate({ 
                [isPadding ? 'paddingTop' : 'marginTop']: newVal,
                [isPadding ? 'paddingRight' : 'marginRight']: newVal,
                [isPadding ? 'paddingBottom' : 'marginBottom']: newVal,
                [isPadding ? 'paddingLeft' : 'marginLeft']: newVal,
                [isPadding ? 'padding' : 'margin']: newVal
            }, activeShape.id);
        } else {
            onUpdate({ [propName]: newVal }, activeShape.id);
        }
    };

    const handleMarginTop = makeHandleChange(-1, 'marginTop', false);
    const handleMarginBottom = makeHandleChange(1, 'marginBottom', false);
    const handleMarginLeft = makeHandleChange(-1, 'marginLeft', false);
    const handleMarginRight = makeHandleChange(1, 'marginRight', false);

    const handlePaddingTop = makeHandleChange(1, 'paddingTop', true);
    const handlePaddingBottom = makeHandleChange(-1, 'paddingBottom', true);
    const handlePaddingLeft = makeHandleChange(1, 'paddingLeft', true);
    const handlePaddingRight = makeHandleChange(-1, 'paddingRight', true);

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100000 }}>
            {/* Margin Zone Border */}
            <div style={{
                position: 'absolute',
                left: x - mLz,
                top: y - mTz,
                width: w + mLz + mRz,
                height: h + mTz + mBz,
                boxSizing: 'border-box',
                borderStyle: 'solid',
                borderColor: 'rgba(255, 152, 0, 0.2)',
                borderWidth: `${mTz}px ${mRz}px ${mBz}px ${mLz}px`,
            }} />

            {/* Margin Handles (Absolute Screen Coordinates) */}
            <Handle x={x + w / 2} y={y - mTz - 8} value={isMtA ? 'A' : mT} onChange={handleMarginTop} color="#ff9800" direction="vertical" />
            <Handle x={x + w / 2} y={y + h + mBz + 8} value={isMbA ? 'A' : mB} onChange={handleMarginBottom} color="#ff9800" direction="vertical" />
            <Handle x={x - mLz - 8} y={y + h / 2} value={isMlA ? 'A' : mL} onChange={handleMarginLeft} color="#ff9800" direction="horizontal" />
            <Handle x={x + w + mRz + 8} y={y + h / 2} value={isMrA ? 'A' : mR} onChange={handleMarginRight} color="#ff9800" direction="horizontal" />

            {/* Auto Margin Buttons */}
            <AutoBtn x={x + w / 2 + 20} y={y - mTz - 8} active={isMtA} onClick={() => onUpdate({ mtA: !isMtA }, activeShape.id)} />
            <AutoBtn x={x + w / 2 + 20} y={y + h + mBz + 8} active={isMbA} onClick={() => onUpdate({ mbA: !isMbA }, activeShape.id)} />
            <AutoBtn x={x - mLz - 8} y={y + h / 2 - 20} active={isMlA} onClick={() => onUpdate({ mlA: !isMlA }, activeShape.id)} />
            <AutoBtn x={x + w + mRz + 8} y={y + h / 2 - 20} active={isMrA} onClick={() => onUpdate({ mrA: !isMrA }, activeShape.id)} />

            {/* Padding Zone Border */}
            <div style={{
                position: 'absolute',
                left: x,
                top: y,
                width: w,
                height: h,
                boxSizing: 'border-box',
                borderStyle: 'solid',
                borderColor: 'rgba(76, 175, 80, 0.2)',
                borderWidth: `${pTz}px ${pRz}px ${pBz}px ${pLz}px`,
            }} />

            {/* Padding Handles (Absolute Screen Coordinates) */}
            <Handle x={x + w / 2} y={y + pTz + 8} value={pT} onChange={handlePaddingTop} color="#4caf50" direction="vertical" />
            <Handle x={x + w / 2} y={y + h - pBz - 8} value={pB} onChange={handlePaddingBottom} color="#4caf50" direction="vertical" />
            <Handle x={x + pLz + 8} y={y + h / 2} value={pL} onChange={handlePaddingLeft} color="#4caf50" direction="horizontal" />
            <Handle x={x + w - pRz - 8} y={y + h / 2} value={pR} onChange={handlePaddingRight} color="#4caf50" direction="horizontal" />
        </div>
    );
}
