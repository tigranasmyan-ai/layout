import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Tldraw, useEditor, AssetRecordType, createShapeId } from 'tldraw'
import JSZip from 'jszip'
import 'tldraw/tldraw.css'
import './App.css'

const parseCSS = (css) => {
    const obj = {}; if (!css) return obj
    css.split(';').forEach(pair => {
        const [k, v] = pair.split(':'); 
        if (k && v) {
            const key = k.trim().replace(/-./g, x => x[1].toUpperCase())
            obj[key] = v.trim()
        }
    })
    return obj
}

const Icon = ({ name }) => {
    const s = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }
    switch (name) {
        case 'j-start': return <svg {...s}><path d="M2 12V2M2 22v-10M5 12h14"></path><path d="M15 8l4 4-4 4"></path></svg>
        case 'j-center': return <svg {...s}><path d="M12 2v20M2 12h20M8 8l-4 4 4 4M16 8l4 4-4 4"></path></svg>
        case 'j-end': return <svg {...s}><path d="M22 12V2M22 22v-10M19 12H5"></path><path d="M9 16l-4-4 4-4"></path></svg>
        case 'j-between': return <svg {...s}><path d="M2 2v20M22 2v20H7M13 8l4 4-4 4M11 16l-4-4 4-4"></path></svg>
        case 'a-start': return <svg {...s}><path d="M2 2h20M12 5v14M8 11l4-4 4 4"></path></svg>
        case 'a-center': return <svg {...s}><path d="M2 12h20M12 2v20M8 8l4-4 4 4M16 16l-4 4-4-4"></path></svg>
        case 'a-end': return <svg {...s}><path d="M2 22h20M12 19V5M8 13l4 4 4-4"></path></svg>
        case 'fill': return <svg {...s}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>
        case 'code': return <svg {...s}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        case 'download': return <svg {...s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
        case 'image': return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        case 'eye': return <svg {...s}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        case 'eye-off': return <svg {...s}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
        case 'trash': return <svg {...s}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        case 'lock': return <svg {...s}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        case 'unlock': return <svg {...s}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
        default: return null
    }
}

const MonacoLite = ({ value, onChange, blockName }) => {
    const containerRef = useRef(null); const editorRef = useRef(null)
    const [ready, setReady] = useState(false); const isInternalChange = useRef(false)
    useEffect(() => {
        let isSubscribed = true
        if (!window.monaco) {
            const script = document.createElement('script'); script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs/loader.min.js'
            script.onload = () => {
                window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } })
                window.require(['vs/editor/editor.main'], () => { if (isSubscribed) { setReady(true); initEditor() } })
            }
            document.head.appendChild(script)
        } else { setReady(true); setTimeout(initEditor, 50) }
        function initEditor() {
            if (!containerRef.current || editorRef.current) return
            const h = `.${blockName} {\n`, f = `\n}`
            editorRef.current = window.monaco.editor.create(containerRef.current, {
                value: h + (value || '  ') + f, language: 'css', theme: 'vs-dark', minimap: { enabled: false },
                fontSize: 13, lineNumbers: "on", padding: { top: 12 }, automaticLayout: true,
                scrollbar: { vertical: 'hidden', horizontal: 'hidden' }, renderLineHighlight: 'none'
            })
            editorRef.current.onDidChangeModelContent(() => {
                if (isInternalChange.current) return
                const val = editorRef.current.getValue(); const content = val.substring(val.indexOf('{') + 1, val.lastIndexOf('}')).trim()
                onChange(content)
            })
        }
        return () => { isSubscribed = false }
    }, [])
    useEffect(() => {
        if (!editorRef.current) return
        const h = `.${blockName} {\n`, f = `\n}`
        isInternalChange.current = true; editorRef.current.setValue(h + value + f); isInternalChange.current = false
    }, [value, blockName])
    return (
        <div className="monaco-pro-wrapper" style={{ height: '260px', background: '#1e1e1e', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
            {!ready && <div className="loader-hint" style={{ color: '#fff', padding: '20px' }}>Loading Studio...</div>}
            <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
        </div>
    )
}

export default function App() {
    const [editor, setEditor] = useState(null)
    const [shapes, setShapes] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [camera, setCamera] = useState({ x: 0, y: 0, z: 1 })
    const [showCode, setShowCode] = useState(false)
    const [showPhotos, setShowPhotos] = useState(true)
    const [isGlobalLock, setIsGlobalLock] = useState(true)
    const fileInputRef = useRef(null)

    const isInside = useCallback((child, parent) => {
        if (!child || !parent || child.type !== 'geo' || parent.type !== 'geo') return false
        const cx = child.x, cy = child.y, cw = child.props?.w ?? child.w, ch = child.props?.h ?? child.h
        const px = parent.x, py = parent.y, pw = parent.props?.w ?? parent.w, ph = parent.props?.h ?? parent.h
        return (cx >= px - 1 && cy >= py - 1 && (cx+cw) <= (px+pw) + 1 && (cy+ch) <= (py+ph) + 1)
    }, [])

    const buildTree = useCallback((all) => {
        const geos = all.filter(s => s.type === 'geo')
        if (!geos.length) return []
        const sorted = [...geos].sort((a,b) => ((b.props?.w||b.w)*(b.props?.h||b.h)) - ((a.props?.w||a.w)*(a.props?.h||a.h)))
        const build = (curr, others, parentDir = 'row') => {
            let kids = others.filter(o => isInside(o, curr)).filter(k => !others.some(m => m !== k && isInside(m, curr) && isInside(k, m)))
            let dir = 'row'
            if (kids.length > 1) { const head = kids[0], tail = kids[kids.length - 1]; dir = Math.abs(tail.y - head.y) > Math.abs(tail.x - head.x) ? 'column' : 'row' }
            kids.sort((a, b) => dir === 'row' ? (a.x - b.x) : (a.y - b.y))
            return {
                ...curr, name: curr.id.replace('shape:', 'box-'), w: curr.props?.w || curr.w, h: curr.props?.h || curr.h,
                tag: curr.meta?.tag || 'div', bgImage: curr.meta?.bgImage || '',
                direction: dir, parentDirection: parentDir, align: curr.meta?.align || 'flex-start', justify: curr.meta?.justify || 'flex-start',
                mlA: !!curr.meta?.mlA, mrA: !!curr.meta?.mrA, isGrow: !!curr.meta?.isGrow, isFullH: !!curr.meta?.isFullH, manualCSS: curr.meta?.manualCSS || '',
                children: kids.map(c => build(c, others.filter(o => o.id !== c.id), dir))
            }
        }
        const roots = sorted.filter(s => !sorted.some(p => p !== s && isInside(s, p)))
        return roots.map(r => build(r, sorted.filter(c => c.id !== r.id)))
    }, [isInside])

    const runAtomicUpdate = useCallback((metaOverrides = {}, forceId = null) => {
        if (!editor) return
        const ids = forceId ? [forceId] : (editor.getSelectedShapeIds().length > 0 ? editor.getSelectedShapeIds() : (selectedId ? [selectedId] : []))
        const allItems = Array.from(editor.getCurrentPageShapes()); if (!allItems.length) return
        const updates = []
        const raw = allItems.map(s => (ids.includes(s.id) ? { ...s, meta: { ...s.meta, ...metaOverrides } } : s))
        const treeNodes = buildTree(raw)
        const layout = (node) => {
            if (!node.children?.length) return
            const isRow = node.direction === 'row'; const justify = node.justify || 'flex-start'; const align = node.align || 'flex-start'; const gap = 10;
            const pMain = isRow ? node.w : node.h; const pCross = isRow ? node.h : node.w
            let fixedSum = 0; let growCount = 0; let autoMarginCount = 0
            node.children.forEach(c => { if (c.isGrow) growCount++; else fixedSum += isRow ? c.w : c.h; if (c.mlA) autoMarginCount++; if (c.mrA) autoMarginCount++ })
            const freeSpace = Math.max(0, pMain - fixedSum - (node.children.length - 1) * gap)
            const exGrow = growCount > 0 ? freeSpace / growCount : 0; const exAuto = (growCount === 0 && autoMarginCount > 0) ? freeSpace / autoMarginCount : 0
            let startPos = 0
            if (growCount === 0 && autoMarginCount === 0) { if (justify === 'center') startPos = (pMain - (fixedSum + (node.children.length - 1) * gap)) / 2; if (justify === 'flex-end') startPos = pMain - (fixedSum + (node.children.length - 1) * gap) }
            let step = gap; if (justify === 'space-between' && node.children.length > 1 && growCount === 0 && autoMarginCount === 0) step = (pMain - fixedSum) / (node.children.length - 1)
            node.children.forEach(c => {
                if (c.mlA) startPos += exAuto
                let crossPos = 0; if (align === 'center') crossPos = (pCross - (isRow ? c.h : c.w)) / 2; if (align === 'flex-end') crossPos = pCross - (isRow ? c.h : c.w)
                const mainDim = c.isGrow ? exGrow : (isRow ? c.w : c.h)
                const fX = isRow ? node.x + startPos : node.x + crossPos; const fY = isRow ? node.y + crossPos : node.y + startPos
                updates.push({ id: c.id, type: 'geo', x: Math.round(fX), y: Math.round(fY), props: { w: Math.round(isRow && c.isGrow ? mainDim : c.w), h: Math.round(!isRow && c.isGrow ? mainDim : (c.isFullH ? (isRow ? pCross : c.h) : c.h)) }, meta: c.meta })
                startPos += mainDim + (growCount > 0 || autoMarginCount > 0 ? gap : step); if (c.mrA) startPos += exAuto
                if (c.children?.length) layout(c)
            })
        }
        treeNodes.forEach(r => { updates.push({ id: r.id, type: 'geo', meta: r.meta }); layout(r) })
        if (updates.length) editor.updateShapes(updates)
    }, [editor, buildTree, selectedId])

    useEffect(() => {
        if (!editor) return
        const sync = () => {
            const all = Array.from(editor.getCurrentPageShapes())
            setShapes(all); const sel = editor.getSelectedShapeIds(); setSelectedId(sel.length ? sel[0] : null)
            setCamera({ ...editor.getCamera() })
        }
        sync(); const sub = editor.store.listen(sync)
        const timer = setInterval(() => { if (Array.from(editor.getCurrentPageShapes()).length !== shapes.length) sync() }, 2000)
        return () => { sub(); clearInterval(timer) }
    }, [editor, shapes.length])

    const treeNodes = useMemo(() => buildTree(shapes), [shapes, buildTree])
    const activeShape = useMemo(() => shapes.find(s => s.id === selectedId), [shapes, selectedId])
    const hasChildren = useMemo(() => activeShape ? shapes.some(s => s.id !== activeShape.id && isInside(s, activeShape)) : false, [activeShape, shapes, isInside])

    const toggleRule = (key, value) => {
        if (!editor || !selectedId) return
        const shape = editor.getShape(selectedId); if (!shape) return
        const current = shape.meta?.[key]; const nextValue = current === value ? null : value
        editor.updateShape({ id: selectedId, meta: { ...shape.meta, [key]: nextValue } })
        setTimeout(() => runAtomicUpdate({}, selectedId), 10)
    }

    const toggleFill = () => {
        if (!editor || !selectedId) return
        const shape = editor.getShape(selectedId); if (!shape) return
        const wasGrow = !!shape.meta?.isGrow
        if (!wasGrow) {
            editor.updateShape({ id: selectedId, meta: { ...shape.meta, isGrow: true, baseW: shape.props.w, baseH: shape.props.h } })
            setTimeout(() => runAtomicUpdate({}, selectedId), 10)
        } else {
            const bw = shape.meta?.baseW || shape.props.w; const bh = shape.meta?.baseH || shape.props.h
            editor.updateShape({ id: selectedId, props: { w: bw, h: bh }, meta: { ...shape.meta, isGrow: null } })
            setTimeout(() => runAtomicUpdate({}, selectedId), 10)
        }
    }

    const handleImage = (e) => {
        const file = e.target.files?.[0]; if (!file || !editor) return
        const reader = new FileReader(); reader.onload = async (f) => {
            const img = new Image(); img.onload = () => {
                const canvas = document.createElement('canvas'); const max = 1600; let w = img.width, h = img.height
                if (w > max) { h = (max / d) * h; w = max }; canvas.width = w; canvas.height = h
                canvas.getContext('2d').drawImage(img, 0, 0, w, h); const b64 = canvas.toDataURL('image/jpeg', 0.75)
                if (activeShape) { runAtomicUpdate({ bgImage: b64 }, activeShape.id) }
                else {
                    const sid = createShapeId(); const center = editor.getViewportPageBounds().center
                    editor.createShape({ id: sid, type: 'geo', x: center.x - w / 2, y: center.y - h / 2, props: { w, h }, meta: { bgImage: b64 }, isLocked: isGlobalLock })
                    editor.sendToBack([sid])
                }
            }; img.src = f.target.result
        }; reader.readAsDataURL(file)
    }

    const generateHTML = (nodes, indent = "") => {
        let html = ""; nodes.forEach(n => {
            const tag = n.tag || 'div'; html += `${indent}<${tag} class="${n.name}">\n`;
            if (n.children?.length) html += generateHTML(n.children, indent + "  ");
            html += `${indent}</${tag}>\n`;
        }); return html;
    }

    const generateCSS = (nodes) => {
        let css = ""; nodes.forEach(n => {
            const d = (n.children?.length || n.isGrow) ? '  display: flex;\n' : ''; const fd = n.direction === 'column' ? '  flex-direction: column;\n' : '';
            const bg = n.bgImage ? `  background-image: url('${n.bgImage}');\n  background-size: cover;\n` : '';
            css += `.${n.name} {\n${d}${fd}${bg}  width: ${Math.round(n.w)}px;\n  height: ${Math.round(n.h)}px;\n${n.manualCSS ? n.manualCSS.split('\n').map(l => '  ' + l.trim()).join('\n') + '\n' : ''}}\n\n`;
            if (n.children?.length) css += generateCSS(n.children)
        }); return css
    }

    const exportToZip = async () => {
        const zip = new JSZip(); const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head><body>\n${generateHTML(treeNodes, "  ")}</body></html>`
        const css = `body { margin: 0; background: #f8f9fa; font-family: sans-serif; }\n\n${generateCSS(treeNodes)}`; zip.file("index.html", html); zip.file("style.css", css)
        const blob = await zip.generateAsync({type: "blob"}); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "layout.zip"; link.click()
    }

    return (
        <div className="architect-app" onMouseDown={(e) => { 
          if (e.target.closest('.sidebar') || e.target.closest('.shape-context-hud')) e.stopPropagation()
        }}>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImage} />
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Studio Alpha</h2>
                    <div className="nav-group">
                        <button onClick={() => setShowPhotos(!showPhotos)}><Icon name={showPhotos ? 'eye' : 'eye-off'} /></button>
                        <button onClick={() => { setIsGlobalLock(!isGlobalLock); editor.updateShapes(shapes.filter(s => s.meta?.bgImage).map(s => ({ id: s.id, type: 'geo', isLocked: !isGlobalLock }))) }}><Icon name={isGlobalLock ? 'lock' : 'unlock'} /></button>
                        <button onClick={() => fileInputRef.current.click()}><Icon name="image" /></button>
                        <button onClick={() => setShowCode(true)}><Icon name="code" /></button>
                        <button onClick={exportToZip}><Icon name="download" /></button>
                    </div>
                </div>
                <div className="sidebar-content">
                    {activeShape ? (<div className="monaco-editor-section"><div className="editor-label"><span>Style Settings:</span> <code>.{activeShape.id.replace('shape:', 'box-')}</code></div><MonacoLite blockName={activeShape.id.replace('shape:', 'box-')} value={activeShape.meta?.manualCSS || ''} onChange={(css) => runAtomicUpdate({ manualCSS: css }, activeShape.id)} /></div>) : (<div className="empty-editor-hint">Select a box to customize styles</div>)}
                    <div className="mini-output"><pre><code>{generateCSS(treeNodes)}</code></pre></div>
                </div>
            </aside>
            <main className="canvas-wrapper">
                <style>{`.tl-geo { fill: transparent !important; stroke: rgba(255,255,255,0.1) !important; } ${activeShape ? `[data-shape-id="${activeShape.id}"] { outline: 2px solid #3b82f6 !important; }` : ''}`}</style>

                {/* ФОТО СЛОЙ - САМЫЙ ПЕРВЫЙ В DOM, но с Z-INDEX 100 */}
                <div className="style-proxy-layer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
                    {shapes.filter(s => s.type === 'geo').map(s => (
                        <div key={'p'+s.id} style={{ position: 'absolute', left: (s.x+camera.x)*camera.z, top: (s.y+camera.y)*camera.z, width: s.props.w*camera.z, height: s.props.h*camera.z, backgroundImage: `url(${s.meta?.bgImage})`, backgroundSize: 'cover', opacity: (s.meta?.bgImage && showPhotos) ? 1 : 0 }} />
                    ))}
                </div>

                <Tldraw gridMode persistenceKey="flex-stable-v2000" onMount={setEditor} />

                {activeShape && (
                    <div className="shape-context-hud" style={{ position: 'absolute', left: (activeShape.x + camera.x) * camera.z, top: (activeShape.y + camera.y) * camera.z - 50, zIndex: 200000 }}>
                        <div className="hud-toolbar horizontal-row glass-dark">
                            <div className="hud-tool-section">
                                <select className="tag-selector" value={activeShape.meta?.tag || 'div'} onChange={(e) => runAtomicUpdate({tag: e.target.value}, activeShape.id)}>
                                    <option value="div">DIV</option>
                                    <option value="section">SECTION</option>
                                    <option value="article">ARTICLE</option>
                                    <option value="aside">ASIDE</option>
                                    <option value="nav">NAV</option>
                                    <option value="header">HEADER</option>
                                    <option value="footer">FOOTER</option>
                                    <option value="main">MAIN</option>
                                </select>
                            </div>
                            <div className="hud-sep"></div>
                            {hasChildren && (
                                <>
                                    <div className="hud-tool-section">
                                        <button className={activeShape.meta?.justify === 'flex-start' ? 'active' : ''} onClick={() => toggleRule('justify', 'flex-start')}><Icon name="j-start" /></button>
                                        <button className={activeShape.meta?.justify === 'center' ? 'active' : ''} onClick={() => toggleRule('justify', 'center')}><Icon name="j-center" /></button>
                                        <button className={activeShape.meta?.justify === 'flex-end' ? 'active' : ''} onClick={() => toggleRule('justify', 'flex-end')}><Icon name="j-end" /></button>
                                        <button className={activeShape.meta?.justify === 'space-between' ? 'active' : ''} onClick={() => toggleRule('justify', 'space-between')}><Icon name="j-between" /></button>
                                    </div>
                                    <div className="hud-sep"></div>
                                    <div className="hud-tool-section">
                                        <button className={activeShape.meta?.align === 'flex-start' ? 'active' : ''} onClick={() => toggleRule('align', 'flex-start')}><Icon name="a-start" /></button>
                                        <button className={activeShape.meta?.align === 'center' ? 'active' : ''} onClick={() => toggleRule('align', 'center')}><Icon name="a-center" /></button>
                                        <button className={activeShape.meta?.align === 'flex-end' ? 'active' : ''} onClick={() => toggleRule('align', 'flex-end')}><Icon name="a-end" /></button>
                                    </div>
                                    <div className="hud-sep"></div>
                                </>
                            )}
                            <div className="hud-tool-section">
                                <button className={activeShape.meta?.isFullH ? 'active' : ''} onClick={() => runAtomicUpdate({isFullH: !activeShape.meta?.isFullH}, activeShape.id)}>H100</button>
                                <button className={activeShape.meta?.isGrow ? 'active' : ''} onClick={toggleFill} title="Fill space"><Icon name="fill" /></button>
                                <button className={activeShape.meta?.mlA ? 'active' : ''} onClick={() => runAtomicUpdate({mlA: !activeShape.meta?.mlA, mrA: false}, activeShape.id)}>ML</button>
                                <button className={activeShape.meta?.mrA ? 'active' : ''} onClick={() => runAtomicUpdate({mrA: !activeShape.meta?.mrA, mlA: false}, activeShape.id)}>MR</button>
                                {activeShape.meta?.bgImage && <button onClick={() => runAtomicUpdate({ bgImage: null }, activeShape.id)} className="danger"><Icon name="trash" /></button>}
                            </div>
                            <div className="hud-sep"></div>
                            <div className="hud-tool-section unit-group">
                                <div className="unit-field"><span>X</span><input type="number" value={Math.round(activeShape.x)} onChange={(e) => editor.updateShape({ id: activeShape.id, x: Number(e.target.value) })} /></div>
                                <div className="unit-field"><span>Y</span><input type="number" value={Math.round(activeShape.y)} onChange={(e) => editor.updateShape({ id: activeShape.id, y: Number(e.target.value) })} /></div>
                                <div className="hud-sep secondary"></div>
                                <div className="unit-field"><span>W</span><input type="number" value={Math.round(activeShape.props?.w || 0)} onChange={(e) => { editor.updateShape({ id: activeShape.id, props: { w: Number(e.target.value) } }); runAtomicUpdate({}, activeShape.id) }} /></div>
                                <div className="unit-field"><span>H</span><input type="number" value={Math.round(activeShape.props?.h || 0)} onChange={(e) => { editor.updateShape({ id: activeShape.id, props: { h: Number(e.target.value) } }); runAtomicUpdate({}, activeShape.id) }} /></div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            {showCode && (<div className="modal-overlay" onClick={() => setShowCode(false)} style={{ zIndex: 300000 }}><div className="code-modal" onClick={e => e.stopPropagation()}><div className="modal-header"><h2>HTML/CSS Output</h2><button onClick={() => setShowCode(false)}>✕</button></div><div className="modal-body"><pre><code>{generateHTML(treeNodes)}</code></pre><pre><code>{generateCSS(treeNodes)}</code></pre></div></div></div>)}
        </div>
    )
}
