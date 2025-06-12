<template>
  <div class="app-container">
    <!--    <doc-alert title="用户体系" url="https://doc.iocoder.cn/user-center/" />
    <doc-alert title="三方登陆" url="https://doc.iocoder.cn/social-user/" />
    <doc-alert title="Excel 导入导出" url="https://doc.iocoder.cn/excel-import-and-export/" />-->
    <!-- 搜索工作栏 -->
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input v-model="deptName" placeholder="请输入部门名称" clearable size="small" prefix-icon="el-icon-search"
            style="margin-bottom: 20px" />
        </div>
        <div class="head-container">
          <el-tree :data="deptOptions" :props="defaultProps" :expand-on-click-node="false"
            :filter-node-method="filterNode" ref="tree" default-expand-all highlight-current
            @node-click="handleNodeClick" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
          label-width="68px">
          <el-form-item label="用户名称" prop="username">
            <el-input v-model="queryParams.username" placeholder="请输入用户名称" clearable style="width: 240px"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="queryParams.idCard" placeholder="请输入身份证号" clearable style="width: 240px"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 240px">
              <el-option v-for="dict in statusDictDatas" :key="parseInt(dict.value)" :label="dict.label"
                :value="parseInt(dict.value)" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
              type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
              v-hasPermi="['system:user:create']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-delete" size="mini" @click="handleDelete"
              v-hasPermi="['system:user:delete']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-edit" size="mini" @click="handleUpdate"
              v-hasPermi="['system:user:update']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-dropdown @command="handleCommand" >
              <el-button size="mini" type="primary" v-hasPermi="['system:user:authorize']" icon="el-icon-s-check">权限授权</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="handleAuthorize" size="mini" type="primary">用户权限授权</el-dropdown-item>
                <el-dropdown-item command="handleAuthorizeByGroup" size="mini" type="primary">用户批量授权</el-dropdown-item>
                <el-divider></el-divider>
                <el-dropdown-item command="reloadAuthorize" size="mini" type="primary">重新加载权限</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-view" size="mini" @click="handleView">查看</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" icon="el-icon-upload2" size="mini" @click="handleImport"
              v-hasPermi="['system:user:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
              v-hasPermi="['system:user:export']">导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="userList" highlight-current-row @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="45" align="center" />
          <el-table-column label="用户编号" align="center" key="id" prop="id" width="100" v-if="columns[0].visible" />
          <el-table-column label="用户名称" align="center" key="username" prop="username" v-if="columns[1].visible"
            :show-overflow-tooltip="true" />
          <el-table-column label="员工姓名" align="center" key="nickname" prop="nickname" v-if="columns[2].visible"
            :show-overflow-tooltip="true" />
          <el-table-column label="部门" align="center" key="deptName" prop="deptName" v-if="columns[3].visible"
            :show-overflow-tooltip="true" >
          </el-table-column>
          <el-table-column label="手机号码" align="center" key="mobile" prop="mobile" v-if="columns[4].visible"
            width="160" />
          <el-table-column label="身份证号" align="center" key="idCard" prop="idCard" v-if="columns[7].visible" width="240"/>
          <el-table-column label="状态" key="status" width="80" v-if="columns[5].visible" align="center">
            <template v-slot="scope">
              <el-switch v-model="scope.row.status" :active-value="0" :inactive-value="1"
                @change="handleStatusChange(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[6].visible" width="160">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column label="审核状态" align="center" key="auditStatus" prop="auditStatus" v-if="columns[7].visible"
            width="120"></el-table-column> -->
          <el-table-column label="操作" align="center" width="240" class-name="small-padding fixed-width">
            <template v-slot="scope">
              <el-button size="mini" type="text" icon="el-icon-bank-card" @click.stop="handleCard(scope.row)"
                v-hasPermi="['system:user:card']">卡片</el-button>
              <el-button size="mini" type="text" icon="el-icon-s-check" @click.stop="handleAuthorize(scope.row)"
                v-hasPermi="['system:user:authorize']">授权</el-button>
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                v-hasPermi="['system:user:update']">修改</el-button>
              <el-dropdown @command="(command) => handleCommand(command, scope.$index, scope.row)"
                v-hasPermi="['system:user:delete', 'system:user:update-password', 'system:permission:assign-user-role']">
                <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="handleDelete" v-if="scope.row.id !== 1" size="mini" type="text"
                    icon="el-icon-delete" v-hasPermi="['system:user:delete']">删除</el-dropdown-item>
                  <el-dropdown-item command="handleResetPwd" size="mini" type="text" icon="el-icon-key"
                    v-hasPermi="['system:user:update-password']">重置密码</el-dropdown-item>
                  <el-dropdown-item command="handleRole" size="mini" type="text" icon="el-icon-circle-check"
                    v-hasPermi="['system:permission:assign-user-role']">分配角色</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-drawer :title="title" :visible.sync="open" size="65%" direction="rtl" :before-close="handleClose"
      class="drawer-container">
      <div class="drawer-container-wrapper">
        <el-menu :default-active="activeTab" class="menu-container" mode="horizontal" @select="handleTabChange">
          <el-menu-item index="1">基本信息</el-menu-item>
          <!-- <el-menu-item index="2">卡信息</el-menu-item>
        <el-menu-item index="3">通用权限</el-menu-item>
        <el-menu-item index="4">门禁权限</el-menu-item> -->
        </el-menu>
        <div v-show="activeTab === '1'">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px"
            style="margin-left: 20px; margin-right: 20px;">
            <div style="padding-top: 15px ;overflow: hidden;">
              <el-divider direction="vertical"></el-divider>
              <span
                style="display: inline-block; font-size: 18px; font-weight: bold; text-align: center; margin-top: 5px;">基本信息</span>
            </div>
            <el-divider style="margin: 10px 0;"></el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名称" v-if="form.id === undefined" prop="username">
                  <el-input v-model="form.username" placeholder="请输入用户名称" :disabled="isViewMode" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item  label="员工姓名" prop="nickname">
                  <el-input v-model="form.nickname" placeholder="请输入员工姓名" :disabled="isViewMode" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item v-if="form.id === undefined" label="用户密码" prop="password">
                  <el-input v-model="form.password" placeholder="请输入用户密码" type="password" show-password />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item v-if="form.id === undefined" label="确认密码" prop="password2">
                  <el-input v-model="form.password2" placeholder="请输入用户密码" type="password2" show-password />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="身份证号" prop="idCard">
                  <el-input v-model="form.idCard" placeholder="请输入身份证号码" :disabled="isViewMode" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号码" prop="mobile">
                  <el-input v-model="form.mobile" placeholder="请输入手机号码" maxlength="11" :disabled="isViewMode" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" :disabled="isViewMode" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="出生日期" prop="birthday">
                  <el-date-picker v-model="form.birthday" type="date" placeholder="请选择出生日期" :disabled="isViewMode">
                  </el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户性别">
                  <el-select v-model="form.sex" placeholder="请选择" :disabled="isViewMode">
                    <el-option v-for="dict in sexDictDatas" :key="parseInt(dict.value)" :label="dict.label"
                      :value="parseInt(dict.value)" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <div style="padding-top: 15px ;overflow: hidden;">
              <el-divider direction="vertical"></el-divider>
              <span
                style="display: inline-block; font-size: 18px; font-weight: bold; text-align: center; margin-top: 5px;">工作信息</span>
            </div>
            <el-divider style="margin: 10px 0;"></el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="员工编号" prop="employeeCode">
                  <el-input v-model="form.employeeCode" placeholder="请输入员工编号" :disabled="isViewMode" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属部门" prop="deptId">
                  <treeselect v-model="form.deptId" :options="deptOptions" :show-count="true" :clearable="false"
                    placeholder="请选择所属部门" :normalizer="normalizer" :disabled="isViewMode" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="岗位">
                  <el-select v-model="form.postIds" multiple placeholder="请选择" :disabled="isViewMode">
                    <el-option v-for="item in postOptions" :key="item.id" :label="item.name"
                      :value="item.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row :gutter="20">
            <div style="padding-top: 15px ;overflow: hidden;">
              <el-divider direction="vertical"></el-divider>
              <span
                style="display: inline-block; font-size: 18px; font-weight: bold; text-align: center; margin-top: 5px;">其他信息</span>
            </div>
            <el-divider style="margin: 10px 0;"></el-divider>
            <el-row>
              <el-col :span="24">
                <el-form-item label="备注">
                  <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" :disabled="isViewMode"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div v-show="activeTab === '2'">
          <div style="padding-top: 15px ;overflow: hidden;">
            <el-divider direction="vertical"></el-divider>
            <span
              style="display: inline-block; font-size: 18px; font-weight: bold; text-align: center; margin-top: 5px;">卡信息</span>
          </div>
          <el-divider style="margin: 10px 0;"></el-divider>
          <el-button type="primary" plain icon="el-icon-plus" @click="creatCard">新增门禁卡</el-button>
          <el-table :data="cardList" style="margin-top: 20px;" class="access-table">
            <el-table-column label="物理卡号" align="center" prop="cardId" />
            <el-table-column label="卡类型" align="center" prop="cardType">
              <template v-slot="scope">
                <dict-tag :type="DICT_TYPE.NACS_CARD_TYPE" :value="scope.row.cardType" />
              </template>
            </el-table-column>
            <el-table-column label="卡状态" align="center" prop="cardState">
              <template v-slot="scope">
                <dict-tag :type="DICT_TYPE.NACS_CARD_STATE" :value="scope.row.cardState" />
              </template>
            </el-table-column>
            <el-table-column label="有效时间" align="center" prop="startDate" width="180">
              <template v-slot="scope">
                <span>{{ parseTime(scope.row.endDate) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="失效时间" align="center" prop="endDate" width="180">
              <template v-slot="scope">
                <span>{{ parseTime(scope.row.endDate) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-show="activeTab === '3'">
          <div style="padding-top: 15px ;overflow: hidden;">
            <el-divider direction="vertical"></el-divider>
            <span
              style="display: inline-block; font-size: 18px; font-weight: bold; text-align: center; margin-top: 5px;">人脸权限</span>
          </div>
          <el-divider style="margin: 10px 0;"></el-divider>
          <image-upload v-model="imageUrl" :limit="1" :file-size="10" :file-type="['jpg','png']" />
          <div style="padding-top: 15px ;overflow: hidden;">
            <el-divider direction="vertical"></el-divider>
            <span
              style="display: inline-block; font-size: 18px; font-weight: bold; text-align: center; margin-top: 5px;">指纹权限</span>
          </div>
          <el-divider style="margin: 10px 0;"></el-divider>
        </div>
        <div v-show="activeTab === '4'">
          <div style="padding-top: 15px ;overflow: hidden;">
            <el-divider direction="vertical"></el-divider>
            <span
              style="display: inline-block; font-size: 18px; font-weight: bold; text-align: center; margin-top: 5px;">门禁权限</span>
          </div>
          <el-divider style="margin: 10px 0;"></el-divider>
          <el-button type="primary" plain icon="el-icon-plus" @click="addAccess">新增门禁权限</el-button>
          <el-table :data="accessList" style="margin-top: 20px;" class="access-table">
            <el-table-column label="权限组名称" prop="accessName" />
            <el-table-column label="权限类型" prop="accessType" />
            <el-table-column label="权限模式" prop="accessMode" />
            <el-table-column label="预设公共权限" prop="presetCommonAccess" />
          </el-table>
        </div>
      </div>
      <!-- 添加底部按钮区域 -->
      <div class="drawer-footer-wrapper">
        <div class="drawer-footer-button">
          <!-- <el-button
            v-if="activeTab !== '1'"
            @click="activeTab = (parseInt(activeTab) - 1).toString()">
            上一步
          </el-button>
          <el-button
            v-if="activeTab !== '4'"
            type="primary"
            @click="activeTab = (parseInt(activeTab) + 1).toString()">
            下一步
          </el-button> -->
          <el-button type="primary" @click="open = false">取消</el-button>
          <el-button type="primary" @click="submitForm">
            确定
          </el-button><!-- v-if="activeTab === '4'"  -->
        </div>
      </div>

    </el-drawer>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的用户数据
          </div>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
            @click="importTemplate">下载模板</el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色 -->
    <el-dialog title="分配角色" :visible.sync="openRole" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户昵称">
          <el-input v-model="form.username" :disabled="true" />
        </el-form-item>
        <el-form-item label="员工姓名">
          <el-input v-model="form.nickname" :disabled="true" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roleIds" multiple placeholder="请选择">
            <el-option v-for="item in roleOptions" :key="parseInt(item.id)" :label="item.name"
              :value="parseInt(item.id)"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitRole">确 定</el-button>
        <el-button @click="cancelRole">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 卡片对话框(添加 / 修改) -->
    <CardsForm ref="cardFormRef" @success="getList" />
    <!-- 用户卡片对话框 -->
    <user-card-dialog ref="userCardDialog" />
    <!-- 授权表单对话框 -->
    <authorize-form ref="authorizeFormRef" @success="handleSuccess" />
    <authorize-drawer ref="authorizeDrawerRef"/>
  </div>
</template>

<script>
import {
  addUser,
  changeUserStatus,
  delUser,
  exportUser,
  getUser,
  importTemplate,
  listUser,
  resetUserPwd,
  updateUser,
  isSyncUser
} from "@/api/system/user";
import * as CardsApi from '@/api/nacs/cards';
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import CardsForm from '@/views/nacs/cards/CardsForm.vue';
import userCardDialog from './userCard.vue';
import {listSimpleDepts} from "@/api/system/dept";
import {listSimplePosts} from "@/api/system/post";

import {CommonStatusEnum} from "@/utils/constants";
import {DICT_TYPE, getDictDatas, getLineDatas} from "@/utils/dict";
import {assignUserRole, listUserRoles} from "@/api/system/permission";
import {listSimpleRoles} from "@/api/system/role";
import {getBaseHeader} from "@/utils/request";
import ImageUpload from '@/components/ImageUpload/index.vue'
import AuthorizeForm from './authorize/authorizeForm.vue'
import AuthorizeDrawer from '@/views/system/user/authorize/authorizeDrawer.vue'
import * as AuthorizationApi from '@/api/nacs/authorize'
export default {
  name: "SystemUser",
  components: { Treeselect , ImageUpload, CardsForm, userCardDialog, AuthorizeForm, AuthorizeDrawer},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 部门树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 默认密码
      initPassword: undefined,
      // 性别状态字典
      sexOptions: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {
        id: undefined,
        deptId: undefined,
        username: '',
        nickname: '',
        password: '',
        password2: '',
        mobile: '',
        email: '',
        sex: undefined,
        status: "0",
        remark: '',
        postIds: [],
        roleIds: [],
        idCard: '',
        employeeCode: '',
        birthday: null
      },
      // cardform: {},
      accessList: [],
      cardList:[],
      defaultProps: {
        children: "children",
        label: "name"
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: getBaseHeader(),
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/admin-api/system/user/import'
      },
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        username: undefined,
        mobile: undefined,
        status: undefined,
        deptId: undefined,
        createTime: []
      },
      activeTab: "1",
      // 列信息
      columns: [
        { key: 0, label: `用户编号`, visible: true },
        { key: 1, label: `用户名称`, visible: true },
        { key: 2, label: `用户昵称`, visible: true },
        { key: 3, label: `部门`, visible: true },
        { key: 4, label: `手机号码`, visible: true },
        { key: 5, label: `状态`, visible: true },
        { key: 6, label: `创建时间`, visible: true },
        // { key: 7, label: '审核状态', visible: true },
        { key: 7, label: '身份证号', visible: true }
      ],
      // 表单校验
      rules: {
        username: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" }
        ],
        nickname: [
          { required: true, message: "员工姓名不能为空", trigger: "blur" }
        ],
        password: [
          { required: true, message: "用户密码不能为空", trigger: "blur" }
        ],
        password2: [
          { required: true, message: "确认密码不能为空", trigger: "blur" },
          // { validator: this.validatePassword, trigger: "blur" }
        ],
        idCard: [
          { required: true, message: "身份证号不能为空", trigger: "blur" },
          {pattern:/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '你的身份证格式不正确' }
        ],
        employeeCode: [{ required: true, message: '员工编号不能为空', trigger: 'blur' }],
        mobile: [
          {
            pattern: /^(?:(?:\+|00)86)?1(?:3[\d]|4[5-79]|5[0-35-9]|6[5-7]|7[0-8]|8[\d]|9[189])\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ],
        email: [
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ]
      },

      // 是否显示弹出层（角色权限）
      openRole: false,
      // 枚举
      SysCommonStatusEnum: CommonStatusEnum,
      // 数据字典
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      sexDictDatas: getDictDatas(DICT_TYPE.SYSTEM_USER_SEX),
      cardTypeDictDatas:getDictDatas(DICT_TYPE.SYSTEM_USER_CARD_TYPE),
      isViewMode: false,
      selectedRows: [],      // 多选时的选中行
      imageUrl: '',
      lineMap: getLineDatas(),
    };
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getList();
    this.getTreeselect();
    // this.getConfigKey("sys.user.init-password").then(response => {
    //   this.initPassword = response.msg;
    // });
  },
  methods: {
    // 更多操作
    handleCommand(command, index, row) {
      switch (command) {
        case 'handleUpdate':
          this.handleUpdate(row);//修改客户信息
          break;
        case 'handleDelete':
          this.handleDelete(row);//红号变更
          break;
        case 'handleResetPwd':
          this.handleResetPwd(row);
          break;
        case 'handleRole':
          this.handleRole(row);
          break;
        case 'handleAuthorize':
          this.handleAuthorize();
          break;
        case 'handleAuthorizeByGroup':
          this.handleAuthorizeByGroup();
          break;
        default:
          break;
      }
    },
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      listUser(this.queryParams).then(response => {
          this.userList = response.data.list;
          this.total = response.data.total;
          this.loading = false;
        }
      );
    },
    /** 查询部门下拉树结构 + 岗位下拉 */
    getTreeselect() {
      listSimpleDepts().then(response => {
        // 处理 deptOptions 参数
        this.deptOptions = [];
        this.deptOptions.push(...this.handleTree(response.data, "id"));
      });
      listSimplePosts().then(response => {
        // 处理 postOptions 参数
        this.postOptions = [];
        this.postOptions.push(...response.data);
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.getList();
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === CommonStatusEnum.ENABLE ? "正常" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.username + '"用户吗?').then(function() {
          return changeUserStatus(row.id, row.status);
        }).then(() => {
          this.$modal.msgSuccess(text + "成功");
        }).catch(function() {
          row.status = row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE
              : CommonStatusEnum.ENABLE;
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消按钮（角色权限）
    cancelRole() {
      this.openRole = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        deptId: undefined,
        username: '',
        nickname: '',
        password: '',
        password2: '',
        mobile: '',
        email: '',
        sex: undefined,
        status: "0",
        remark: '',
        postIds: [],
        roleIds: [],
        idCard: '',
        employeeCode: '',
        birthday: null
      };
      this.isViewMode = false;
      this.resetForm("form");
    },
    /** 勾选表格内容 */
    handleSelectionChange(rows) {
      this.selectedRows = rows
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      // 获得下拉数据
      this.getTreeselect();
      // 打开表单，并设置初始化
      this.open = true;
      this.activeTab = "1";
      this.title = "添加用户";
      this.form.password = this.initPassword;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      // 统一获取选中行数据
      const selectedRow = row.id ? row : this.selectedRows[0];
      console.log(selectedRow);
      if (!selectedRow || !selectedRow.id) {
        this.$message.error("请先选择要操作的数据行");
        return;
      }
       // 检查选中数量
      if (this.selectedRows.length > 1) {
        this.$message.warning('只能选择一行数据进行操作')
        return
      }
      this.reset();
      this.getTreeselect();
      const id = selectedRow.id;
      CardsApi.getCardsPage({
        pageNo: 1,
        pageSize: 10,
        employeeId:id}).then(response => {
        this.cardList = response.data.list
      });
      getUser(id).then(response => {
        this.activeTab = "1";
        this.form = response.data;
        this.open = true;
        this.title = "修改用户";
        this.isViewMode = false;
      });
    },
    /** 查看按钮操作 */
    handleView(row) {
      // 统一获取选中行数据
      const selectedRow = row.id ? row : this.selectedRows[0];
      console.log(selectedRow);
      if (!selectedRow || !selectedRow.id) {
        this.$message.error("请先选择要操作的数据行");
        return;
      }
       // 检查选中数量
      if (this.selectedRows.length > 1) {
        this.$message.warning('只能选择一行数据进行操作')
        return
      }
      this.reset();
      const id = selectedRow.id;
      getUser(id).then(response => {
        this.activeTab = "1";
        this.form = response.data;
        this.open = true;
        this.title = "查看用户";
        this.isViewMode = true;
      });
    },
    /** 关闭弹窗 */
    handleClose() {
      this.open = false;
      this.reset();
    },
    handleTabChange(index) {
      this.activeTab = index;
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.username + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(({ value }) => {
          resetUserPwd(row.id, value).then(response => {
            this.$modal.msgSuccess("修改成功，新密码是：" + value);
          });
        }).catch(() => {});
    },
    /** 分配用户角色操作 */
    handleRole(row) {
      this.reset();
      const id = row.id
      // 处理了 form 的用户 username 和 nickname 的展示
      this.form.id = id;
      this.form.username = row.username;
      this.form.nickname = row.nickname;
      // 打开弹窗
      this.openRole = true;
      // 获得角色列表
      listSimpleRoles().then(response => {
        // 处理 roleOptions 参数
        this.roleOptions = [];
        this.roleOptions.push(...response.data);
      });
      // 获得角色拥有的菜单集合
      listUserRoles(id).then(response => {
        // 设置选中
        this.form.roleIds = response.data;
      })
    },
    /** 开卡 */
    creatCard() {
      if (this.form.id === undefined) {
        this.$message.error("请先新建用户");
      } else {
        /** 添加/修改操作 */
        this.$refs["cardFormRef"].creadCard(this.form);
      }
    },
    handleCard(row){
      if (row.id === undefined) {
        this.$message.error("请先选择用户");
      } else {
        /** 添加/修改操作 */
        this.$refs["userCardDialog"].show(row);
      }
    },
    async handleAuthorizeByGroup(){
      // 检查选中数量
      if (this.selectedRows.length <= 1) {
        this.$message.error('请先选择两个以上用户')
        return
      }
      const idCards = this.selectedRows.map(item => item.idCard)
      const cardsInfo = await CardsApi.getLineInfo(idCards);
      let lineInfo = [];
      if (cardsInfo.data.length < idCards.length) {
        this.$modal.msgError('存在未开卡的用户，请开卡后再进行权限管理');
        return;
      } else {
        const allLineNos = this.lineMap.map(line => line.lineNo);
        cardsInfo.data.forEach(item => {
          if (item.cardSource === 0) {
            // 取差集：allLineNos中有但userLineNos中没有的
            const diff = item.lineInfo ? allLineNos.filter(lineNo => !item.lineInfo.includes(lineNo)) : allLineNos;
            // 如果是第一个项目，直接赋值；否则取交集
            lineInfo = lineInfo.length === 0 ? diff : lineInfo.filter(x => diff.includes(x));
          } else if (item.cardSource === 1) {
            // 直接取交集
            lineInfo = lineInfo.length === 0 ? item.lineInfo : lineInfo.filter(x => item.lineInfo.includes(x));
          }
        });
      }
      
      // 检查用户卡片是否激活
      const isCardActive = await CardsApi.isCardActive(idCards);
      if( !isCardActive.data) {
        this.$modal.msgError('存在未激活的门禁卡，请激活后再进行权限管理');
        return;
      }
      // 检查是否有未审核权限
      const response = await AuthorizationApi.checkApply(idCards);
      if (response.data.length > 0) {
        let resultString = '';
        response.data.forEach(item => {
          resultString += item.employeeName + '、';
        })
        resultString = resultString.substring(0, resultString.length - 1);
        this.$modal.msgError(resultString + '存在未审核的权限申请，请等待管理员审核');
        return;
      }
      
      // const CardTotal = await CardsApi.getCards(idCards[0]);
      // console.log(CardTotal);
      this.$refs["authorizeDrawerRef"].showAuthDialog(idCards, lineInfo);
    },
    async handleAuthorize(row){
      // 统一获取选中行数据
      row = row || {}; // 处理row为空的情况
      const selectedRow = row.id ? row : this.selectedRows[0];
      if (!selectedRow || !selectedRow.id) {
        this.$message.error("请先选择要操作的数据行");
        return;
      }
      // 检查选中数量
      if (this.selectedRows.length > 1) {
        this.$message.warning('只能选择一行数据进行操作')
        return
      }
      // const isSyncLineUser = await isSyncUser([selectedRow.idCard]).then(response => {
      //   return response.data
      // })
      // if (!isSyncLineUser) {
      //   this.$modal.msgError('该用户还没有同步到线路，无法进行权限管理');
      //   return
      // }
      const cardtotal = await CardsApi.getCardsPage({
        pageNo: 1,
        pageSize: 10,
        idCard: selectedRow.idCard}).then(response => {
          return response.data.total
      });
      if (cardtotal === 0) {
        this.$confirm('该用户还没有门禁卡，是否进行开卡操作？').then(() => {
          this.handleCard(row);
        }).catch(() => {});
        return
      }
      this.$refs["authorizeFormRef"].show(row);
    },
    /** 跳转至门禁权限管理页面 */
    addAccess() {
      if (this.form.id === undefined) {
        this.$message.error("请先新建用户");
      } else {
        this.open = false;
      this.$router.push({ path:"/nacs/cards" });
      }
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateUser(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addUser(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        } else {
          console.log('表单验证失败');
          return false;
        }
      });
    },
    /** 提交按钮（角色权限） */
    submitRole: function() {
      if (this.form.id !== undefined) {
        assignUserRole({
          userId: this.form.id,
          roleIds: this.form.roleIds,
        }).then(response => {
          this.$modal.msgSuccess("分配角色成功");
          this.openRole = false;
          this.getList();
        });
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      // 统一获取选中行数据
      const selectedRow = row.id ? row : this.selectedRows[0];
      console.log(selectedRow);
      if (!selectedRow || !selectedRow.id) {
        this.$message.error("请先选择要操作的数据行");
        return;
      }
      const ids = selectedRow.id;
      this.$modal.confirm('是否确认删除用户编号为"' + ids + '"的数据项?').then(function() {
          return delUser(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$modal.confirm('是否确认导出所有用户数据项?').then(() => {
        // 处理查询参数
        let params = {...this.queryParams};
        params.pageNo = undefined;
        params.pageSize = undefined;
        this.exportLoading = true;
        return exportUser(params);
      }).then(response => {
        this.$download.excel(response, '用户数据.xls');
      }).finally(() => {
        this.exportLoading = false;
      });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then(response => {
        this.$download.excel(response, '用户导入模板.xls');
      });
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      if (response.code !== 0) {
        this.$modal.msgError(response.msg)
        return;
      }
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      // 拼接提示语
      let data = response.data;
      let text = '创建成功数量：' + data.createUsernames.length;
      for (const username of data.createUsernames) {
        text += '<br />&nbsp;&nbsp;&nbsp;&nbsp;' + username;
      }
      text += '<br />更新成功数量：' + data.updateUsernames.length;
      for (const username of data.updateUsernames) {
        text += '<br />&nbsp;&nbsp;&nbsp;&nbsp;' + username;
      }
      text += '<br />更新失败数量：' + Object.keys(data.failureUsernames).length;
      for (const username in data.failureUsernames) {
        text += '<br />&nbsp;&nbsp;&nbsp;&nbsp;' + username + '：' + data.failureUsernames[username];
      }
      this.$alert(text, "导入结果", { dangerouslyUseHTMLString: true });
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    // 格式化部门的下拉框
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    },
    handleSuccess() {
      this.getList();
    }
  }
};
</script>
<style lang="scss" scoped>
::v-deep.el-divider--vertical {
  width: 12px;
  height: 40px;
  margin: 0 16px;
  background-color: #2661fc;
}
.el-divider--horizontal {
  margin: 18px 0;
}
::v-deep .access-table .el-table__header th .cell {
  text-align: center !important;
}
::v-deep .access-table .el-table__body td .cell {
  text-align: center !important;
}
.access-table {
  height: 400px;
}
.drawer-container {
  height: 100%; /* 关键属性 */
  display: flex;
  flex-direction: column; /* 改为纵向布局 */
}
.drawer-container-wrapper {
  flex: 1;
  overflow: auto; /* 允许内容滚动 */
  padding: 20px; /* 保持原有内边距 */
  min-height: 100%; /* 关键属性 */
}
.drawer-footer-wrapper {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  background: white;
  border-top: 1px solid #ebeef5;
  z-index: 1;
}

.drawer-footer-button {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  max-width: 100%;
  margin: 0 auto;
}
.search-icon {
  color: red;

}
::v-deep .el-table {
  height: calc(100vh - 300px);
  margin-top: 20px;
  // overflow-y: auto;
  .el-table__header-wrapper {
		position: sticky;
		top: 0;
		z-index: 2;
	}
  .el-table__body-wrapper {
		overflow-y: auto !important;
		height: calc(100% - 60px); /* 减去表头高度 */
	}
  tr {
    height: 60px;
  }
}
</style>
