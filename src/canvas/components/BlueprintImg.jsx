import React from 'react';

const BlueprintImg = ({ blueprint, selectedId, onSelect }) => (
    <div 
        id="blueprint-img" 
        onMouseDown={(e) => { e.stopPropagation(); onSelect('blueprint-img'); }}
        style={{ 
            position: 'absolute', left: blueprint.x, top: blueprint.y, width: blueprint.w, 
            opacity: blueprint.opacity, pointerEvents: 'auto', cursor: 'move', zIndex: 1, 
            border: selectedId === 'blueprint-img' ? '2px solid #10b981' : 'none' 
        }}
    >
        <img src={blueprint.url} style={{ width: '100%', pointerEvents: 'none', userSelect: 'none' }} alt="mockup" />
    </div>
);

export default BlueprintImg;
