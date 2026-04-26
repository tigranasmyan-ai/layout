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
            paddingTop: parseInt(curr.meta?.paddingTop ?? curr.meta?.padding) || 0,
            paddingRight: parseInt(curr.meta?.paddingRight ?? curr.meta?.padding) || 0,
            paddingBottom: parseInt(curr.meta?.paddingBottom ?? curr.meta?.padding) || 0,
            paddingLeft: parseInt(curr.meta?.paddingLeft ?? curr.meta?.padding) || 0,
            marginTop: parseInt(curr.meta?.marginTop ?? curr.meta?.margin) || 0,
            marginRight: parseInt(curr.meta?.marginRight ?? curr.meta?.margin) || 0,
            marginBottom: parseInt(curr.meta?.marginBottom ?? curr.meta?.margin) || 0,
            marginLeft: parseInt(curr.meta?.marginLeft ?? curr.meta?.margin) || 0,
            mtA: !!curr.meta?.mtA,
            mrA: !!curr.meta?.mrA,
            mbA: !!curr.meta?.mbA,
            mlA: !!curr.meta?.mlA,
            isGrow: !!curr.meta?.isGrow, 
            isFullH: !!curr.meta?.isFullH, 
            isFullW: !!curr.meta?.isFullW,
            isAutoW: !!curr.meta?.isAutoW,
            isAutoH: !!curr.meta?.isAutoH,
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
        const gap = parseInt(node.meta?.gap) || 0
        const pT = node.paddingTop || 0;
        const pR = node.paddingRight || 0;
        const pB = node.paddingBottom || 0;
        const pL = node.paddingLeft || 0;
        
        const pMain = (isRow ? node.w : node.h) - (isRow ? (pL + pR) : (pT + pB))
        const pCross = (isRow ? node.h : node.w) - (isRow ? (pT + pB) : (pL + pR))
        
        let fixedSum = 0, growCount = 0, autoMarginCount = 0
        node.children.forEach(c => { 
            const cmT = c.marginTop || 0;
            const cmR = c.marginRight || 0;
            const cmB = c.marginBottom || 0;
            const cmL = c.marginLeft || 0;
            const cMarginMain = isRow ? (cmL + cmR) : (cmT + cmB);

            if (c.isGrow) {
                growCount++
                fixedSum += cMarginMain // Margin of growing elements still takes space
            } else {
                fixedSum += (isRow ? c.w : c.h) + cMarginMain
            }
            const cAutoMainStart = isRow ? c.mlA : c.mtA;
            const cAutoMainEnd = isRow ? c.mrA : c.mbA;
            if (cAutoMainStart) autoMarginCount++
            if (cAutoMainEnd) autoMarginCount++
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
            const cmT = c.marginTop || 0;
            const cmR = c.marginRight || 0;
            const cmB = c.marginBottom || 0;
            const cmL = c.marginLeft || 0;
            
            const cMarginMainStart = isRow ? cmL : cmT;
            const cMarginMainEnd = isRow ? cmR : cmB;
            const cMarginCrossStart = isRow ? cmT : cmL;
            const cMarginCrossEnd = isRow ? cmB : cmR;
            
            const cAutoMainStart = isRow ? c.mlA : c.mtA;
            const cAutoMainEnd = isRow ? c.mrA : c.mbA;

            if (cAutoMainStart) startPos += exAuto
            
            startPos += cMarginMainStart // Add leading margin
            
            let crossPos = 0
            if (align === 'center') crossPos = (pCross - ((isRow ? c.h : c.w) + cMarginCrossStart + cMarginCrossEnd)) / 2
            if (align === 'flex-end') crossPos = pCross - ((isRow ? c.h : c.w) + cMarginCrossStart + cMarginCrossEnd)
            
            crossPos += cMarginCrossStart // Add top/bottom margin
            
            
            // if it's row, isFullW makes it take pMain. isFullH makes it take pCross.
            // if it's column, isFullW makes it take pCross. isFullH makes it take pMain.
            const mainDimFull = isRow ? pMain - (cmL + cmR) : pMain - (cmT + cmB)
            const crossDimFull = isRow ? pCross - (cmT + cmB) : pCross - (cmL + cmR)

            const finalW = Math.round(isRow ? (c.isGrow ? exGrow : (c.isFullW ? mainDimFull : c.w)) : (c.isFullW ? crossDimFull : c.w))
            const finalH = Math.round(!isRow ? (c.isGrow ? exGrow : (c.isFullH ? mainDimFull : c.h)) : (c.isFullH ? crossDimFull : c.h))

            const fX = isRow ? node.x + pL + startPos : node.x + pL + crossPos
            const fY = isRow ? node.y + pT + crossPos : node.y + pT + startPos
            
            updates.push({ 
                id: c.id, 
                type: 'geo', 
                x: Math.round(fX), 
                y: Math.round(fY), 
                props: { w: finalW, h: finalH }, 
                meta: c.meta 
            })
            
            const mainDim = isRow ? finalW : finalH;
            startPos += mainDim + cMarginMainEnd + (growCount > 0 || autoMarginCount > 0 ? gap : step)
            if (cAutoMainEnd) startPos += exAuto
            if (c.children?.length) layout(c)
        })
    }
    treeNodes.forEach(r => { 
        updates.push({ id: r.id, type: 'geo', meta: r.meta })
        layout(r) 
    })
    return updates
}
