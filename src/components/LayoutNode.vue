<script setup>
import { activeElementId } from '../engine/layout'

const props = defineProps({
  node: Object
})

const selectNode = (id) => {
  activeElementId.value = id
}
</script>

<template>
  <div 
    :class="['layout-node', { 'is-active': activeElementId === node.id }]"
    :style="node.styles"
    @click.stop="selectNode(node.id)"
  >
    <!-- Label для отладки -->
    <span class="node-label">{{ node.name }} #{{ node.id.slice(-3) }}</span>

    <!-- РЕКУРСИЯ: Отрисовываем детей этого блока -->
    <LayoutNode 
      v-for="child in node.children" 
      :key="child.id" 
      :node="child" 
    />
  </div>
</template>

<style scoped>
.layout-node {
  position: relative;
  min-width: 40px;
  min-height: 40px;
  outline: 1px dashed rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.layout-node:hover {
  outline: 1px solid var(--accent-green, #00ff8b);
  background: rgba(0, 255, 139, 0.05);
}

.is-active {
  outline: 2px solid #00ff8b !important;
  background: rgba(0, 255, 139, 0.1) !important;
  z-index: 10;
}

.node-label {
    position: absolute;
    top: -18px;
    left: 0;
    font-size: 10px;
    background: #333;
    color: #eee;
    padding: 2px 5px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
}

.layout-node:hover > .node-label,
.is-active > .node-label {
    opacity: 1;
}
</style>
