<script setup>
import { applyReactInVue } from 'veaury'
import ReactTldrawCanvas from './components/TldrawCanvas.jsx'
import { useLayoutEngine, layoutTree, activeElementId } from './engine/layout'
import LayoutNode from './components/LayoutNode.vue'
import { ref } from 'vue'

// Конвертируем Реакт-компонент во Vue-компонент
const TldrawCanvas = applyReactInVue(ReactTldrawCanvas)

const { addChild, generateCSS } = useLayoutEngine()

// Обработка создания фигуры на холсте
const onShapeCreate = (data) => {
  console.log('Vue caught shape:', data)
  // Автоматически добавляем блок в наше дерево, когда что-то нарисовано
  addChild(activeElementId.value)
}
</script>

<template>
  <div class="architect-app">
    <!-- ЛЕВАЯ ПАНЕЛЬ -->
    <aside class="sidebar">
      <h2>Flex Architect AI</h2>
      <div class="tree-preview">
        <LayoutNode v-for="node in layoutTree" :key="node.id" :node="node" />
      </div>
      <div class="hint">
        💡 Нарисуй прямоугольник на холсте, чтобы добавить Flex-блок
      </div>
    </aside>

    <!-- ЦЕНТР: TLdraw Canvas -->
    <main class="canvas-wrapper">
      <TldrawCanvas @shapeCreate="onShapeCreate" />
    </main>

    <!-- ПРАВАЯ ПАНЕЛЬ -->
    <section class="code-output">
      <h3>Live CSS (BEM)</h3>
      <pre><code>{{ generateCSS(layoutTree) }}</code></pre>
    </section>
  </div>
</template>

<style>
.architect-app {
  display: flex;
  height: 100vh;
  background: #121212;
  color: #fff;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  background: #1a1a1a;
  border-right: 1px solid #333;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  background: #000;
}

.code-output {
  width: 350px;
  background: #0a0a0a;
  padding: 20px;
  border-left: 1px solid #333;
}

pre {
  background: #000;
  padding: 15px;
  color: #00ff8b;
  font-size: 12px;
  border-radius: 8px;
  overflow-x: auto;
}

.hint {
    padding: 15px;
    background: rgba(0, 255, 139, 0.1);
    color: #00ff8b;
    border-radius: 8px;
    font-size: 13px;
    margin-top: auto;
}
</style>
