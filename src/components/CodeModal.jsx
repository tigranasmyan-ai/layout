import React from 'react'
import { buildCSSObject, serializeCSS } from '../engine/css-generator.js'

const generateHTML = (nodes, indent = "") => {
    let html = "";
    nodes.forEach(n => {
        const tag = n.tag || 'div';
        html += `${indent}<${tag} class="${n.name}">\n`;
        if (n.children?.length) html += generateHTML(n.children, indent + "  ");
        html += `${indent}</${tag}>\n`;
    });
    return html;
}

const generateCSS = (nodes) => {
    const cssObj = buildCSSObject(nodes);
    return serializeCSS(cssObj);
}

export default function CodeModal({ show, onClose, tree }) {
    if (!show) return null;

    const htmlCode = generateHTML(tree);
    const cssCode = generateCSS(tree);

    return (
        <div className="modal-overlay" style={{ zIndex: 300000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <div className="code-modal" style={{ zIndex: 300001, background: '#1e1e1e', width: '90vw', height: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: '#fff', margin: 0 }}>Project Source</h2>
                    <button className="close-modal" onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>✕</button>
                </div>
                <div className="modal-body" style={{ flex: 1, padding: '20px', overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="code-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="panel-header" style={{ color: '#aaa', marginBottom: '10px' }}>index.html</div>
                        <pre style={{ background: '#000', padding: '15px', borderRadius: '8px', flex: 1, overflow: 'auto', color: '#0f0', margin: 0 }}><code>{htmlCode}</code></pre>
                    </div>
                    <div className="code-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="panel-header" style={{ color: '#aaa', marginBottom: '10px' }}>style.css</div>
                        <pre style={{ background: '#000', padding: '15px', borderRadius: '8px', flex: 1, overflow: 'auto', color: '#0f0', margin: 0 }}><code>{cssCode}</code></pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { generateHTML, generateCSS };
