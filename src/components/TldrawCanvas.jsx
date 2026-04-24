import React from 'react'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function TldrawCanvas({ onShapeCreate }) {
  
  // Функция, которая вызывается при изменениях на холсте
  const handleMount = (editor) => {
    editor.sideEffects.registerAfterCreateHandler('shape', (shape) => {
      console.log('Shape created:', shape)
      
      // Передаем данные о фигуре наверх во Vue
      if (onShapeCreate && shape.type === 'geo' && shape.props.geo === 'rectangle') {
        onShapeCreate({
          id: shape.id,
          x: shape.x,
          y: shape.y,
          width: shape.props.w,
          height: shape.props.h
        })
      }
    })
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Tldraw onMount={handleMount} />
    </div>
  )
}
