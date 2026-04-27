import React, { useState } from 'react'
import { useDrag } from '@use-gesture/react'

export default function ScrubInput({ label, value, onChange, min = 0 }) {
    const [isEditing, setIsEditing] = useState(false)
    const [inputValue, setInputValue] = useState(value)

    const bind = useDrag(({ delta: [dx], event, first, last, active }) => {
        if (first) {
            document.body.style.cursor = 'ew-resize'
        }
        if (active) {
            const shiftMult = event.shiftKey ? 10 : 1
            const currentVal = typeof value === 'number' ? value : 0
            const nextVal = Math.max(min, currentVal + Math.round(dx * shiftMult))
            if (nextVal !== value) onChange(nextVal)
        }
        if (last) {
            document.body.style.cursor = 'auto'
        }
    }, {
        pointer: { capture: true }
    })

    const handleDoubleClick = () => {
        setIsEditing(true)
        setInputValue(value)
    }

    const handleBlur = () => {
        setIsEditing(false)
        const parsed = parseFloat(inputValue)
        if (!isNaN(parsed)) onChange(parsed)
        else onChange(inputValue)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleBlur()
        if (e.key === 'Escape') setIsEditing(false)
    }

    return (
        <div className="scrub-input" {...(isEditing ? {} : bind())} onDoubleClick={handleDoubleClick}>
            <span className="scrub-label">{label}</span>
            {isEditing ? (
                <input 
                    autoFocus 
                    className="scrub-value-input"
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                />
            ) : (
                <span className="scrub-value">{value}</span>
            )}
        </div>
    )
}
