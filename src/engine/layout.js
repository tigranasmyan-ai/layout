import initYoga from 'yoga-wasm-web/asm'

let Yoga = null

export const initEngine = async () => {
    if (Yoga) return Yoga
    Yoga = await initYoga()
    return Yoga
}

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
    if (!child || !parent) return false
    if (child.id === parent.id) return false
    if (child.type !== 'geo' && child.type !== 'flex') return false
    if (parent.type !== 'geo' && parent.type !== 'flex') return false
    
    const margin = 30 
    const cx = child.x, cy = child.y, cw = child.props?.w ?? 100, ch = child.props?.h ?? 100
    const px = parent.x, py = parent.y, pw = parent.props?.w ?? 100, ph = parent.props?.h ?? 100
    
    return (
        cx >= px - margin &&
        cy >= py - margin &&
        (cx + cw) <= (px + pw) + margin &&
        (cy + ch) <= (px + ph) + margin
    )
}

export const buildTree = (shapes) => {
    const geos = shapes.filter(s => s.type === 'geo' || s.type === 'flex')
    if (!geos.length) return []
    
    const sorted = [...geos].sort((a,b) => {
        const aArea = (a.props?.w || 100) * (a.props?.h || 100)
        const bArea = (b.props?.w || 100) * (b.props?.h || 100)
        return bArea - aArea
    })
    
    const build = (curr, others) => {
        const kids = others.filter(o => isInside(o, curr)).filter(k => !others.some(m => m !== k && isInside(m, curr) && isInside(k, m)))
        
        return {
            ...curr,
            w: curr.props?.w || 100,
            h: curr.props?.h || 100,
            children: kids.map(c => build(c, others.filter(o => o.id !== c.id)))
        }
    }
    
    const roots = sorted.filter(s => !sorted.some(p => p !== s && isInside(s, p)))
    return roots.map(r => build(r, sorted.filter(c => c.id !== r.id)))
}

export const calculateLayoutUpdates = (treeNodes) => {
    if (!Yoga) return []
    const updates = []

    const buildYogaNode = (n) => {
        const node = Yoga.Node.create()
        const meta = n.meta || {}
        
        node.setFlexDirection(meta.direction === 'column' ? Yoga.FLEX_DIRECTION_COLUMN : Yoga.FLEX_DIRECTION_ROW)
        
        if (meta.justify === 'center') node.setJustifyContent(Yoga.JUSTIFY_CENTER)
        else if (meta.justify === 'flex-end') node.setJustifyContent(Yoga.JUSTIFY_FLEX_END)
        else if (meta.justify === 'space-between') node.setJustifyContent(Yoga.JUSTIFY_SPACE_BETWEEN)
        else node.setJustifyContent(Yoga.JUSTIFY_FLEX_START)

        if (meta.align === 'center') node.setAlignItems(Yoga.ALIGN_CENTER)
        else if (meta.align === 'flex-end') node.setAlignItems(Yoga.ALIGN_FLEX_END)
        else if (meta.align === 'stretch') node.setAlignItems(Yoga.ALIGN_STRETCH)
        else node.setAlignItems(Yoga.ALIGN_FLEX_START)

        if (meta.isGrow) node.setFlexGrow(1)
        node.setWidth(n.w)
        node.setHeight(n.h)

        // Padding (Индивидуальные стороны)
        const pT = meta.paddingTop ?? meta.padding ?? 20
        const pR = meta.paddingRight ?? meta.padding ?? 20
        const pB = meta.paddingBottom ?? meta.padding ?? 20
        const pL = meta.paddingLeft ?? meta.padding ?? 20
        node.setPadding(Yoga.EDGE_TOP, pT)
        node.setPadding(Yoga.EDGE_RIGHT, pR)
        node.setPadding(Yoga.EDGE_BOTTOM, pB)
        node.setPadding(Yoga.EDGE_LEFT, pL)

        // Margin (Индивидуальные стороны + Auto)
        const sides = [
            { edge: Yoga.EDGE_TOP, val: meta.marginTop, auto: meta.mtA, fallback: meta.margin },
            { edge: Yoga.EDGE_RIGHT, val: meta.marginRight, auto: meta.mrA, fallback: meta.margin },
            { edge: Yoga.EDGE_BOTTOM, val: meta.marginBottom, auto: meta.mbA, fallback: meta.margin },
            { edge: Yoga.EDGE_LEFT, val: meta.marginLeft, auto: meta.mlA, fallback: meta.margin }
        ]
        
        sides.forEach(s => {
            if (s.auto) node.setMarginAuto(s.edge)
            else node.setMargin(s.edge, s.val ?? s.fallback ?? 0)
        })

        // Gap
        const gap = meta.gap ?? 0
        if (node.setGap) node.setGap(Yoga.GUTTER_ALL, gap)

        if (n.children?.length) {
            n.children.forEach((c, idx) => {
                const childNode = buildYogaNode(c)
                node.insertChild(childNode.yogaNode, idx)
            })
        }

        return { yogaNode: node, source: n }
    }

    treeNodes.forEach(root => {
        const { yogaNode } = buildYogaNode(root)
        yogaNode.calculateLayout(root.w, root.h, Yoga.DIRECTION_LTR)

        const sync = (yNode, sNode, offX = 0, offY = 0) => {
            const layout = yNode.getComputedLayout()
            const newX = Math.round(offX + layout.left)
            const newY = Math.round(offY + layout.top)
            const newW = Math.round(layout.width)
            const newH = Math.round(layout.height)

            updates.push({
                id: sNode.id,
                x: newX,
                y: newY,
                props: { w: newW, h: newH }
            })

            for (let i = 0; i < yNode.getChildCount(); i++) {
                sync(yNode.getChild(i), sNode.children[i], newX, newY)
            }
        }

        sync(yogaNode, root, root.x, root.y)
        yogaNode.freeRecursive()
    })

    return updates
}
