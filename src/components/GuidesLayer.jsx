import React from 'react'

export default function GuidesLayer({ tree, camera }) {
    const renderGuides = (node) => {
        if (!node.children?.length) return null;

        const isRow = node.direction === 'row';
        const guides = [];

        // Рисуем линии между соседями
        for (let i = 0; i < node.children.length - 1; i++) {
            const current = node.children[i];
            const next = node.children[i + 1];

            const x1 = (current.x + (isRow ? current.w : current.w / 2) + camera.x) * camera.z;
            const y1 = (current.y + (isRow ? current.h / 2 : current.h) + camera.y) * camera.z;
            const x2 = (next.x + (isRow ? 0 : next.w / 2) + camera.x) * camera.z;
            const y2 = (next.y + (isRow ? next.h / 2 : 0) + camera.y) * camera.z;

            guides.push(
                <line 
                    key={`line-${current.id}-${next.id}`}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="rgba(59, 130, 246, 0.4)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                />
            );
        }

        // Рисуем «точки-якоря» на каждом блоке
        node.children.forEach(c => {
            const dotX = (c.x + camera.x) * camera.z;
            const dotY = (c.y + camera.y) * camera.z;
            
            guides.push(
                <circle 
                    key={`dot-${c.id}`}
                    cx={dotX} cy={dotY} r="3"
                    fill="#3b82f6"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.8))' }}
                />
            );
        });

        // Рекурсивно рисуем гиды для детей
        return (
            <React.Fragment key={`group-${node.id}`}>
                {guides}
                {node.children.map(renderGuides)}
            </React.Fragment>
        );
    };

    return (
        <svg style={{ 
            position: 'absolute', 
            inset: 0, 
            pointerEvents: 'none', 
            zIndex: 90, // Под фотографиями, но над холстом
            width: '100%',
            height: '100%'
        }}>
            {tree.map(renderGuides)}
        </svg>
    )
}
