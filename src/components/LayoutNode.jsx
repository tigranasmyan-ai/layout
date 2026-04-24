import React from 'react'

export default function LayoutNode({ node, activeId, setActiveId }) {
    const isActive = activeId === node.id

    return (
        <div 
            className={`layout-node ${isActive ? 'is-active' : ''}`}
            style={node.styles}
            onClick={(e) => {
                e.stopPropagation()
                setActiveId(node.id)
            }}
        >
            <span className="node-label">{node.name}</span>
            {node.children.map(child => (
                <LayoutNode 
                    key={child.id} 
                    node={child} 
                    activeId={activeId} 
                    setActiveId={setActiveId} 
                />
            ))}
        </div>
    )
}
