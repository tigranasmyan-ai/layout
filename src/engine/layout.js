export const parseCSS = (css) => {
    const obj = {}; if (!css) return obj
    css.split(';').forEach(pair => {
        const [k, v] = pair.split(':'); 
        if (k && v) {
            const key = k.trim().replace(/-./g, x => x[1].toUpperCase())
            obj[key] = v.trim()
        }
    })
    return obj
}

export const isInside = (child, parent) => {
    if (!child || !parent || child.type !== 'geo' || parent.type !== 'geo') return false
    const cx = child.x, cy = child.y, cw = child.props?.w ?? child.w, ch = child.props?.h ?? child.h
    const px = parent.x, py = parent.y, pw = parent.props?.w ?? parent.w, ph = parent.props?.h ?? parent.h
    return (cx >= px - 1 && cy >= py - 1 && (cx+cw) <= (px+pw) + 1 && (cy+ch) <= (py+ph) + 1)
}

export const buildTree = (all) => {
    const geos = all.filter(s => s.type === 'geo')
    if (!geos.length) return []
    // Сортируем от больших к меньшим, чтобы правильно найти корни
    const sorted = [...geos].sort((a,b) => ((b.props?.w||b.w)*(b.props?.h||b.h)) - ((a.props?.w||a.w)*(a.props?.h||a.h)))
    
    const build = (curr, others, parentDir = 'row') => {
        let kids = others.filter(o => isInside(o, curr)).filter(k => !others.some(m => m !== k && isInside(m, curr) && isInside(k, m)))
        let dir = 'row'
        if (kids.length > 1) { 
            const head = kids[0], tail = kids[kids.length - 1]; 
            dir = Math.abs(tail.y - head.y) > Math.abs(tail.x - head.x) ? 'column' : 'row' 
        }
        kids.sort((a, b) => dir === 'row' ? (a.x - b.x) : (a.y - b.y))
        
        return {
            ...curr, 
            name: curr.id.replace('shape:', 'box-'), 
            w: curr.props?.w || curr.w, 
            h: curr.props?.h || curr.h,
            tag: curr.meta?.tag || 'div', 
            bgImage: curr.meta?.bgImage || '',
            direction: dir, 
            parentDirection: parentDir, 
            align: curr.meta?.align || 'flex-start', 
            justify: curr.meta?.justify || 'flex-start',
            mlA: !!curr.meta?.mlA, 
            mrA: !!curr.meta?.mrA, 
            isGrow: !!curr.meta?.isGrow, 
            isFullH: !!curr.meta?.isFullH, 
            manualCSS: curr.meta?.manualCSS || '',
            children: kids.map(c => build(c, others.filter(o => o.id !== c.id), dir))
        }
    }
    
    const roots = sorted.filter(s => !sorted.some(p => p !== s && isInside(s, p)))
    return roots.map(r => build(r, sorted.filter(c => c.id !== r.id)))
}

export const calculateLayoutUpdates = (treeNodes) => {
    const updates = []
    const layout = (node) => {
        if (!node.children?.length) return
        const isRow = node.direction === 'row'
        const justify = node.justify || 'flex-start'
        const align = node.align || 'flex-start'
        const gap = 10
        const pMain = isRow ? node.w : node.h
        const pCross = isRow ? node.h : node.w
        
        let fixedSum = 0, growCount = 0, autoMarginCount = 0
        node.children.forEach(c => { 
            if (c.isGrow) growCount++
            else fixedSum += isRow ? c.w : c.h
            if (c.mlA) autoMarginCount++
            if (c.mrA) autoMarginCount++
        })
        
        const freeSpace = Math.max(0, pMain - fixedSum - (node.children.length - 1) * gap)
        const exGrow = growCount > 0 ? freeSpace / growCount : 0
        const exAuto = (growCount === 0 && autoMarginCount > 0) ? freeSpace / autoMarginCount : 0
        
        let startPos = 0
        if (growCount === 0 && autoMarginCount === 0) { 
            if (justify === 'center') startPos = (pMain - (fixedSum + (node.children.length - 1) * gap)) / 2
            if (justify === 'flex-end') startPos = pMain - (fixedSum + (node.children.length - 1) * gap) 
        }
        
        let step = gap
        if (justify === 'space-between' && node.children.length > 1 && growCount === 0 && autoMarginCount === 0) {
            step = (pMain - fixedSum) / (node.children.length - 1)
        }
        
        node.children.forEach(c => {
            if (c.mlA) startPos += exAuto
            let crossPos = 0
            if (align === 'center') crossPos = (pCross - (isRow ? c.h : c.w)) / 2
            if (align === 'flex-end') crossPos = pCross - (isRow ? c.h : c.w)
            
            const mainDim = c.isGrow ? exGrow : (isRow ? c.w : c.h)
            const fX = isRow ? node.x + startPos : node.x + crossPos
            const fY = isRow ? node.y + crossPos : node.y + startPos
            
            updates.push({ 
                id: c.id, 
                type: 'geo', 
                x: Math.round(fX), 
                y: Math.round(fY), 
                props: { 
                    w: Math.round(isRow && c.isGrow ? mainDim : c.w), 
                    h: Math.round(!isRow && c.isGrow ? mainDim : (c.isFullH ? (isRow ? pCross : c.h) : c.h)) 
                }, 
                meta: c.meta 
            })
            
            startPos += mainDim + (growCount > 0 || autoMarginCount > 0 ? gap : step)
            if (c.mrA) startPos += exAuto
            if (c.children?.length) layout(c)
        })
    }
    treeNodes.forEach(r => { 
        updates.push({ id: r.id, type: 'geo', meta: r.meta })
        layout(r) 
    })
    return updates
}
