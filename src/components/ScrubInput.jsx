import React, { useRef, useState, useEffect } from 'react';

export default function ScrubInput({ label, value, onChange, title }) {
    const [isDragging, setIsDragging] = useState(false);
    const startPos = useRef(0);
    const startVal = useRef(0);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        startPos.current = e.clientX;
        startVal.current = parseInt(value) || 0;
        document.body.style.cursor = 'ew-resize';
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            const delta = e.clientX - startPos.current;
            const multiplier = e.shiftKey ? 10 : 1;
            // For every 2 pixels moved, change value by 1 * multiplier
            const change = Math.round(delta / 2) * multiplier;
            onChange(startVal.current + change);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.cursor = '';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, onChange]);

    return (
        <div className={`input-group ${isDragging ? 'scrubbing' : ''}`}>
            <span 
                className="label scrub-label" 
                title={title || label}
                onMouseDown={handleMouseDown}
                style={{ cursor: 'ew-resize', userSelect: 'none' }}
            >
                {label}
            </span>
            <input 
                type="text" 
                value={value} 
                onChange={(e) => {
                    const str = e.target.value;
                    const num = parseInt(str, 10);
                    onChange(isNaN(num) ? str : num);
                }} 
                style={{ width: `${Math.max(2, String(value).length) + 0.5}ch`, minWidth: '2ch' }}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        onChange((parseInt(value) || 0) + (e.shiftKey ? 10 : 1));
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        onChange((parseInt(value) || 0) - (e.shiftKey ? 10 : 1));
                    }
                }}
            />
        </div>
    );
}
