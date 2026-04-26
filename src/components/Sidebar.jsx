import React from 'react'

const Icon = ({ name }) => {
    const s = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }
    switch (name) {
        case 'eye': return <svg {...s}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        case 'eye-off': return <svg {...s}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
        case 'lock': return <svg {...s}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        case 'unlock': return <svg {...s}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
        case 'image': return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        case 'code': return <svg {...s}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        case 'download': return <svg {...s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
        case 'trash': return <svg {...s}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        default: return null
    }
}

export default function Sidebar({ 
    activeShape, 
    shapes, 
    showPhotos, 
    setShowPhotos, 
    isGlobalLock, 
    toggleGlobalLock, 
    onAddImage, 
    onShowCode, 
    onExport, 
    onMetaUpdate, 
    onDeleteShape,
    cssPreview,
    MonacoComponent
}) {
    return (
        <aside className="sidebar premium-blur">
            <div className="sidebar-header">
                <div className="brand">
                    <div className="brand-dot"></div>
                    <h2>Flex Architect</h2>
                    <span className="version">v2.1</span>
                </div>
                <div className="nav-group">
                    <button className={`nav-btn ${!showPhotos ? 'inactive' : ''}`} onClick={() => setShowPhotos(!showPhotos)} title="Toggle Visibility">
                        <Icon name={showPhotos ? 'eye' : 'eye-off'} />
                    </button>
                    <button className={`nav-btn ${!isGlobalLock ? 'active-lock' : ''}`} onClick={toggleGlobalLock} title={isGlobalLock ? 'Unlock Layers' : 'Lock Layers'}>
                        <Icon name={isGlobalLock ? 'lock' : 'unlock'} />
                    </button>
                    <button className="nav-btn accent" onClick={onAddImage} title="Add Image">
                        <Icon name="image" />
                    </button>
                    <button className="nav-btn" onClick={onShowCode} title="View Source">
                        <Icon name="code" />
                    </button>
                    <button className="nav-btn success" onClick={onExport} title="Download Project">
                        <Icon name="download" />
                    </button>
                </div>
            </div>

            <div className="sidebar-content custom-scroll">
                {activeShape ? (
                    <div className="editor-container">
                        <div className="section-label">
                            <span className="dot"></span>
                            STYLE EDITOR
                            <code className="shape-id">.{activeShape.id.replace('shape:', 'box-')}</code>
                        </div>
                        <MonacoComponent 
                            blockName={activeShape.id.replace('shape:', 'box-')} 
                            value={activeShape.meta?.manualCSS || ''} 
                            onChange={(val) => onMetaUpdate({ manualCSS: val }, activeShape.id)} 
                        />
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon"><Icon name="image" /></div>
                        <p>Select a block to edit styles</p>
                    </div>
                )}

                <div className="sidebar-divider"></div>

                <div className="assets-section">
                    <div className="section-label">ATTACHED PHOTOS</div>
                    <div className="photo-grid">
                        {shapes.filter(s => s.meta?.bgImage).length > 0 ? (
                            shapes.filter(s => s.meta?.bgImage).map(s => (
                                <div key={'ph-'+s.id} className="photo-card">
                                    <div className="photo-thumb" style={{ backgroundImage: `url(${s.meta.bgImage})` }}></div>
                                    <div className="photo-info">
                                        <span>box-{s.id.slice(-4)}</span>
                                        <button className="del-btn" onClick={() => onDeleteShape(s.id)}><Icon name="trash" /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-assets">No images attached</div>
                        )}
                    </div>
                </div>

                <div className="sidebar-divider"></div>

                <div className="preview-section">
                    <div className="section-label">LIVE CSS FEED</div>
                    <div className="css-preview-container">
                        <pre><code>{cssPreview}</code></pre>
                    </div>
                </div>
            </div>
        </aside>
    )
}
