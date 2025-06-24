/**
* @description: TODO
* @author: chj
* @date: 2025/6/18 10:11
* @version: v1.0
*/
<template>
  <!-- 如果是文本类型，直接渲染 text 元素 -->
  <text
    v-if="type === 'text'"
    :x="x"
    :y="y"
    :font-size="fontSize"
    :fill="fill"
  >
    {{ content }}
  </text>
  <!-- 其他类型-->
  <component
    v-else
    :is="elementType"
    v-bind="elementProps"
  />
</template>

<script>
export default {
  name: 'SvgElement',
  props: {
    itemData: { type: Object, required: true },
    type: { type: String, required: true },
    transform: { type: String, default: '' },
    x: { type: Number },
    y: { type: Number },
    cx: { type: Number },
    cy: { type: Number },
    r: { type: Number },
    width: { type: Number },
    height: { type: Number },
    rx: { type: Number },
    ry: { type: Number },
    d: { type: String },
    href: { type: String },
    fill: { type: String, default: 'none' },
    stroke: { type: String, default: 'none' },
    strokeWidth: { type: Number, default: 1 },
    content: { type: String },
    fontSize: { type: Number, default: 12 },
    fillOpacity: { type: Number, default: 1 },
    strokeDasharray: { type: String, default: 'none' },
    strokeOpacity: { type: Number, default: 1 },
    updateData: { type: Function, default: () => {} }
  },
  data() {
    return {}
  },
  computed: {
    elementType() {
      return this.type;
    },
    elementProps() {
      const baseProps = {
        transform: this.transform,
        fill: this.fill,
        stroke: this.stroke,
        'stroke-width': this.strokeWidth
      };
      switch (this.type) {
        case 'circle':
          return { ...baseProps, cx: this.cx, cy: this.cy, r: this.r };
        case 'rect':
          return { ...baseProps, x: this.x, y: this.y, width: this.width, height: this.height };
        case 'ellipse':
          return { ...baseProps, cx: this.cx, cy: this.cy, rx: this.rx, ry: this.ry };
        case 'path':
          return { ...baseProps, d: this.d };
        case 'image':
          return { ...baseProps, href: this.href, x: this.x, y: this.y, width: this.width, height: this.height };
        default:
          return baseProps;
      }
    }
  },
  mounted() {
    this.$emit('register', this.itemData.id, this);
  },
  beforeDestroy() {
    this.$emit('unregister', this.itemData.id);
  },
  methods: {
    updateDataFun(data) {
      if (typeof this.updateData === 'function') {
        this.updateData(data);
      } else {
        console.warn(`元素 ${this.itemData.id} 没有定义更新函数`);
      }
    }
  }
};
</script>
