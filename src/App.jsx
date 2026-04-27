import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Tldraw, createShapeId } from 'tldraw'
import JSZip from 'jszip'

// Components
import Sidebar from './components/Sidebar'
import HUD from './components/HUD'
import CodeModal, { generateHTML, generateCSS } from './components/CodeModal'
import PhotoLayer from './components/PhotoLayer'
import MonacoEditor from './components/MonacoEditor'
import SpacingOverlay from './components/SpacingOverlay'
import GuidesLayer from './components/GuidesLayer'

// Logic
import { isInside, buildTree, calculateLayoutUpdates, initEngine } from './engine/layout'
import { FlexShapeUtil } from './engine/FlexShapeUtil'
import { FlexTool } from './engine/FlexTool'

const customShapeUtils = [FlexShapeUtil]
const customTools = [FlexTool]

const uiOverrides = {
    tools(editor, tools) {
        tools.flex = {
            id: 'flex',
            icon: 'frame',
            label: 'Flex Box',
            kbd: 'f',
            onSelect: () => editor.setCurrentTool('flex'),
        }
        return tools
    },
}

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

    useEffect(() => {
        initEngine()
    }, [])

    // SYNC STATE & AUTO-LAYOUT
    useEffect(() => {
        if (!editor) return
        
        let layoutTimeout = null;
        
            const currentShapes = Array.from(editor.getCurrentPageShapes())
            setShapes(currentShapes)
            const sel = editor.getSelectedShapeIds(); setSelectedId(sel.length ? sel[0] : null)
            setCamera({ ...editor.getCamera() })
            
            const editingId = editor.getEditingShapeId();
            if (editingId) {
                const es = editor.getShape(editingId);
                if (es && es.type === 'geo') {
                    editor.setEditingShape(null);
                }
            }
        
        const sub = editor.store.listen((update) => {
            const isLayoutUpdate = (Date.now() - (window.__lastLayoutEngineUpdate || 0)) < 50;
            if (!isLayoutUpdate && update.source === 'user' && update.changes && update.changes.updated) {
                for (const record of Object.values(update.changes.updated)) {
                    const oldShape = record[0];
                    const newShape = record[1];
                    if (oldShape.typeName === 'shape' && newShape.typeName === 'shape' && oldShape.type === 'geo') {
                        const wChanged = oldShape.props.w !== newShape.props.w;
                        const hChanged = oldShape.props.h !== newShape.props.h;
                        
                        if (wChanged || hChanged) {
                            const metaUpdates = {};
                            if (wChanged && (newShape.meta.isFullW || newShape.meta.isGrow || newShape.meta.isAutoW)) {
                                metaUpdates.isFullW = false;
                                metaUpdates.isGrow = false;
                                metaUpdates.isAutoW = false;
                            }
                            if (hChanged && (newShape.meta.isFullH || newShape.meta.isAutoH)) {
                                metaUpdates.isFullH = false;
                                metaUpdates.isAutoH = false;
                            }
                            if (Object.keys(metaUpdates).length > 0) {
                                setTimeout(() => {
                                    editor.updateShape({
                                        id: newShape.id,
                                        meta: { ...newShape.meta, ...metaUpdates }
                                    });
                                }, 0);
                            }
                        }
                    }
                }
            }
            
            let needsLayout = false;
            if (update.changes) {
                if (Object.keys(update.changes.added).length > 0 || Object.keys(update.changes.removed).length > 0) {
                    needsLayout = true;
                }
                if (update.changes.updated) {
                    for (const record of Object.values(update.changes.updated)) {
                        const oldS = record[0];
                        const newS = record[1];
                        if (oldS.typeName === 'shape' && newS.typeName === 'shape') {
                            if (oldS.x !== newS.x || oldS.y !== newS.y || 
                                oldS.props?.w !== newS.props?.w || oldS.props?.h !== newS.props?.h || 
                                JSON.stringify(oldS.meta) !== JSON.stringify(newS.meta)) {
                                needsLayout = true;
                                break;
                            }
                        }
                    }
                }
            }
            
            const currentShapes = Array.from(editor.getCurrentPageShapes());
            setShapes(currentShapes);
            const sel = editor.getSelectedShapeIds();
            setSelectedId(sel.length ? sel[0] : null);
            setCamera({ ...editor.getCamera() });
            
            const editingId = editor.getEditingShapeId();
            if (editingId) {
                const es = editor.getShape(editingId);
                if (es && es.type === 'geo') {
                    editor.setEditingShape(null);
                }
            }

            if (needsLayout && !isLayoutUpdate) {
                clearTimeout(layoutTimeout);
                const wasAdded = update.changes && Object.keys(update.changes.added).length > 0;
                if (wasAdded) window.__lastLayoutEngineUpdate = 0;

                layoutTimeout = setTimeout(() => {
                    // Safety check: don't layout while dragging unless it's a new shape
                    if (!wasAdded && (editor.inputs.isPointing || editor.getInstanceState().isDragging || editor.getInstanceState().isResizing)) return;
                    
                    const shapesForLayout = Array.from(editor.getCurrentPageShapes());
                    const tree = buildTree(shapesForLayout);
                    const updates = calculateLayoutUpdates(tree);
                    
                    const realUpdates = updates.filter(u => {
                        const s = editor.getShape(u.id);
                        if (!s) return false;
                        const posChanged = Math.abs((u.x ?? s.x) - s.x) > 0.1 || Math.abs((u.y ?? s.y) - s.y) > 0.1;
                        const sizeChanged = u.props && (Math.abs(u.props.w - (s.props.w||0)) > 0.1 || Math.abs(u.props.h - (s.props.h||0)) > 0.1);
                        return posChanged || sizeChanged;
                    });
                    
                    if (realUpdates.length > 0) {
                        window.__lastLayoutEngineUpdate = Date.now();
                        // Use editor.run to ensure atomicity and ignore history for layout jumps
                        editor.run(() => {
                            editor.updateShapes(realUpdates);
                        }, { history: 'ignore' });
                    }
                }, wasAdded ? 50 : 100);
            }
        })
        return () => { 
            sub(); 
            clearTimeout(layoutTimeout); 
        }
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
        
        // Ensure meta changes for the targeted shapes are ALWAYS included
        ids.forEach(id => {
            if (!updates.some(u => u.id === id)) {
                updates.push({ id, meta: { ...editor.getShape(id).meta, ...metaOverrides } })
            }
        })

        const finalUpdates = updates.map(u => {
            if (ids.includes(u.id)) {
                return { ...u, meta: { ...editor.getShape(u.id).meta, ...metaOverrides } }
            }
            return u
        })

        if (finalUpdates.length) {
            window.__lastLayoutEngineUpdate = Date.now();
            editor.updateShapes(finalUpdates);
        }
    }, [editor, selectedId])

    const toggleRule = (key, value) => {
        if (!editor || !selectedId) return
        const shape = editor.getShape(selectedId); if (!shape) return
        const current = shape.meta?.[key]; 
        const nextValue = current === value ? null : value
        runAtomicUpdate({ [key]: nextValue }, selectedId)
    }

    const toggleFill = () => {
        if (!editor || !selectedId) return
        const shape = editor.getShape(selectedId); if (!shape) return
        const wasGrow = !!shape.meta?.isGrow
        if (!wasGrow) {
            runAtomicUpdate({ isGrow: true, baseW: shape.props.w, baseH: shape.props.h }, selectedId)
        } else {
            const bw = shape.meta?.baseW || shape.props.w; 
            const bh = shape.meta?.baseH || shape.props.h
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

                <PhotoLayer shapes={shapes} camera={camera} showPhotos={showPhotos} />
                <SpacingOverlay activeShape={activeShape} camera={camera} onUpdate={runAtomicUpdate} editor={editor} />

                <Tldraw 
                    gridMode 
                    persistenceKey="flex-stable-v2000" 
                    shapeUtils={customShapeUtils}
                    tools={customTools}
                    overrides={uiOverrides}
                    onMount={(ed) => { 
                        setEditor(ed)
                        ed.user.updateUserPreferences({ isSnapMode: true }) 
                    }} 
                />

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
