<template>
	<div class="app-container">
		<div class="search-container">
			<span style="font-size: 14px;">线路名称</span>
			<el-input 
				v-model="deviceName" 
				placeholder="请输入线路名称" 
				style="width: 200px; margin-right: 10px;"></el-input>
			<el-button type="primary" @click="handleSearch" icon="el-icon-search" size="small">查询</el-button>
			<el-button type="primary" @click="handleReset" icon="el-icon-refresh" size="small">重置</el-button>
		</div>
		<div class="operation-container">
			<el-button type="primary" @click="handleAdd" icon="el-icon-circle-plus-outline" size="small" plain>新增</el-button>
			<el-button type="primary" @click="handleModify" icon="el-icon-edit" size="small" plain>修改</el-button>
			<el-button type="primary" @click="handleExport" icon="el-icon-download" size="small" plain>导出</el-button>
		</div>
		<div class="table-container">
			<el-table :data="tableData" border style="width: 100%; height: 655px;">
				<el-table-column type="selection" width="45" align="center" :reserve-selection="true"></el-table-column>
				<el-table-column type="index" width="40" align="center" />
				<el-table-column label="线路名称" align="center" prop="routeName"></el-table-column>
				<el-table-column label="线路编号" align="center" prop="routeId"></el-table-column>
				<el-table-column label="负责人" align="center" prop="manager"></el-table-column>
				<el-table-column label="线网服务" align="center" prop="address"></el-table-column>
				<el-table-column label="创建时间" align="center" prop="startTime"></el-table-column>
			</el-table>
		</div>
		<div class = "drawer-container">
			<!-- 新增线网管理权限组 -->
			<el-drawer title="新增" style="font-size: 16px;" :visible="drawerVisible" direction='rtl' :before-close="handleClose" size="60%">
				<!-- 步骤1：线路基本信息 -->
				<div v-show="currentStep === 1">
					<el-divider direction="vertical" width="3px" style="color: #2661fc;"></el-divider>
					<span style="font-size: 18px; font-weight: bold;">线网管理</span>
					<el-divider></el-divider>
					<el-form ref="addForm" :model="addForm" :rules="rules" label-width="100px">
						<el-form-item label="线路名称" prop="routeName">
							<el-input v-model="addForm.routeName" placeholder="请输入线路名称"></el-input>
						</el-form-item>
						<el-form-item label="线路编号">
							<el-input v-model="addForm.routeId" :disabled="true"></el-input>
						</el-form-item>
						<el-form-item label="线网服务" prop="routeIp">
							<el-input v-model="addForm.routeIp" placeholder="请输入线网服务地址"></el-input>
						</el-form-item>
						<el-row :gutter="15">
							<el-col :span="12">
								<el-form-item label="线路颜色">
									<el-color-picker v-model="addForm.routeColor" show-alpha :predefine="predefineColors" class="custom-color-picker"></el-color-picker>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="排序">
									<el-input-number v-model="addForm.routeSort" :min="1" :max="10"></el-input-number>
								</el-form-item>
							</el-col>
						</el-row>
						<el-form-item label="负责人" prop="manager">
							<el-input v-model="addForm.manager" placeholder="请输入线路负责人"></el-input>
						</el-form-item>
						<el-form-item label="备注">
							<el-input
								type="textarea"
								:autosize="{ minRows: 2, maxRows: 4}"
								placeholder="请输入备注"
								v-model="addForm.remark">
							</el-input>
						</el-form-item>
					</el-form>
					<div class="footer-actions">
						<el-button type="primary" :disabled="true">上一步</el-button>
						<el-button type="primary" @click="handleAddStep2" >下一步</el-button>
					</div>
				</div>
				<!-- 步骤2：门禁点配置 -->
				<div v-show="currentStep === 2">
					<el-divider direction="vertical" width="3px" style="color: #2661fc;"></el-divider>
					<span style="font-size: 18px; font-weight: bold;">门禁点配置</span>
					<el-divider></el-divider>
					<div class="transfer-container">
						<!-- 已选门禁点 -->
						<div class="selected-container">
							<i class="el-icon-circle-check"></i>
							<span style="font-size: 16px; text-align: center;margin-left: 10px;">已选择的门禁点（{{ selectedStations.length }}）</span>
							<el-table
								class="selected-table"
								:data="selectedStations"
								height="450px"
								style="width: 100%"
								@selection-change="handleRightSelection">
								<el-table-column type="selection" width="35"></el-table-column>
								<el-table-column prop="name" label="门禁点名称" width="120" sortable></el-table-column>
								<el-table-column prop="id" label="门禁点编号" width="120" sortable></el-table-column>
								<el-table-column label="操作" width="120">
									<template slot-scope="scope">
										<el-button 
											size="mini" 
											:disabled="scope.$index === 0"
											@click="moveStation(scope.$index, 'up')">
											↑
										</el-button>
										<el-button 
											size="mini" 
											:disabled="scope.$index === selectedStations.length - 1"
											@click="moveStation(scope.$index, 'down')">
											↓
										</el-button>
									</template>
								</el-table-column>
							</el-table>
						</div>

						<!-- 穿梭框按钮 -->
						<div class="transfer-buttons">
							<el-button 
								type="primary" 
								icon="el-icon-arrow-left" 
								:disabled="leftSelected.length === 0"
								@click="moveToRight"
								style="margin-left: 10px;">
							</el-button>
							<el-button 
								type="primary" 
								icon="el-icon-arrow-right" 
								:disabled="rightSelected.length === 0"
								@click="moveToLeft">
							</el-button>
						</div>

						<!-- 可选站点 -->
						<div class="available-panel">
							<div class="search-bar">
								<div class="table-header">
									<el-input 
										v-model="searchQuery"
										placeholder="搜索门禁点名称"
										style="width: 200px; margin-right: 10px;"/>
									<el-button type="primary" @click="handleSearchSite">查询</el-button>
									<el-button @click="resetSearch">重置</el-button>
								</div>
							</div>
							<el-table
								class="available-table"
								ref="availableTable"
								:data="filteredStations"
								style="width: 100%"
								height="410px"
								@selection-change="handleLeftSelection">
								<el-table-column type="selection" width="55"></el-table-column>
								<el-table-column prop="name" label="门禁点名称" width="150"></el-table-column>
								<el-table-column prop="id" label="门禁点编号" width="150"></el-table-column>
							</el-table>
						</div>

					</div>
					<div class="footer-actions">
						<el-button @click="handlePrevStep">上一步</el-button>
						<el-button type="primary" @click="handleConfirm">确定</el-button>
					</div>
				</div>
			</el-drawer>
		</div>
	</div>
</template>
<script>
export default {
	name: "line_manage",
	components: {  },
	data() {
		return {
			activeIndex: '1',
			deviceName: '',
			routeName: '',
			treeData: [],
			defaultProps: {
				children: 'children',
				label: 'label'
			},
			tableData: [],
			drawerVisible: false,
			rules:{
				routeName: [{ required: true, message: '请输入线路名称', trigger: 'blur' }],
				routeId: [{ required: true, message: '请输入线路编号', trigger: 'blur' }],
				routeIp: [{ required: true, message: '请输入线网服务地址', trigger: 'blur' }],
				manager: [{ required: true, message: '请输入线路负责人', trigger: 'blur' }],
			},
			addForm: {
				routeName: '',
				routeId: '',
				routeIp: '',
				routeColor: 'rgba(255, 69, 0, 0.68)',
				routeSort: 1,
				manager: '',
				remark: ''
			},
			predefineColors: [
				'#ff4500',
				'#ff8c00',
				'#ffd700',
				'#90ee90',
				'#00ced1',
				'#1e90ff',
				'#c71585',
				'rgba(255, 69, 0, 0.68)',
				'rgb(255, 120, 0)',
				'hsv(51, 100, 98)',
				'hsva(120, 40, 94, 0.5)',
				'hsl(181, 100%, 37%)',
				'hsla(209, 100%, 56%, 0.73)',
				'#c7158577'
			],
			currentStep: 1,
			selectedStations: [],
			allStations: [
        { id: 'S001', name: '站点A' },
        { id: 'S002', name: '站点B' }
      ],
      searchQuery: '',
      leftSelected: [],    // 左侧选中项
      rightSelected: [],   // 右侧选中项
			
      newStation: { name: '', id: '' , routeSort: 1}
		}
	},
	computed: {
    filteredStations() {
      return this.allStations.filter(
        station => !this.selectedStations.some(s => s.id === station.id) &&
        station.name.includes(this.searchQuery))
    }
  },
	methods: {
		
		handleNodeClick() {

		},
		handleSearch() {

		},
		handleReset() {
			this.deviceName = '';
		},
		handleAdd() {
			this.drawerVisible = true;
		},
		handleModify() {

		},
		handleExport() {

		},
		handleClose() {
			// this.$confirm('确认关闭？')
			// 	.then(_ => {
				this.drawerVisible = false;;
				// })
				// .catch(_ => {});
		},
		handleAddStep2() {
			this.currentStep = 2;
		},
		moveStation(index, direction) {
      const newIndex = direction === 'up' ? index - 1 : index + 1
      const temp = this.selectedStations[index]
      this.$set(this.selectedStations, index, this.selectedStations[newIndex])
      this.$set(this.selectedStations, newIndex, temp)
    },
		// 移动选中项到右侧（添加到已选列表）
    moveToRight() {
      this.selectedStations = [
        ...this.selectedStations,
        ...this.leftSelected
      ]
      this.leftSelected = []
      this.$refs.availableTable.clearSelection()
    },

    // 移动选中项到左侧（从已选列表移除）
    moveToLeft() {
      const idsToRemove = new Set(this.rightSelected.map(s => s.id))
      this.selectedStations = this.selectedStations.filter(
        s => !idsToRemove.has(s.id)
      )
      this.rightSelected = []
    },
		handleSearchSite() {

		},
		resetSearch() {
			this.searchQuery = ''
		},
		// 处理左侧（可选列表）选中
    handleLeftSelection(selection) {
      this.leftSelected = selection
    },

    // 处理右侧（已选列表）选中
    handleRightSelection(selection) {
      this.rightSelected = selection
    },
		
		handlePrevStep() {
			this.currentStep = 1;
		},
		handleConfirm() {

		}
	}

}

</script>
<style lang="scss" scoped>
.search-container {
	margin-bottom: 15px; 
	display: flex; 
	align-items: center; 
	gap: 10px;
}
.operation-container {
	display: flex; 
	align-items: center;
	gap: 10px; 
	flex-wrap: wrap
}
.table-container {
	padding: 15px 0px 0px 0px;
}
.el-drawer__header > :first-child {
	font-size: 16px;
}
.custom-drawer >>> .el-drawer__body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

::v-deep .custom-color-picker .el-color-picker__trigger {
  width: 210px !important;
}

/* 穿梭框容器 */
.transfer-container {
  display: flex;
  gap: 20px;
  height: 100%;
  padding: 0 20px;
}

.selected-table, .available-table {
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  display: flex;
  flex-direction: column;
	overflow: hidden;
}

.transfer-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding: 0 15px;
}

.table-header {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
	padding: 15px 0 0 0;
}

/* 表格行hover效果 */
.el-table--enable-row-hover .el-table__body tr:hover>td {
  background-color: #f5f7fa;
  cursor: pointer;
}


/* 底部按钮 */
.footer-actions {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
  text-align: center;
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 2;
}

/* 表格滚动条 */
.el-table >>> .el-table__body-wrapper {
  overflow-y: auto !important;
  scrollbar-width: thin;
}

/* 自定义滚动条样式 */
.el-table >>> ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.el-table >>> ::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}
</style>