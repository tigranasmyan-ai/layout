import React from 'react'
import ScrubInput from './ScrubInput'

const Icon = ({ name }) => {
    const s = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }
    switch (name) {
        case 'j-start': return <svg {...s}><path d="M2 12V2M2 22v-10M5 12h14"></path><path d="M15 8l4 4-4 4"></path></svg>
        case 'j-center': return <svg {...s}><path d="M12 2v20M2 12h20M8 8l-4 4 4 4M16 8l4 4-4 4"></path></svg>
        case 'j-end': return <svg {...s}><path d="M22 12V2M22 22v-10M19 12H5"></path><path d="M9 16l-4-4 4-4"></path></svg>
        case 'j-between': return <svg {...s}><path d="M2 2v20M22 2v20H7M13 8l4 4-4 4M11 16l-4-4 4-4"></path></svg>
        case 'a-start': return <svg {...s}><path d="M2 2h20M12 5v14M8 11l4-4 4 4"></path></svg>
        case 'a-center': return <svg {...s}><path d="M2 12h20M12 2v20M8 8l4-4 4 4M16 16l-4 4-4-4"></path></svg>
        case 'a-end': return <svg {...s}><path d="M2 22h20M12 19V5M8 13l4 4 4-4"></path></svg>
        case 'fill': return <svg {...s}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>
        case 'trash': return <svg {...s}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        default: return null
    }
}

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

    const meta = activeShape.meta || {};
    const x = Math.round(activeShape.x);
    const y = Math.round(activeShape.y);
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
            <div className="hud-toolbar premium-blur glass-dark floating-island">
                {/* GROUP 1: TAG SELECTOR */}
                <div className="hud-group">
                    <div className="tag-pill">
                        <select value={meta.tag || 'div'} onChange={(e) => onUpdate({tag: e.target.value}, activeShape.id)}>
                            <option value="div">DIV</option>
                            <option value="section">SEC</option>
                            <option value="article">ART</option>
                            <option value="aside">ASD</option>
                            <option value="nav">NAV</option>
                            <option value="header">HDR</option>
                            <option value="footer">FTR</option>
                        </select>
                    </div>
                </div>

                <div className="hud-sep"></div>

                {/* GROUP 2: FLEXBOX CONTROLS */}
                {hasChildren && (
                    <>
                        <div className="hud-group segmented">
                            <button className={meta.justify === 'flex-start' ? 'active' : ''} onClick={() => onToggleRule('justify', 'flex-start')} title="Align Start"><Icon name="j-start" /></button>
                            <button className={meta.justify === 'center' ? 'active' : ''} onClick={() => onToggleRule('justify', 'center')} title="Align Center"><Icon name="j-center" /></button>
                            <button className={meta.justify === 'flex-end' ? 'active' : ''} onClick={() => onToggleRule('justify', 'flex-end')} title="Align End"><Icon name="j-end" /></button>
                            <button className={meta.justify === 'space-between' ? 'active' : ''} onClick={() => onToggleRule('justify', 'space-between')} title="Space Between"><Icon name="j-between" /></button>
                        </div>
                        <div className="hud-sep"></div>
                        <div className="hud-group segmented">
                            <button className={meta.align === 'flex-start' ? 'active' : ''} onClick={() => onToggleRule('align', 'flex-start')} title="Items Top"><Icon name="a-start" /></button>
                            <button className={meta.align === 'center' ? 'active' : ''} onClick={() => onToggleRule('align', 'center')} title="Items Center"><Icon name="a-center" /></button>
                            <button className={meta.align === 'flex-end' ? 'active' : ''} onClick={() => onToggleRule('align', 'flex-end')} title="Items Bottom"><Icon name="a-end" /></button>
                        </div>
                        <div className="hud-sep"></div>
                    </>
                )}

                {/* GROUP 3: BEHAVIOR CONTROLS */}
                <div className="hud-group">
                    <button className={`hud-btn-pill ${meta.isFullH ? 'active' : ''}`} onClick={() => onUpdate({isFullH: !meta.isFullH}, activeShape.id)}>H100</button>
                    <button className={`hud-btn-pill ${meta.isGrow ? 'active' : ''}`} onClick={() => onToggleFill()} title="Fill Space"><Icon name="fill" /></button>
                </div>

                <div className="hud-sep"></div>

                {/* GROUP 4: DIMENSIONS (INPUTS) */}
                <div className="hud-group unit-inputs">
                    <ScrubInput label="W" value={meta.isFullW ? '100%' : (meta.isAutoW ? 'auto' : w)} onChange={(val) => { 
                        const isStr = typeof val === 'string';
                        const isAuto = isStr && val.toLowerCase() === 'auto';
                        editor.updateShape({ id: activeShape.id, props: { w: isStr ? w : val }, meta: { ...meta, isFullW: isStr && val.includes('%'), isAutoW: isAuto, isGrow: false } }); 
                        onUpdate({}, activeShape.id) 
                    }} />
                    <ScrubInput label="H" value={meta.isFullH ? '100%' : (meta.isAutoH ? 'auto' : h)} onChange={(val) => { 
                        const isStr = typeof val === 'string';
                        const isAuto = isStr && val.toLowerCase() === 'auto';
                        editor.updateShape({ id: activeShape.id, props: { h: isStr ? h : val }, meta: { ...meta, isFullH: isStr && val.includes('%'), isAutoH: isAuto } }); 
                        onUpdate({}, activeShape.id) 
                    }} />
                </div>

                {/* GROUP 5: CONTEXT ACTIONS */}
                {meta.bgImage && (
                    <div className="hud-group">
                        <div className="hud-sep"></div>
                        <button className="hud-btn-icon danger" onClick={() => onUpdate({ bgImage: null }, activeShape.id)} title="Remove Photo"><Icon name="trash" /></button>
                    </div>
                )}
            </div>
        </div>
    );
}
