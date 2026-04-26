import React from 'react'
import { parseCSS } from '../engine/layout'

export default function PhotoLayer({ shapes, camera, showPhotos }) {
    return (
        <div className="style-proxy-layer" style={{ 
            position: 'absolute', 
            inset: 0, 
            pointerEvents: 'none', 
            zIndex: 100 
        }}>
            {shapes.filter(s => s.type === 'geo').map(s => {
                const manualStyles = parseCSS(s.meta?.manualCSS)
                const hasBg = !!(s.meta?.bgImage || manualStyles.background || manualStyles.backgroundColor)
                
                return (
                    <div 
                        key={'p'+s.id} 
                        style={{ 
                            position: 'absolute', 
                            left: (s.x + camera.x) * camera.z, 
                            top: (s.y + camera.y) * camera.z, 
                            width: s.props.w * camera.z, 
                            height: s.props.h * camera.z, 
                            backgroundImage: s.meta?.bgImage ? `url(${s.meta?.bgImage})` : undefined, 
                            backgroundSize: 'cover', 
                            backgroundPosition: 'center',
                            ...manualStyles,
                            opacity: (hasBg && showPhotos) ? 1 : (showPhotos ? 1 : 0),
                            pointerEvents: 'none'
                        }} 
                    />
                )
            })}
        </div>
    )
}
