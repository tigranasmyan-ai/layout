import initYoga from 'yoga-wasm-web/asm'

let Yoga = null

export const initEngine = async () => {
    if (Yoga) return Yoga
    Yoga = await initYoga()
    return Yoga
}

// Утилита для парсинга инлайнового CSS
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

// Проверка вложенности (30px запас для стабильности захвата)
export const isInside = (child, parent) => {
    if (!child || !parent || child.id === parent.id) return false
    const margin = 30 
    const c = { x: child.x, y: child.y, w: child.props?.w ?? 100, h: child.props?.h ?? 100 }
    const p = { x: parent.x, y: parent.y, w: parent.props?.w ?? 100, h: parent.props?.h ?? 100 }
    
    return (
        c.x >= p.x - margin &&
        c.y >= p.y - margin &&
        (c.x + c.w) <= (p.x + p.w) + margin &&
        (c.y + c.h) <= (p.y + p.h) + margin
    )
}

// Построение иерархии блоков
export const buildTree = (shapes) => {
    const geos = shapes.filter(s => s.type === 'geo' || s.type === 'flex')
    if (!geos.length) return []
    
    const sorted = [...geos].sort((a,b) => 
        ((b.props?.w||100)*(b.props?.h||100)) - ((a.props?.w||100)*(a.props?.h||100))
    )
    
    const build = (curr, others) => {
        const kids = others.filter(o => isInside(o, curr))
            .filter(k => !others.some(m => m !== k && isInside(m, curr) && isInside(k, m)))
        
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
        const m = n.meta || {}
        
        // Настройки Flexbox
        node.setFlexDirection(m.direction === 'column' ? Yoga.FLEX_DIRECTION_COLUMN : Yoga.FLEX_DIRECTION_ROW)
        if (m.isWrap) node.setFlexWrap(Yoga.WRAP_WRAP)
        if (m.isGrow) node.setFlexGrow(1)

        // Justify
        const justifyMap = { 'center': Yoga.JUSTIFY_CENTER, 'flex-end': Yoga.JUSTIFY_FLEX_END, 'space-between': Yoga.JUSTIFY_SPACE_BETWEEN }
        node.setJustifyContent(justifyMap[m.justify] || Yoga.JUSTIFY_FLEX_START)

        // Align
        const alignMap = { 'center': Yoga.ALIGN_CENTER, 'flex-end': Yoga.ALIGN_FLEX_END, 'stretch': Yoga.ALIGN_STRETCH }
        node.setAlignItems(alignMap[m.align] || Yoga.ALIGN_FLEX_START)

        // Sizing
        if (m.isAutoW) node.setWidthAuto(); else node.setWidth(n.w)
        if (m.isAutoH) node.setHeightAuto(); else node.setHeight(n.h)

        // Spacing
        const pad = (side) => m[`padding${side}`] ?? m.padding ?? 20
        node.setPadding(Yoga.EDGE_TOP, pad('Top'))
        node.setPadding(Yoga.EDGE_RIGHT, pad('Right'))
        node.setPadding(Yoga.EDGE_BOTTOM, pad('Bottom'))
        node.setPadding(Yoga.EDGE_LEFT, pad('Left'))

        const setMargin = (edge, val, auto) => auto ? node.setMarginAuto(edge) : node.setMargin(edge, val ?? m.margin ?? 0)
        setMargin(Yoga.EDGE_TOP, m.marginTop, m.mtA)
        setMargin(Yoga.EDGE_RIGHT, m.marginRight, m.mrA)
        setMargin(Yoga.EDGE_BOTTOM, m.marginBottom, m.mbA)
        setMargin(Yoga.EDGE_LEFT, m.marginLeft, m.mlA)

        if (m.gap && node.setGap) node.setGap(Yoga.GUTTER_ALL, m.gap)

        if (n.children?.length) {
            n.children.forEach((c, idx) => node.insertChild(buildYogaNode(c).yogaNode, idx))
        }

        return { yogaNode: node, source: n }
    }

    treeNodes.forEach(root => {
        const { yogaNode } = buildYogaNode(root)
        yogaNode.calculateLayout(root.w, root.h, Yoga.DIRECTION_LTR)

        const sync = (yNode, sNode, offX = 0, offY = 0) => {
            const l = yNode.getComputedLayout()
            const x = Math.round(offX + l.left), y = Math.round(offY + l.top)
            const w = Math.round(l.width), h = Math.round(l.height)

            if (Math.abs(x - sNode.x) > 0.1 || Math.abs(y - sNode.y) > 0.1 || 
                Math.abs(w - (sNode.props?.w||0)) > 0.1 || Math.abs(h - (sNode.props?.h||0)) > 0.1) {
                updates.push({ id: sNode.id, x, y, props: { w, h } })
            }

            for (let i = 0; i < yNode.getChildCount(); i++) {
                sync(yNode.getChild(i), sNode.children[i], x, y)
            }
        }

        sync(yogaNode, root, root.x, root.y)
        yogaNode.freeRecursive()
    })

    return updates
}
