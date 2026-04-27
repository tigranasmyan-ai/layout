import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Tldraw, createShapeId } from 'tldraw'
import JSZip from 'jszip'

import Sidebar from './components/Sidebar'
import HUD from './components/HUD'
import CodeModal, { generateHTML, generateCSS } from './components/CodeModal'
import PhotoLayer from './components/PhotoLayer'
import MonacoEditor from './components/MonacoEditor'
import SpacingOverlay from './components/SpacingOverlay'

import { isInside, buildTree, calculateLayoutUpdates, initEngine } from './engine/layout'
import { FlexShapeUtil } from './engine/FlexShapeUtil'
import { FlexTool } from './engine/FlexTool'

import 'tldraw/tldraw.css'
import './App.css'

const customShapeUtils = [FlexShapeUtil]
const customTools = [FlexTool]
const uiOverrides = {
    tools(editor, tools) {
        tools.flex = { id: 'flex', icon: 'frame', label: 'Flex Box', kbd: 'f', onSelect: () => editor.setCurrentTool('flex') }
        return tools
    },
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

    useEffect(() => { initEngine() }, [])

    useEffect(() => {
        if (!editor) return
        let layoutTimeout = null

        const sub = editor.store.listen((update) => {
            const isLayoutUpdate = (Date.now() - (window.__lastLayoutEngineUpdate || 0)) < 50
            
            // Auto-reset meta on manual resize
            if (!isLayoutUpdate && update.source === 'user' && update.changes?.updated) {
                for (const record of Object.values(update.changes.updated)) {
                    const [oldS, newS] = record
                    if (oldS.type === 'geo' || oldS.type === 'flex') {
                        const wCh = oldS.props.w !== newS.props.w, hCh = oldS.props.h !== newS.props.h
                        if (wCh || hCh) {
                            const metaUpdates = {}
                            if (wCh) { metaUpdates.isFullW = false; metaUpdates.isGrow = false; metaUpdates.isAutoW = false }
                            if (hCh) { metaUpdates.isFullH = false; metaUpdates.isAutoH = false }
                            if (Object.keys(metaUpdates).length) {
                                setTimeout(() => editor.updateShape({ id: newS.id, meta: { ...newS.meta, ...metaUpdates } }), 0)
                            }
                        }
                    }
                }
            }

            let needsLayout = false
            if (update.changes) {
                if (Object.keys(update.changes.added).length || Object.keys(update.changes.removed).length) needsLayout = true
                else if (update.changes.updated) {
                    for (const [oldS, newS] of Object.values(update.changes.updated)) {
                        if (oldS.x !== newS.x || oldS.y !== newS.y || JSON.stringify(oldS.props) !== JSON.stringify(newS.props) || JSON.stringify(oldS.meta) !== JSON.stringify(newS.meta)) {
                            needsLayout = true; break
                        }
                    }
                }
            }

            const currentShapes = Array.from(editor.getCurrentPageShapes())
            setShapes(currentShapes)
            const sel = editor.getSelectedShapeIds()
            setSelectedId(sel.length ? sel[0] : null)
            setCamera({ ...editor.getCamera() })

            if (needsLayout && !isLayoutUpdate) {
                clearTimeout(layoutTimeout)
                const wasAdded = update.changes?.added && Object.keys(update.changes.added).length > 0
                if (wasAdded) window.__lastLayoutEngineUpdate = 0

                layoutTimeout = setTimeout(() => {
                    if (!wasAdded && (editor.inputs.isPointing || editor.getInstanceState().isDragging || editor.getInstanceState().isResizing)) return
                    const shapesForLayout = Array.from(editor.getCurrentPageShapes())
                    const updates = calculateLayoutUpdates(buildTree(shapesForLayout))
                    
                    if (updates.length > 0) {
                        window.__lastLayoutEngineUpdate = Date.now()
                        editor.run(() => editor.updateShapes(updates), { history: 'ignore' })
                    }
                }, wasAdded ? 50 : 100)
            }
        })
        return () => { sub(); clearTimeout(layoutTimeout) }
    }, [editor])

    const treeNodes = useMemo(() => buildTree(shapes), [shapes])
    const activeShape = useMemo(() => shapes.find(s => s.id === selectedId), [shapes, selectedId])
    const hasChildren = useMemo(() => activeShape ? shapes.some(s => s.id !== activeShape.id && isInside(s, activeShape)) : false, [activeShape, shapes])

    const runAtomicUpdate = useCallback((metaOverrides = {}, forceId = null) => {
        if (!editor) return
        const ids = forceId ? [forceId] : (editor.getSelectedShapeIds().length ? editor.getSelectedShapeIds() : (selectedId ? [selectedId] : []))
        const allItems = Array.from(editor.getCurrentPageShapes())
        const raw = allItems.map(s => ids.includes(s.id) ? { ...s, meta: { ...s.meta, ...metaOverrides } } : s)
        const updates = calculateLayoutUpdates(buildTree(raw))
        
        ids.forEach(id => {
            if (!updates.some(u => u.id === id)) updates.push({ id, meta: { ...editor.getShape(id).meta, ...metaOverrides } })
        })

        const finalUpdates = updates.map(u => ids.includes(u.id) ? { ...u, meta: { ...editor.getShape(u.id).meta, ...metaOverrides } } : u)
        if (finalUpdates.length) {
            window.__lastLayoutEngineUpdate = Date.now()
            editor.updateShapes(finalUpdates)
        }
    }, [editor, selectedId])

    const toggleRule = (key, value) => {
        if (!editor || !selectedId) return
        const s = editor.getShape(selectedId); if (!s) return
        runAtomicUpdate({ [key]: s.meta?.[key] === value ? null : value }, selectedId)
    }

    const toggleFill = () => {
        if (!editor || !selectedId) return
        const s = editor.getShape(selectedId); if (!s) return
        if (!s.meta?.isGrow) runAtomicUpdate({ isGrow: true, baseW: s.props.w, baseH: s.props.h }, selectedId)
        else editor.updateShape({ id: selectedId, props: { w: s.meta.baseW || s.props.w, h: s.meta.baseH || s.props.h }, meta: { ...s.meta, isGrow: null } })
    }

    const handleImage = (e) => {
        const file = e.target.files?.[0]; if (!file || !editor) return
        const reader = new FileReader(); reader.onload = (f) => {
            const img = new Image(); img.onload = () => {
                const canvas = document.createElement('canvas'); const max = 1600; let w = img.width, h = img.height
                if (w > max) { h = (max/w)*h; w = max }; canvas.width = w; canvas.height = h
                canvas.getContext('2d').drawImage(img, 0, 0, w, h); const b64 = canvas.toDataURL('image/jpeg', 0.75)
                if (activeShape) runAtomicUpdate({ bgImage: b64 }, activeShape.id)
                else {
                    const sid = createShapeId(); const center = editor.getViewportPageBounds().center
                    editor.createShape({ id: sid, type: 'geo', x: center.x - w/2, y: center.y - h/2, props: { w, h }, meta: { bgImage: b64 }, isLocked: isGlobalLock })
                    editor.sendToBack([sid])
                }
            }; img.src = f.target.result
        }; reader.readAsDataURL(file)
    }

    const exportToZip = async () => {
        const zip = new JSZip()
        zip.file("index.html", `<!DOCTYPE html><html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head><body>\n${generateHTML(treeNodes, "  ")}</body></html>`)
        zip.file("style.css", `body { margin: 0; background: #f8f9fa; font-family: sans-serif; }\n\n${generateCSS(treeNodes)}`)
        const blob = await zip.generateAsync({type: "blob"}); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "layout.zip"; link.click()
    }

    return (
        <div className="architect-app" onMouseDown={(e) => e.target.closest('.sidebar, .shape-context-hud') && e.stopPropagation()}>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImage} />
            <Sidebar activeShape={activeShape} shapes={shapes} showPhotos={showPhotos} setShowPhotos={setShowPhotos} isGlobalLock={isGlobalLock} 
                     toggleGlobalLock={() => { setIsGlobalLock(!isGlobalLock); editor.updateShapes(shapes.filter(s => s.meta?.bgImage).map(s => ({ id: s.id, isLocked: !isGlobalLock }))) }}
                     onAddImage={() => fileInputRef.current.click()} onShowCode={() => setShowCode(true)} onExport={exportToZip} onMetaUpdate={runAtomicUpdate} 
                     onDeleteShape={(id) => editor.deleteShapes([id])} cssPreview={generateCSS(treeNodes)} MonacoComponent={MonacoEditor} />

            <main className="canvas-wrapper">
                <style>{`.tl-geo { fill: transparent !important; stroke: rgba(255,255,255,0.1) !important; } ${activeShape ? `[data-shape-id="${activeShape.id}"] { outline: 2px solid #3b82f6 !important; }` : ''}`}</style>
                <PhotoLayer shapes={shapes} camera={camera} showPhotos={showPhotos} />
                <SpacingOverlay activeShape={activeShape} camera={camera} onUpdate={runAtomicUpdate} editor={editor} />
                <Tldraw gridMode persistenceKey="flex-stable-v2000" shapeUtils={customShapeUtils} tools={customTools} overrides={uiOverrides} onMount={setEditor} />
                <HUD activeShape={activeShape} editor={editor} camera={camera} hasChildren={hasChildren} onUpdate={runAtomicUpdate} onToggleRule={toggleRule} onToggleFill={toggleFill} />
            </main>
            <CodeModal show={showCode} onClose={() => setShowCode(false)} tree={treeNodes} />
        </div>
    )
}
