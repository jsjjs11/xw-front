/**
* @description: TODO
* @author: chj
* @date: 2025/6/18 15:40
* @version: v1.0
*/
<template>
  <g :transform="transform">
    <slot />
  </g>
</template>

<script>
export default {
  name: 'SvgGroup',
  props: {
    transform: { type: String, default: '' },
    itemData: { type: Object, required: true },
    updateData: { type: Function, default: () => {} }
  },
  methods: {
    forwardRegister(id, instance) {
      this.$emit('register', id, instance);
    },
    forwardUnregister(id) {
      this.$emit('unregister', id);
    },
    updateDataFun(data) {
      if (typeof this.updateData === 'function') {
        this.updateData(data);
      } else {
        console.warn(`元素 ${this.itemData.id} 没有定义更新函数`);
      }
    }
  },
  mounted() {
    this.$on('register', this.forwardRegister);
    this.$on('unregister', this.forwardUnregister);
    this.$emit('registergrp', this.itemData.id, this);
  },
  beforeDestroy() {
    this.$off('register', this.forwardRegister);
    this.$off('unregister', this.forwardUnregister);
    this.$emit('unregistergrp', this.itemData.id);
  }
};
</script>

