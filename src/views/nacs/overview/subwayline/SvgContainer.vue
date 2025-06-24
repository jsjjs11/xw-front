/**
* @description: TODO
* @author: chj
* @date: 2025/6/18 11:09
* @version: v1.0
*/
<template>
  <!-- style="width:100%; height:100%;" -->
  <svg
    class="svg-container"
    :width="width"
    :height="height"
    :viewBox="viewBoxString"
    @mousedown="startDrag"
    @mousemove="handleMove"
    @mouseup="endDrag"
    @wheel="handleZoom"
    @click="handleContainerClick"
    @click:element="handleElementClick"
  >
    <component
      v-for="(item, index) in items"
      :key="item.id || index"
      :is="item.type === 'group' ? 'SvgGroup' : 'SvgElement'"
      :item-data="item"
      :transform="item.transform"
      :type="item.type"
      :cx="item.cx"
      :cy="item.cy"
      :r="item.r"
      :x="item.x"
      :y="item.y"
      :width="item.width"
      :height="item.height"
      :rx="item.rx"
      :ry="item.ry"
      :d="item.d"
      :href="item.href"
      :fill="item.fill"
      :stroke="item.stroke"
      :stroke-width="item.strokeWidth"
      :font-size="item.fontSize"
      :fill-opacity="item.fillOpacity"
      :stroke-dasharray="item.strokeDasharray"
      :stroke-opacity="item.strokeOpacity"
      :content="item.content"
      :updateData="item.updateData"
      @registergrp="registerGrpElement"
      @unregistergrp="unregisterGrpElement"
      @register="registerElement"
      @unregister="unregisterElement"
      @click="handleContainerEvent('click')"
      @contextmenu="handleContainerEvent('contextmenu')"
    >
      <!-- 递归渲染组内子元素 -->
      <template v-if="item.type === 'group' && item.items">
        <component
          v-for="(child, childIndex) in item.items"
          :key="child.id || `${item.id || index}-${childIndex}`"
          :is="child.type === 'group' ? 'SvgGroup' : 'SvgElement'"
          :item-data="child"
          :transform="child.transform"
          :type="child.type"
          :cx="child.cx"
          :cy="child.cy"
          :r="child.r"
          :x="child.x"
          :y="child.y"
          :width="child.width"
          :height="child.height"
          :rx="child.rx"
          :ry="child.ry"
          :d="child.d"
          :href="child.href"
          :fill="child.fill"
          :stroke="child.stroke"
          :stroke-width="child.strokeWidth"
          :font-size="child.fontSize"
          :fill-opacity="child.fillOpacity"
          :stroke-dasharray="child.strokeDasharray"
          :stroke-opacity="child.strokeOpacity"
          :content="child.content"
          :updateData="child.updateData"
          @register="registerElement"
          @unregister="unregisterElement"
        />
      </template>
    </component>
  </svg>
</template>

<script>
import SvgElement from './SvgElement.vue';
import SvgGroup from './SvgGroup.vue';

export default {
  name: 'SvgContainer',
  components: { SvgElement, SvgGroup },
  props: {
    width: { type: [Number, String], default: '100%' },
    height: { type: [Number, String], default: '100%' },
    viewBox: { type: Object, default: () => ({ x: 0, y: 0, width: 1000, height: 1000 })},
    initialViewBox: { type: Object, default: () => ({x: 0, y: 0, width: 1000, height: 1000 })},
    items: { type: Array, default: () => [] }
  },
  data() {
    return {
      elementMap: new Map(),
      isDragging: false,
      startPos: { x: 0, y: 0 },
      scale: 1,
      translateX: 0,
      translateY: 0,
      currentViewBox: null,
    }
  },
  mounted() {
    this.$nextTick(() => {
     // console.log('所有注册的元素实例:', Array.from(this.elementMap.keys()));
    })
  },
  computed: {
    viewBoxString() {
      return `${this.currentViewBox.x} ${this.currentViewBox.y} ${this.currentViewBox.width} ${this.currentViewBox.height}`;
    }
  },
  watch: {
    viewBox: {
      deep: true,
      immediate: true,
      handler(newViewBox) {
        // console.log(newViewBox)
        this.currentViewBox = { ...newViewBox };
      }
    }
  },
  methods: {
    registerElement(id, instance) {
      if (id && instance) {
        this.elementMap.set(id, instance)
        // console.log(`注册元素: ${id}`)
      }
    },
    unregisterElement(id) {
      if (this.elementMap.has(id)) {
        this.elementMap.delete(id)
       // console.log(`注销元素: ${id}`)
      }
    },
    registerGrpElement(id, instance) {
      this.registerElement(id, instance)
    },
    unregisterGrpElement(id) {
      this.unregisterElement(id)
    },
    getElementById(id) {
      return this.elementMap.get(id)
    },
    getAllElements() {
      return Array.from(this.elementMap.values())
    },
    startDrag(event) {
      this.isDragging = true
      this.startPos.x = event.clientX
      this.startPos.y = event.clientY
    },
    endDrag() {
      console.log('mouseup-->拖动结束')
      this.isDragging = false
    },
    handleMove(event) {
      if (!this.isDragging) return;
      const dx = (event.clientX - this.startPos.x) * (this.currentViewBox.width / this.initialViewBox.width)
      const dy = (event.clientY - this.startPos.y) * (this.currentViewBox.height / this.initialViewBox.height);
      this.currentViewBox.x -= dx;
      this.currentViewBox.y -= dy;
      this.startPos.x = event.clientX;
      this.startPos.y = event.clientY;
    },
    handleZoom(event) {
      event.preventDefault();
      const zoomFactor = event.deltaY > 0 ? 1.2 : 0.8;
      const rect = event.target.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) / rect.width;
      const mouseY = (event.clientY - rect.top) / rect.height;
      const newWidth = this.currentViewBox.width * zoomFactor;
      const newHeight = this.currentViewBox.height * zoomFactor;
      this.currentViewBox.x += (this.currentViewBox.width - newWidth) * mouseX;
      this.currentViewBox.y += (this.currentViewBox.height - newHeight) * mouseY;
      this.currentViewBox.width = newWidth;
      this.currentViewBox.height = newHeight;
    },
    resetViewBox() {
      this.currentViewBox  = { ...this.initialViewBox };
    },
    handleContainerClick(event) {
      this.$emit('click', event);
    },
    handleElementClick(item, event) {
      this.$emit('click:element', item, event);
    }
  },
  beforeDestroy() {
    this.elementMap.clear();
  }
};
</script>

<style scoped>
.svg-container {
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  margin-top: 1px;
}
</style>
