<template>
	<div>
		<div v-if="visible" class="info-popup" :style="positionStyle" @click.stop>
			<div class="popup-header">
				<div class="popup-icon" :class="iconClass">
					{{ icon }}
				</div>
				<div class="popup-title">{{ title }}</div>
				<button class="close-btn" @click="close">×</button>
			</div>
			<div class="popup-content" v-html="content"></div>
		</div>
	</div>
</template>
<script>
export default {
	name: "showDetail",
	props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    iconClass: {
      type: String,
      default: ''
    },
    position: {
      type: Object,
      default: () => ({ top: '20px', left: '20px' })
    }
  },
	computed: {
    positionStyle() {
      return {
        top: this.position.top,
        left: this.position.left
      }
    }
  },
	data() {
		return {
			showInfo: false,
      popupTitle: '',
      popupContent: '',
      popupIcon: '',
      popupIconClass: '',
		}
	},
	methods: {
		// 显示线路信息
    showLineInfo(line) {
      this.popupTitle = line.name + '线路';
      this.popupIcon = '➤';
      this.popupIconClass = 'line-icon';
      this.popupContent = `
        <p><strong>线路名称:</strong> ${line.name}</p>
        <p><strong>线路ID:</strong> ${line.id}</p>
        <p><strong>车站数量:</strong> ${line.stations.length}</p>
        <p><strong>运营状态:</strong> 正常运营</p>
        <p><strong>首末班车:</strong> 6:00 - 23:30</p>
      `;
      
      this.showInfo = true;
    },
    
    // 显示车站信息
    showStationInfo(station) {
      this.popupTitle = station.name;
      this.popupIcon = station.isTransfer ? '⇄' : 'Ⓜ';
      this.popupIconClass = 'station-icon';
      
      // 获取线路名称
      const lineNames = station.lines.map(lid => {
        return `线路${lid}`;
      }).join(', ');
      
      this.popupContent = `
        <p><strong>车站名称:</strong> ${station.name}</p>
        <p><strong>类型:</strong> ${station.isTransfer ? '换乘站' : '普通站'}</p>
        <p><strong>位置:</strong> (${station.x}, ${station.y})</p>
        <p><strong>经过线路:</strong> ${lineNames}</p>
        <p><strong>运营状态:</strong> 正常</p>
      `;
      
      this.showInfo = true;
    },
    
    // 关闭弹窗
    close() {
      this.$emit('close')
    }
	},
}
</script>
<style scoped>
.info-popup {
  position: absolute;
  background: rgba(235, 235, 240, 0.45);
  border-radius: 12px;
  padding: 20px;
  width: 320px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 100;
}

.popup-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.popup-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
  color: white;
}

.station-icon {
  background: linear-gradient(135deg, #00c9ff, #92fe9d);
}

.line-icon {
  background: linear-gradient(135deg, #ff6b6b, #ffa502);
}

.popup-title {
  font-size: 1.3rem;
  font-weight: 600;
  flex: 1;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(91, 87, 87, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.popup-content {
  line-height: 1.6;
  font-size: 0.95rem;
}

.popup-content p {
  margin-bottom: 12px;
  display: flex;
}

.popup-content strong {
  display: inline-block;
  width: 80px;
  flex-shrink: 0;
}
</style>