

# Panshi Framework Rules
When generating code or extracting data within the Panshi framework, MUST adhere to:

--- PANSHI CORE ARCHITECTURE RULES ---
---
name: panshi-core-architecture
description: "This skill defines the core architecture, routing, auto-import mapping, user context, request handling, auth, and socket communication for the Panshi framework (@pms/console)."
category: development
risk: safe
---

# Panshi Framework Rules
When generating code or extracting data within the Panshi framework, MUST adhere to:

## PANSHI CORE ARCHITECTURE RULES

This skill consolidates the core foundational guidelines for building React applications within the Panshi framework (`@pms/console`).

## 1. Components Overview & Import Strategy (CRITICAL)
**CRITICAL RULE:** ALWAYS prioritize the corporate standard `PmsComponents` from `@pms/console`. If a component is NOT available in `PmsComponents`, import it from `antd`. DO NOT import from `@ant-design/pro-components` directly.

\`\`\`javascript
import { request, user, file, server, socket, history, hooks, PmsComponents } from '@pms/console';
// ALWAYS DESTRUCTURE FROM PmsComponents
const { PageContainer, Card, Table, ProForm, ProFormText, Chart, CompanyLocal } = PmsComponents;
\`\`\`

## 2. Umi Routing & Page Generation Rules (详细版)
页面组件需定义静态属性以适配基座（Backbone）导航与权限系统。

\`\`\`javascript
const MyPage = () => { return <div>内容</div>; };

// Routing Props
MyPage.menuName = "页面名称"; // (必须) 侧边栏/面包屑显示的文本
MyPage.organizationType = [1, 2]; // (可选) 适配层级: 1:企业(Group), 2:分公司(Company), 3:项目(Project)
MyPage.order = 3; // 排序权重
MyPage.hideMenu = true; // 是否在侧边栏隐藏
MyPage.hideBreadCrumb = true; // 是否隐藏面包屑
MyPage.closeAuthValidation = true; // 设为 true 则不走全局权限拦截

export default MyPage;
\`\`\`

**面包屑名称动态传递 (API Detail/Edit Pages):**
\`\`\`javascript
// 在跳转时通过 state 携带字段，基座会自动识别并替换面包屑
history.push({ 
  pathname: '/detail', 
  state: { 
    pathName: '项目名称', // 替换路由级面包屑
    formName: '表单名称'  // 替换组件级面包屑
  }
});
\`\`\`

## 3. User & Level Context (`user`)
\`\`\`javascript
const { mid, userName, coId, coName, avatar } = user; 
// 严禁直接依赖 user.type!! 必须使用以下 boolean 标记判断层级逻辑
if (user.company) {}    // 当前处于企业(集团)层级
if (user.subCompany) {} // 当前处于分公司层级
if (user.project) {}    // 当前处于项目层级

// 鉴权判断
if (user.authMap['btn_delete']) {} 
\`\`\`

## 4. API Requests (`request`)
\`\`\`javascript
// 核心：不需要手动添加 Token 或 Content-Type
request.get('/api/users', { params: { id: 1 } });
request.post('/api/users', { data: { name: 'Admin' } });

// 特殊请求类型
// 1. 上传: 必须使用 FormData 且 requestType: 'form'
request.post('/api/upload', formData, { requestType: 'form' });

// 2. 下载/流: 必须指定 responseType: 'blob'
request.get('/api/export', { params, responseType: 'blob' });

// 3. 配置
request.get('/api/slow', { timeout: 10000, skipErrorHandler: true });
\`\`\`

## 5. Hooks for Permissions & Data (`hooks`)
\`\`\`javascript
const { useFunCode, useTableParams } = hooks;

// 按钮级权限 (控制受控组件显隐)
const funAuth = useFunCode({ 'btn_add': { status: false }, 'btn_edit': { status: true } });
{funAuth['btn_add'] && <Button>新增</Button>}

// 页面级表格参数快照 (针对详情页返回时恢复搜索状态)
const [params, setParams] = useTableParams('unique-page-key');
\`\`\`


--- PANSHI PRO COMPONENTS RULES ---
---
name: panshi-pro-components
description: "This skill defines how to use high-level layout, table, form, chart, and description components in the Panshi framework (@pms/console). You should proactively and automatically map generic component requests (like 'table', 'form', 'chart') to these specific Panshi components without the user explicitly naming them."
category: development
risk: safe
---

# panshi-pro-components

## 1. ProTable (`Table`)
**核心特性：** 内置分页、加载、搜索表单、自动高度。

\`\`\`javascript
import { PmsComponents, request } from '@pms/console';
const { Table } = PmsComponents;
import { useRef } from 'react';

const MyList = () => {
  const actionRef = useRef(); // 调用 actionRef.current?.reload() 刷新

  return (
    <Table
      headerTitle="列表标题"
      actionRef={actionRef}
      rowKey="id"
      search={{ labelWidth: 'auto', layout: 'horizontal' }}
      request={async (params, sort, filter) => {
        // params 包含分页 (current, pageSize) 和搜索表单字段
        const res = await request('/api/getList', { params });
        return { data: res.list || [], success: true, total: res.total || 0 };
      }}
      toolBarRender={() => [<Button key="add">新建</Button>]}
      columns={[
         { title: '姓名', dataIndex: 'name', copyable: true },
         { 
           title: '状态', 
           dataIndex: 'status', 
           valueType: 'select', 
           valueEnum: { 0: { text: '停用', status: 'Error' }, 1: { text: '正常', status: 'Success' } } 
         },
         { title: '进度', dataIndex: 'p', valueType: 'progress' },
         { title: '金额', dataIndex: 'm', valueType: 'money' },
         { title: '更新时间', dataIndex: 'time', valueType: 'dateTime', hideInSearch: true },
         { 
           title: '操作', 
           valueType: 'option', 
           render: (text, record) => [<a key="e">编辑</a>] 
         }
      ]}
    />
  );
};
\`\`\`

## 2. Forms (`ProForm`, `PageForm`, `ModalForm`)
- **`ProForm`**: 标准行内/气泡表单。
- **`PageForm`**: **最常用**。占据全页，带底部悬浮操作栏。静态属性 `formPage = true` 必要。
- **`ModalForm` / `DrawerForm`**: 弹窗/抽屉风格。

\`\`\`javascript
const { PageForm, ProFormText, ProFormSelect, ProFormDateRangePicker, ProFormDigit } = PmsComponents;

const MyPageForm = ({ editId }) => (
  <PageForm
    card={true}
    grid={true} // 启用栅格化
    request={async () => {
       if (!editId) return {};
       return await request('/api/detail', { params: { id: editId } }); // 自动填充 name 匹配的字段
    }}
    onFinish={async (values) => {
       await request('/api/save', { method: 'post', data: values });
       return true; // 返回 true 自动关闭(如果是 Modal) 或进入提交态
    }}
  >
    <ProFormText name="title" label="标题" colProps={{ span: 8 }} rules={[{required: true}]} />
    <ProFormSelect 
      name="type" 
      label="类型" 
      colProps={{ span: 8 }} 
      request={async () => [{label: 'A', value: 1}]} 
    />
    <ProFormDateRangePicker name="date" label="有效期" colProps={{ span: 8 }} />
    <ProFormDigit name="count" label="数量" colProps={{ span: 8 }} min={1} />
  </PageForm>
);

MyPageForm.formPage = true; // 关键
\`\`\`

## 3. ProDescriptions (`Descriptions`)
用于展示详情。
\`\`\`javascript
const { ProDescriptions } = PmsComponents;
<ProDescriptions
  title="业务详情"
  column={2}
  request={async () => ({ success: true, data: await request('/api/detail') })}
  columns={[
    { dataIndex: 'name', label: '名称' },
    { dataIndex: 'state', label: '状态', valueType: 'select', valueEnum: { ... } }
  ]}
/>
\`\`\`

## 4. Charts (`Chart`)
\`\`\`javascript
const { Chart } = PmsComponents;
<Chart 
  chartType="DualAxes" // 常用: Line, Column, Bar, Pie, DualAxes
  data={[data1, data2]}
  xField="time"
  yField={['count', 'value']}
  geometryOptions={[{ geometry: 'line' }, { geometry: 'line' }]}
/>
\`\`\`


--- PANSHI BUSINESS COMPONENTS RULES ---
---
name: panshi-business-components
description: "This skill defines the usage of specialized business components like organization tree, member selection, and file uploads in the Panshi framework (@pms/console)."
category: development
risk: safe
---

# panshi-business-components

## 1. Organization & Member Tree (`CompanyLocal`)
**强制规则：** 必须套一层有 `height` 的 `div`。

\`\`\`javascript
import { PmsComponents } from '@pms/console';
const { CompanyLocal } = PmsComponents;

<div style={{ height: 'calc(100vh - 200px)' }}> 
  <CompanyLocal 
    showMember={true}       // 是否加载人员
    multiple={true}         // 多选
    checkStrictly={false}   // 级联选中
    onChange={(keys, nodes) => { 
      // keys: 选中的ID数组, nodes: 选中的节点详情 (包含 type: 1企业, 2分公司, 3项目, 4部门, null/5人员)
      console.log(keys, nodes);
    }} 
  />
</div>
\`\`\`

## 2. Member Selection Modal (`PbsEmployeesModal`)
\`\`\`javascript
const { PbsEmployeesModal } = PmsComponents;

<PbsEmployeesModal
  open={visible}
  title="选择审批人"
  companyProps={{ 
     showMember: true,
     multiple: false,
     // canSelectLevel: [4] // 仅允许选部门
  }} 
  onChange={(keys, nodes) => { /* Handle selection */ }}
  onClose={() => setVisible(false)}
/>
\`\`\`

## 3. File Uploads (`ProFormUpload`)
**上传上下文规则：** `subSystem` (子系统码) 和 `fileOwnerType` (归属码) 决定了文件存储的隔离级别。
- `subSystem`: 0:公共, 1:平台, 2:企业, 3:项目.
- `fileOwnerType`: 0:个人, 1:业务, 2:企业, 3:项目.

\`\`\`javascript
const { ProFormUploadDragger, ProFormUploadButton } = PmsComponents;

// 1. 拖拽上传 (带预览)
<ProFormUploadDragger
  name="files"
  label="上传附件"
  max={5}
  accept=".pdf,.doc,.docx,.png,.jpg"
  subSystem={2} 
  fileOwnerType={2}
  fieldProps={{
    onSuccess: (res) => console.log('上传成功', res)
  }}
/>

// 2. 按钮上传 (简洁版)
<ProFormUploadButton
  name="logo"
  label="上传Logo"
  title="点击上传"
  subSystem={2}
  fileOwnerType={2}
/>
\`\`\`

## 4. File Actions (`file`)
\`\`\`javascript
import { file } from '@pms/console';

// 预览 (弹窗预览图片/PDF)
file.preview('file-uuid');

// 下载
file.download('file-uuid', '文件名.pdf');

// 获取下载链接
const url = file.getUrl('file-uuid');
\`\`\`
