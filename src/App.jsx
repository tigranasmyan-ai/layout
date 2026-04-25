import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Tldraw, createShapeId } from 'tldraw'
import JSZip from 'jszip'

// Components
import Sidebar from './components/Sidebar'
import HUD from './components/HUD'
import CodeModal, { generateHTML, generateCSS } from './components/CodeModal'
import PhotoLayer from './components/PhotoLayer'
import MonacoEditor from './components/MonacoEditor'
import GuidesLayer from './components/GuidesLayer'

// Logic
import { isInside, buildTree, calculateLayoutUpdates } from './engine/layout'

// Styles
import 'tldraw/tldraw.css'
import './App.css'

export default function App() {
    const [editor, setEditor] = useState(null)
    const [shapes, setShapes] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [camera, setCamera] = useState({ x: 0, y: 0, z: 1 })
    const [showCode, setShowCode] = useState(false)
    const [showPhotos, setShowPhotos] = useState(true)
    const [isGlobalLock, setIsGlobalLock] = useState(true)
    const fileInputRef = useRef(null)

    // SYNC STATE
    useEffect(() => {
        if (!editor) return
        const sync = () => {
            setShapes(Array.from(editor.getCurrentPageShapes()))
            const sel = editor.getSelectedShapeIds(); setSelectedId(sel.length ? sel[0] : null)
            setCamera({ ...editor.getCamera() })
        }
        sync(); const sub = editor.store.listen(sync)
        return () => sub()
    }, [editor])

    const treeNodes = useMemo(() => buildTree(shapes), [shapes])
    const activeShape = useMemo(() => shapes.find(s => s.id === selectedId), [shapes, selectedId])
    const hasChildren = useMemo(() => activeShape ? shapes.some(s => s.id !== activeShape.id && isInside(s, activeShape)) : false, [activeShape, shapes])

    const runAtomicUpdate = useCallback((metaOverrides = {}, forceId = null) => {
        if (!editor) return
        const ids = forceId ? [forceId] : (editor.getSelectedShapeIds().length > 0 ? editor.getSelectedShapeIds() : (selectedId ? [selectedId] : []))
        const allItems = Array.from(editor.getCurrentPageShapes())
        if (!allItems.length) return

        const raw = allItems.map(s => (ids.includes(s.id) ? { ...s, meta: { ...s.meta, ...metaOverrides } } : s))
        const tree = buildTree(raw)
        const updates = calculateLayoutUpdates(tree)
        
        if (updates.length) editor.updateShapes(updates)
    }, [editor, selectedId])

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
                if (w > max) { h = (max / w) * h; w = max }; canvas.width = w; canvas.height = h
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
            
            <Sidebar 
                activeShape={activeShape}
                shapes={shapes}
                showPhotos={showPhotos}
                setShowPhotos={setShowPhotos}
                isGlobalLock={isGlobalLock}
                toggleGlobalLock={() => { setIsGlobalLock(!isGlobalLock); editor.updateShapes(shapes.filter(s => s.meta?.bgImage).map(s => ({ id: s.id, type: 'geo', isLocked: !isGlobalLock }))) }}
                onAddImage={() => fileInputRef.current.click()}
                onShowCode={() => setShowCode(true)}
                onExport={exportToZip}
                onMetaUpdate={runAtomicUpdate}
                onDeleteShape={(id) => editor.deleteShapes([id])}
                cssPreview={generateCSS(treeNodes)}
                MonacoComponent={MonacoEditor}
            />

            <main className="canvas-wrapper">
                <style>{`.tl-geo { fill: transparent !important; stroke: rgba(255,255,255,0.1) !important; } ${activeShape ? `[data-shape-id="${activeShape.id}"] { outline: 2px solid #3b82f6 !important; }` : ''}`}</style>

                <GuidesLayer tree={treeNodes} camera={camera} />
                <PhotoLayer shapes={shapes} camera={camera} showPhotos={showPhotos} />

                <Tldraw gridMode persistenceKey="flex-stable-v2000" onMount={(ed) => { setEditor(ed); ed.user.updateUserPreferences({ isSnapMode: false }) }} />

                <HUD 
                    activeShape={activeShape}
                    editor={editor}
                    camera={camera}
                    hasChildren={hasChildren}
                    onUpdate={runAtomicUpdate}
                    onToggleRule={toggleRule}
                    onToggleFill={toggleFill}
                />
            </main>
            <CodeModal show={showCode} onClose={() => setShowCode(false)} tree={treeNodes} />
        </div>
    )
}
