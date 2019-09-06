<template>
  <div>
    <div style="text-align:right;margin-bottom: 4px;">
      <a-button class="editable-add-btn" @click="handleAdd" type="primary"
        >新建</a-button
      >
    </div>
    <a-table
      bordered
      :dataSource="applicationList"
      :columns="columns"
      rowKey="id"
      :pagination="false"
    >
      <div slot="expandedRowRender" slot-scope="record">
        <a-form>
          <a-list :grid="{ gutter: 16, column: 8 }" :dataSource="record.params">
            <a-list-item slot="renderItem" slot-scope="item, index">
              <a-card :title="item.name">Card content</a-card>
            </a-list-item>
          </a-list>
        </a-form>
      </div>
      <template slot="name" slot-scope="text">
        <editable-cell :text="text" />
      </template>
      <!--操作-->
      <template slot="operation" slot-scope="name, record">
        <a-popconfirm
          v-if="applicationList.length"
          title="确认删除吗"
          @confirm="() => onDelete(record.id)"
        >
          <a href="javascript:;">删除</a>
        </a-popconfirm>
        <span style="margin-left: 10px">
          <a @click="handleEdit(record)">修改</a>
        </span>
      </template>
    </a-table>
    <!--创建仿真应用-->
    <a-modal title="新建仿真应用" :width="800" v-model="visible" @ok="handleOk">
      <a-form :form="createForm">
        <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
          label="名称"
        >
          <a-input placeholder="请输入仿真应用名称" v-model="createForm.name" />
        </a-form-item>
        <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
          label="描述"
        >
          <a-input
            placeholder="请输入仿真应用描述"
            v-model="createForm.description"
          />
        </a-form-item>
        <a-form-item
          v-for="(k, index) in createForm.attributeList"
          :key="index"
          v-bind="index === 0 ? attributeLayout : formItemLayoutWithOutLabel"
          :label="index === 0 ? '参数项' : ''"
          :required="false"
        >
          <a-input
            v-model="k.name"
            placeholder="请输入参数名称"
            style="width: 200px; margin-right: 8px"
          />
          <a-select
            placeholder="请选择类型"
            style="width: 140px; margin-right: 8px;"
            v-model="k.type"
          >
            <a-select-option value="0">int</a-select-option>
            <a-select-option value="1">double</a-select-option>
            <a-select-option value="2">string</a-select-option>
            <a-select-option value="3">boolean</a-select-option>
          </a-select>
          <a-icon
            v-if="createForm.attributeList.length > 0"
            class="dynamic-delete-button"
            type="minus-circle-o"
            :disabled="createForm.attributeList.length === 0"
            @click="() => remove(k, createForm.attributeList)"
          />
        </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel">
          <a-button
            type="dashed"
            style="width: 60%"
            @click="addAttribute(createForm.attributeList)"
          >
            <a-icon type="plus" /> 添加参数
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
    <!--修改仿真应用-->
    <a-modal
      title="新建仿真应用"
      :width="800"
      v-model="editVisible"
      @ok="confirmEdit"
    >
      <a-form :form="currentForm">
        <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
          label="名称"
        >
          <a-input
            placeholder="请输入仿真应用名称"
            v-model="currentForm.name"
          />
        </a-form-item>
        <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
          label="描述"
        >
          <a-input
            placeholder="请输入仿真应用描述"
            v-model="currentForm.description"
          />
        </a-form-item>
        <a-form-item
          v-for="(k, index) in currentForm.params"
          :key="index"
          v-bind="index === 0 ? attributeLayout : formItemLayoutWithOutLabel"
          :label="index === 0 ? '参数项' : ''"
          :required="false"
        >
          <a-input
            v-model="k.name"
            placeholder="请输入参数名称"
            style="width: 200px; margin-right: 8px"
          />
          <a-select
            placeholder="请选择类型"
            style="width: 140px; margin-right: 8px;"
            v-model="k.type"
          >
            <a-select-option value="0">int</a-select-option>
            <a-select-option value="1">double</a-select-option>
            <a-select-option value="2">string</a-select-option>
            <a-select-option value="3">boolean</a-select-option>
          </a-select>
          <a-icon
            v-if="currentForm.params.length > 0"
            class="dynamic-delete-button"
            type="minus-circle-o"
            :disabled="currentForm.params.length === 0"
            @click="() => remove(k, currentForm.params)"
          />
        </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel">
          <a-button
            type="dashed"
            style="width: 60%"
            @click="addAttribute(currentForm.params)"
          >
            <a-icon type="plus" /> 添加参数
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import {
  getApplication,
  deleteApplication,
  addApplication,
  editApplication
} from "@/api/application";
import uniqid from "uniqid";
import renderFun from "@/main.js";
import _ from "lodash";
// import qs from 'qs'
// import _ from 'lodash'
import Vue from "vue";
import { USER_ID } from "@/store/mutation-types";
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
};
const formTailLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
};
const attributeLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 19 }
  }
};
export default {
  name: "SimApplication",
  data() {
    return {
      columns: [
        {
          title: "名称",
          dataIndex: "name",
          align: "center"
        },
        {
          title: "描述",
          dataIndex: "description",
          align: "center"
        },
        {
          title: "创建时间",
          dataIndex: "createTime",
          align: "center"
        },
        {
          title: "操作",
          dataIndex: "operation",
          align: "center",
          scopedSlots: { customRender: "operation" }
        }
      ],
      formItemLayout,
      formTailLayout,
      attributeLayout,
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          xs: { span: 24, offset: 0 },
          sm: { span: 19, offset: 5 }
        }
      },
      applicationList: [
        {
          name: "应用1",
          description: "这是仿真应用1",
          id: "1",
          createTime: "2010-8-31 11:00:00"
        },
        {
          name: "应用2",
          description: "这是仿真应用2",
          id: "2",
          createTime: "2010-8-31 11:01:00"
        },
        {
          name: "应用3",
          description: "这是仿真应用3",
          id: "3",
          createTime: "2010-8-31 11:02:00"
        },
        {
          name: "应用4",
          description: "这是仿真应用4",
          id: "4",
          createTime: "2010-8-31 11:03:00"
        }
      ],
      targetApp: {},
      form: this.$form.createForm(this),
      createForm: {
        name: "",
        description: "",
        attributeList: []
      },
      currentForm: {},
      visible: false,
      editVisible: false
    };
  },
  created() {
    this.getAppList();
    renderFun.sendThis(this);
  },
  methods: {
    getAppList() {
      getApplication().then(res => {
        if (res.data.code === 0) {
          this.applicationList = res.data.data;
        }
      });
    },
    onDelete(id) {
      deleteApplication(id).then(res => {
        if (res.data.code === 0) {
          const dataSource = [...this.applicationList];
          this.dataSource = dataSource.filter(item => item.id !== id);
        }
      });
    },
    resetForm() {
      this.createForm = {
        name: "",
        description: "",
        attributeList: []
      };
    },
    handleAdd() {
      this.resetForm();
      this.visible = true;
    },
    handleEdit(record) {
      console.log(this.$store);
      this.currentForm = _.cloneDeep(record);
      this.currentForm.params.forEach(item => {
        if (_.isNumber(item.type)) {
          item.type = item.type.toString();
        }
      });
      this.editVisible = true;
    },
    handleOk() {
      const postData = {
        name: this.createForm.name,
        description: this.createForm.description,
        params: this.createForm.attributeList
      };
      const userId = Vue.ls.get(USER_ID);
      addApplication(userId, JSON.stringify(postData)).then(res => {
        if (res.data.code === 0) {
          this.$message.success("仿真应用创建成功！");
          this.visible = false;
          this.getAppList();
        }
      });
    },
    confirmEdit() {
      const postData = {
        name: this.currentForm.name,
        description: this.currentForm.description,
        params: this.currentForm.params
      };
      const appId = this.currentForm.id;
      editApplication(appId, JSON.stringify(postData)).then(res => {
        if (res.data.code === 0) {
          this.$message.success("仿真应用修改成功！");
          this.editVisible = false;
          this.getAppList();
        }
      });
    },
    remove(k, list) {
      const arr = list;
      arr.splice(arr.findIndex(item => item.id === k.attrId), 1);
    },
    addAttribute(list) {
      list.push({
        name: "",
        type: "",
        attrId: uniqid.time()
      });
      console.log(list);
    }
  }
};
</script>

<style scoped></style>
