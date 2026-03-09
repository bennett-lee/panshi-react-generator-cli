# 磐石前端规范 (Panshi Code Standard - 聚合版)

遇到需求时自动使用以下三大规范模块：

--- PANSHI CORE ARCHITECTURE RULES ---

This skill consolidates the core foundational guidelines for building React applications within the Panshi framework (`@pms/console`).

## 1. Components Overview & Import Strategy (CRITICAL)
**CRITICAL RULE:** DO NOT manually import from `antd`, `@ant-design/pro-components`, or other open-source libs for major UI components. Always use the corporate standard `PmsComponents`.

\`\`\`javascript
import { request, user, file, server, socket, history, hooks, PmsComponents } from '@pms/console';
// ALWAYS DESTRUCTURE FROM PmsComponents
const { PageContainer, Card, Table, ProForm, ProFormText, Chart, CompanyLocal } = PmsComponents;
\`\`\`

## 2. Umi Routing & Page Generation Rules
When creating page components, automatically identify Umi routing scenarios and attach static properties.

\`\`\`javascript
const MyPage = () => { return <div>内容</div>; };

// Routing Props
MyPage.menuName = "页面名称"; // (Required) Menu Name
MyPage.organizationType = [1, 2]; // (Optional) Level Filter: 1:Enterprise, 2:Project, 3:SubCompany
MyPage.order = 3; 
MyPage.hideMenu = true; // Hides from menu
MyPage.hideBreadCrumb = true; // Hides breadcrumb
MyPage.closeAuthValidation = true; // Exclude from global auth interception

export default MyPage;
\`\`\`
**Dynamic Breadcrumbs via history state:**
\`\`\`javascript
history.push({ pathname: '/detail', state: { pathName: '详情名称', formName: '表单名称' }});
\`\`\`

## 3. User & Level Context (`user`)
\`\`\`javascript
const { mid, userName, coId, coName, organizationName } = user; 
// CRITICAL: NEVER strictly rely on user.type. Use the boolean flags:
if (user.company) {} // At Enterprise Level
if (user.subCompany) {} // At SubCompany Level
if (user.project) {} // At Project Level
\`\`\`

## 4. API Requests (`request`)
\`\`\`javascript
// Standard requests
request.get('/api/users', { params: { id: 1 } });
request.post('/api/users', { data: { name: 'Admin' } });

// Uploads MUST use FormData and requestType: 'form' (No manual headers)
request.post('/api/upload', formData, { requestType: 'form' });

// Downloads MUST use responseType: 'blob'
request.get('/api/export', { params, responseType: 'blob' });
\`\`\`

## 5. Hooks for Permissions (`hooks`)
Button/Functional Auth (Conditional Rendering)
\`\`\`javascript
const { useFunCode } = hooks;
const funAuth = useFunCode({ 'btn_add': { status: false } });
{funAuth['btn_add'] && <Button>新增</Button>}
\`\`\`

## 6. Realtime Communication (`socket`)
\`\`\`javascript
// Component Mount
const socketGroup = socket.createGroup({ group: 'custom-topic', itype: 'my_event' });
const stopListen = socket.listen((msg) => { if (msg.itype === 'my_event') console.log(msg.payload); });

// Component Unmount (CRITICAL: MUST CLEANUP TO PREVENT LEAKS)
return () => { stopListen(); socketGroup.logout(); };
\`\`\`


--- PANSHI PRO COMPONENTS RULES ---

Consolidated guide for data display (Table, Descriptions, Chart) and data entry (ProForm, PageForm) using `PmsComponents` in the Panshi framework. 
**PROACTIVE MAPPING RULE:** If the user asks for a "table", automatically use `Table` (ProTable). If they ask for a "form", automatically use `ProForm` or `PageForm`. Do not wait for the user to explicitly specify the exact component name.

## 1. ProTable (`Table`)
Panshi `Table` manages pagination and loading automatically using `request`.

\`\`\`javascript
import { PmsComponents, request } from '@pms/console';
const { Table } = PmsComponents;
import { useRef } from 'react';

const MyList = () => {
  const actionRef = useRef(); // Use actionRef.current?.reload() to refresh data

  return (
    <Table
      actionRef={actionRef}
      request={async (params) => {
        const res = await request('/api/getList', { method: 'get', params });
        // Must return this exact structure
        return { data: res.list || [], success: true, total: res.total || 0 };
      }}
      rowKey="id"
      columns={[
         { title: '状态', dataIndex: 'status', valueType: 'select', valueEnum: { 'all': {text: '全部'} } },
         { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime' }
      ]}
    />
  );
};
\`\`\`

## 2. ProForm & PageForm
- **`ProForm`**: Wraps form items, auto-handles initial data via `request`, and auto-handles loading state via `onFinish`.
- **`PageForm`**: A full-page version of ProForm. **MUST** add static prop `formPage = true` to the exported component container.

\`\`\`javascript
const { PageForm, ProForm, ProFormText } = PmsComponents;

const MyPageForm = ({ editId }) => {
  return (
    <PageForm
      card={true}
      request={async () => {
         if (!editId) return {};
         return await request('/api/detail', { params: { id: editId } }); // Auto fills fields
      }}
      onFinish={async (values) => {
         await request('/api/save', { method: 'post', data: values });
         return true;
      }}
    >
      <ProFormText name="title" label="标题" rules={[{required: true}]} />
    </PageForm>
  );
};

// CRITICAL for PageForm
MyPageForm.formPage = true; 
MyPageForm.hideMenuComponent = true;
\`\`\`

## 3. ProDescriptions
Displays read-only items (local or remote).
\`\`\`javascript
const { ProDescriptions } = PmsComponents;
<ProDescriptions
  title="详情"
  request={async () => ({ success: true, data: await request('/api/detail') })}
  columns={[
    { dataIndex: 'username', label: '名称' },
    { dataIndex: 'price', label: '金额', valueType: 'money' }
  ]}
/>
\`\`\`

## 4. ProChart (`Chart`)
Unified chart container mapping.
\`\`\`javascript
const { Chart } = PmsComponents;
<Chart 
  chartType="Line" // Or 'Column', 'Bar', 'Pie', 'DualAxes'
  data={dataArray}
  xField="year"
  yField="value"
  seriesField="category"
/>
// DualAxes: yField=['val1', 'count1'] 
\`\`\`


--- PANSHI BUSINESS COMPONENTS RULES ---

Consolidated guide for `CompanyLocal`, `PbsEmployeesModal`, and upload components imported from `PmsComponents` in `@pms/console`.
**PROACTIVE MAPPING RULE:** Automatically map natural language requests to these specialized business components. For example: If the user asks for "选人组件", "人员树", or "选人弹窗", use `PbsEmployeesModal`. If they ask for "组织树" or "部门树", use `CompanyLocal`. If they ask for "文件上传" or "拖拽上传", use `ProFormUploadDragger` / `ProFormUploadButton`. Do not expect the user to type these exact technical terms.

## 1. Organization Tree & Member Tree (`CompanyLocal` & `PbsEmployeesModal`)

**CRITICAL LAYOUT RULE**: `CompanyLocal` MUST be wrapped in a container that has a defined `height`, otherwise it won't render.

### Normal Org Tree
\`\`\`javascript
import { PmsComponents } from '@pms/console';
const { CompanyLocal, PbsEmployeesModal } = PmsComponents;

<div style={{ height: 400 }}> {/* Height is MANDATORY */}
  <CompanyLocal onChange={(keys, nodes) => console.log(keys)} />
</div>
\`\`\`

### Member Selection Modal
\`\`\`javascript
<PbsEmployeesModal
  open={visible}
  title="选择员工"
  companyProps={{ showMember: true }} // Tells the inner tree to load members
  onChange={(keys, nodes) => { /* Handle selection */ }}
  onClose={() => setVisible(false)}
/>
\`\`\`

## 2. File Uploads & File Preview
File owner constraints are defined using `subSystem` and `fileOwnerType` instead of arbitrary bizTypes.

\`\`\`javascript
import { PmsComponents, file } from '@pms/console';
const { ProFormUploadDragger, ProFormUploadButton } = PmsComponents;

// In a Form:
<ProFormUploadDragger
  name="attachments"
  label="附件"
  subSystem={2}       // 2 = Internal Company Business
  fileOwnerType={2}   // 2 = Enterprise Level
  fieldProps={{
    onSuccess: (val) => { console.log("Uploaded File Details", val); }
  }}
/>

// Trigger API Preview manually:
// file.preview(file_uuid);
\`\`\`
