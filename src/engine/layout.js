import { ref } from 'vue'

export const layoutTree = ref([
    {
        id: 'root',
        name: 'Main Wrapper',
        tag: 'section',
        styles: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            padding: '40px'
        },
        children: []
    }
])

export const activeElementId = ref('root')

export function useLayoutEngine() {
    const addChild = (parentId) => {
        const id = `el-${Math.random().toString(36).slice(2, 7)}`
        const newEl = {
            id,
            name: 'Flex Box',
            tag: 'div',
            styles: {
                display: 'flex',
                gap: '12px',
                minHeight: '40px',
                flex: '1'
            },
            children: []
        }

        const findNode = (nodes) => {
            for (const n of nodes) {
                if (n.id === parentId) {
                    n.children.push(newEl)
                    return true
                }
                if (n.children.length && findNode(n.children)) return true
            }
            return false
        }
        findNode(layoutTree.value)
    }

    const generateCSS = (nodes, res = '') => {
        nodes.forEach(n => {
            res += `.${n.id} {\n`
            Object.entries(n.styles).forEach(([p, v]) => {
                const head = p.replace(/[A-Z]/g, m => "-" + m.toLowerCase())
                res += `  ${head}: ${v};\n`
            })
            res += `}\n\n`
            if (n.children.length) res = generateCSS(n.children, res)
        })
        return res
    }

    return { layoutTree, activeElementId, addChild, generateCSS }
}
