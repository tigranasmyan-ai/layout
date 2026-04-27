import React from 'react';
import { useDrag } from '@use-gesture/react';

const Handle = ({ x, y, value, onChange, color, direction = 'vertical' }) => {
    const bind = useDrag(({ delta: [dx, dy], event, first, last, active }) => {
        if (first) {
            document.body.style.cursor = direction === 'vertical' ? 'ns-resize' : 'ew-resize';
        }
        if (active) {
            const delta = direction === 'vertical' ? dy : dx;
            const shiftMult = event.shiftKey ? 10 : 1;
            onChange(Number(value) || 0, delta * shiftMult, event.altKey);
        }
        if (last) {
            document.body.style.cursor = 'auto';
        }
    }, {
        pointer: { capture: true }
    });

    const hasValue = value > 0;
    return (
        <div {...bind()} style={{
            position: 'absolute', left: x, top: y, minWidth: hasValue ? 16 : (direction === 'vertical' ? 12 : 6),
            height: hasValue ? 16 : (direction === 'vertical' ? 6 : 12), borderRadius: hasValue ? 8 : 4,
            backgroundColor: color, border: '1.5px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transform: 'translate(-50%, -50%)', cursor: direction === 'vertical' ? 'ns-resize' : 'ew-resize',
            zIndex: 200000, pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 9, fontWeight: 'bold', padding: hasValue ? '0 4px' : '0', userSelect: 'none',
            fontFamily: 'sans-serif', transition: 'all 0.15s ease-out'
        }}>
            {hasValue ? value : (value === 'A' ? 'A' : '')}
        </div>
    );
};

const AutoBtn = ({ x, y, active, onClick }) => (
    <div onMouseDown={(e) => { e.stopPropagation(); onClick(); }} style={{
        position: 'absolute', left: x, top: y, width: 14, height: 14, borderRadius: 4,
        background: active ? '#ff9800' : 'rgba(255, 152, 0, 0.2)', color: active ? '#fff' : '#ff9800',
        fontSize: 9, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', pointerEvents: 'auto', transform: 'translate(-50%, -50%)', zIndex: 200001,
        userSelect: 'none', border: '1px solid rgba(255, 152, 0, 0.5)'
    }}>A</div>
);

export default function SpacingOverlay({ activeShape, camera, onUpdate }) {
    if (!activeShape || activeShape.type !== 'geo') return null;

    const m = activeShape.meta || {};
    const z = camera.z;
    const x = (activeShape.x + camera.x) * z, y = (activeShape.y + camera.y) * z;
    const w = (activeShape.props?.w || 0) * z, h = (activeShape.props?.h || 0) * z;

    const getVal = (p, fallback) => Number(m[p] ?? m[fallback]) || 0;
    const p = { t: getVal('paddingTop', 'padding'), r: getVal('paddingRight', 'padding'), b: getVal('paddingBottom', 'padding'), l: getVal('paddingLeft', 'padding') };
    const ma = { t: getVal('marginTop', 'margin'), r: getVal('marginRight', 'margin'), b: getVal('marginBottom', 'margin'), l: getVal('marginLeft', 'margin') };

    const handleUpdate = (prop, mult, isP) => (start, delta, alt) => {
        let val = Math.max(0, start + Math.round(delta * mult / z));
        if (isP) {
            const max = (prop.includes('Top') || prop.includes('Bottom') ? h : w) / (2 * z);
            if (val > max) val = Math.round(max);
        }
        if (alt) {
            const prefix = isP ? 'padding' : 'margin';
            onUpdate({ [prefix+'Top']: val, [prefix+'Right']: val, [prefix+'Bottom']: val, [prefix+'Left']: val, [prefix]: val }, activeShape.id);
        } else onUpdate({ [prop]: val }, activeShape.id);
    };

    const sides = [
        { name: 'Top', mult: -1, isP: false, color: '#ff9800', dir: 'vertical', pos: () => ({ x: x+w/2, y: y-ma.t*z-8 }), val: m.mtA ? 'A' : ma.t, autoKey: 'mtA' },
        { name: 'Bottom', mult: 1, isP: false, color: '#ff9800', dir: 'vertical', pos: () => ({ x: x+w/2, y: y+h+ma.b*z+8 }), val: m.mbA ? 'A' : ma.b, autoKey: 'mbA' },
        { name: 'Left', mult: -1, isP: false, color: '#ff9800', dir: 'horizontal', pos: () => ({ x: x-ma.l*z-8, y: y+h/2 }), val: m.mlA ? 'A' : ma.l, autoKey: 'mlA' },
        { name: 'Right', mult: 1, isP: false, color: '#ff9800', dir: 'horizontal', pos: () => ({ x: x+w+ma.r*z+8, y: y+h/2 }), val: m.mrA ? 'A' : ma.r, autoKey: 'mrA' },
        { name: 'Top', mult: 1, isP: true, color: '#4caf50', dir: 'vertical', pos: () => ({ x: x+w/2, y: y+p.t*z+8 }), val: p.t },
        { name: 'Bottom', mult: -1, isP: true, color: '#4caf50', dir: 'vertical', pos: () => ({ x: x+w/2, y: y+h-p.b*z-8 }), val: p.b },
        { name: 'Left', mult: 1, isP: true, color: '#4caf50', dir: 'horizontal', pos: () => ({ x: x+p.l*z+8, y: y+h/2 }), val: p.l },
        { name: 'Right', mult: -1, isP: true, color: '#4caf50', dir: 'horizontal', pos: () => ({ x: x+w-p.r*z-8, y: y+h/2 }), val: p.r },
    ];

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100000 }}>
            <div style={{ position: 'absolute', left: x-ma.l*z, top: y-ma.t*z, width: w+(ma.l+ma.r)*z, height: h+(ma.t+ma.b)*z, border: 'solid rgba(255,152,0,0.2)', borderWidth: `${ma.t*z}px ${ma.r*z}px ${ma.b*z}px ${ma.l*z}px`, boxSizing: 'border-box' }} />
            <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: 'solid rgba(76,175,80,0.2)', borderWidth: `${p.t*z}px ${p.r*z}px ${p.b*z}px ${p.l*z}px`, boxSizing: 'border-box' }} />
            
            {sides.map((s, i) => (
                <React.Fragment key={i}>
                    <Handle {...s.pos()} value={s.val} color={s.color} direction={s.dir} onChange={handleUpdate((s.isP?'padding':'margin')+s.name, s.mult, s.isP)} />
                    {s.autoKey && <AutoBtn x={s.pos().x + (s.dir==='vertical'?20:0)} y={s.pos().y + (s.dir==='horizontal'?-20:0)} active={!!m[s.autoKey]} onClick={() => onUpdate({ [s.autoKey]: !m[s.autoKey] }, activeShape.id)} />}
                </React.Fragment>
            ))}
        </div>
    );
}
