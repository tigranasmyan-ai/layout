import { useState, useCallback, useRef } from 'react'
import { nanoid } from 'nanoid'

const initialTree = [
    {
        id: 'root',
        name: 'Main Container',
        tag: 'main',
        x: 0, y: 0, w: 5000, h: 5000, // Огромный невидимый корень
        styles: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '40px'
        },
        children: []
    }
]

export function useLayoutEngine() {
    const [layoutTree, setLayoutTree] = useState(initialTree)

    // Умное добавление с учетом координат
    const addSmartChild = useCallback((box) => {
        const newEl = {
            id: `el-${nanoid(5)}`,
            name: 'Flex Block',
            tag: 'div',
            ...box, // x, y, w, h из Tldraw
            styles: {
                display: 'flex',
                gap: '10px',
                padding: '10px',
                flexDirection: 'row',
                minHeight: box.h + 'px'
            },
            children: []
        }

        const findBestParent = (nodes, newBox) => {
            let bestParent = null
            for (const n of nodes) {
                // Проверяем, попадает ли центр нового бокса в границы текущего узла
                const isInside = 
                    newBox.x > n.x && 
                    newBox.y > n.y && 
                    (newBox.x + newBox.w) < (n.x + n.w) &&
                    (newBox.y + newBox.h) < (n.y + n.h)
                
                if (isInside) {
                    // Ищем глубже
                    const childParent = findBestParent(n.children, newBox)
                    bestParent = childParent || n
                }
            }
            return bestParent
        }

        setLayoutTree(prev => {
            const parent = findBestParent(prev, box)
            if (!parent) return [...prev, newEl] // Если не нашли, в корень

            const updateTree = (nodes) => {
                return nodes.map(n => {
                    if (n.id === parent.id) {
                        return { ...n, children: [...n.children, newEl] }
                    }
                    if (n.children.length) {
                        return { ...n, children: updateTree(n.children) }
                    }
                    return n
                })
            }
            return updateTree(prev)
        })
    }, [])

    const generateCSS = useCallback((nodes, res = '') => {
        nodes.forEach(n => {
            if (n.id === 'root') {
                res = generateCSS(n.children, res)
                return
            }
            res += `.${n.id} {\n`
            Object.entries(n.styles).forEach(([p, v]) => {
                const head = p.replace(/[A-Z]/g, m => "-" + m.toLowerCase())
                res += `  ${head}: ${v};\n`
            })
            res += `}\n\n`
            if (n.children.length) res = generateCSS(n.children, res)
        })
        return res
    }, [])

    return { layoutTree, addSmartChild, generateCSS, setLayoutTree }
}
