import { nanoid } from 'nanoid'

export const createBlock = (x, y, w, h) => ({
    id: nanoid(5),
    x, y, w, h,
    parentId: null,
    css: '',
    meta: {
        direction: 'row',
        justify: 'flex-start',
        align: 'stretch',
        padding: 0,
        gap: 0
    }
})

/**
 * Checks if box A is fully or partially inside box B
 */
export const isInside = (a, b) => {
    return (
        a.x >= b.x &&
        a.y >= b.y &&
        (a.x + a.w) <= (b.x + b.w) &&
        (a.y + a.h) <= (b.y + b.h)
    )
}

/**
 * Finds the deepest parent for a block
 */
export const findParent = (block, allBlocks) => {
    const potentialParents = allBlocks.filter(b => 
        b.id !== block.id && isInside(block, b)
    )
    
    if (potentialParents.length === 0) return null
    
    // Return the parent with the smallest area (the deepest one)
    return potentialParents.reduce((deepest, current) => {
        const deepestArea = deepest.w * deepest.h
        const currentArea = current.w * current.h
        return currentArea < deepestArea ? current : deepest
    })
}
