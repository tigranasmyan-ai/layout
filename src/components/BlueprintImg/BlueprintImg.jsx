import React from 'react';
import classes from './BlueprintImg.module.css';

const BlueprintImg = ({ blueprint, selectedId, onSelect }) => (
    <div 
        id="blueprint-img" 
        onMouseDown={(e) => { e.stopPropagation(); onSelect('blueprint-img'); }}
        className={`${classes.blueprintContainer} ${selectedId === 'blueprint-img' ? classes.selected : ''}`}
        style={{ 
            left: `${blueprint.x}px`, 
            top: `${blueprint.y}px`, 
            width: `${blueprint.w}px`, 
            opacity: blueprint.opacity
        }}
    >
        <img src={blueprint.url} className={classes.blueprintImage} alt="mockup" />
    </div>
);

export default BlueprintImg;
