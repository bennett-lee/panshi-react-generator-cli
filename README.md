# Panshi React Generator Skill (磐石 React 生成器助手)

`panshi-react-generator-skill` 是一款专为 **Panshi (磐石) 框架**（基于 `@pms/console`）设计的 AI 辅助开发工具。它通过自动化注入开发规则和 AI 技能，让 AI 编程助手（如 Cursor, Windsurf, Cline 等）能够深刻理解磐石框架的业务规范、组件用法及底层架构，从而生成高质量、符合企业标准的 React 代码。

## 🌟 核心特性

- **多 IDE 自动化注入**：支持一键将规则注入到以下环境：
  - **Cursor** (`.cursorrules`)
  - **Trae** (`.traerules`)
  - **Windsurf** (`.windsurfrules`)
  - **Cline** (`.clinerules`)
  - **GitHub Copilot** (`.github/copilot-instructions.md`)
- **聚合版 AI 技能包**：内置三大核心模块，覆盖磐石开发全流程：
  - **Panshi Core Architecture**: 核心架构、Umi 路由、用户上下文、全局 Request 及 Socket 通信规范。
  - **Panshi Pro Components**: 表格 (ProTable)、表单 (ProForm/PageForm)、图表及描述列表的自动映射规则。
  - **Panshi Business Components**: 组织树、选人弹窗及业务附件上传的高级用法。
- **主动组件映射**：AI 会自动根据自然语言意图（如“生成一个表格”）映射到磐石标准的 `Table` 组件，而非标准的 `antd` 表格。

## 🚀 使用指南

无需安装，在你的磐石项目根目录下直接通过 `npx` 运行即可完成 AI 规则的注入与技能安装：

```bash
npx bennett-lee/panshi-react-generator-cli
```

### 运行机制

该工具会自动执行以下操作：

1. **注入/更新 AI 规则**：自动识别项目中的 `.cursorrules`, `.windsurfrules`, `.clinerules` 等文件并注入磐石开发规范。
2. **安装全局 AI 技能**：在本地 Antigravity 环境下注册 `panshi-core-architecture` 等三大核心技能。
3. **生成开发手册**：在项目根目录生成 `panshi-code-standard.md` 作为通用参考手册。

## 📖 规范涵盖内容

### 核心架构规范 (Core Architecture)

- **强制导入策略**：禁止直接从 `antd` 导入，统一使用 `import { PmsComponents } from '@pms/console'`。
- **Umi 路由扩展**：支持 `menuName`, `organizationType`, `order` 等静态属性的自动生成。
- **权限控制**：通过 `hooks.useFunCode` 实现功能点按钮权限。

### 高级组件规范 (Pro Components)

- **ProTable**: 自动处理分页、加载状态及请求回调封装。
- **PageForm**: 严格执行 `formPage = true` 等静态属性要求。
- **Chart**: 统一的 `chartType` 映射逻辑。

### 业务组件规范 (Business Components)

- **选人与组织树**：包含 `CompanyLocal` 的高度强制要求及 `PbsEmployeesModal` 的选人配置。
- **附件系统**：基于 `subSystem` 和 `fileOwnerType` 的文件上传与预览规范。

## 🛠️ 项目结构

```text
.
├── index.js          # CLI 入口与规则注入逻辑
├── package.json      # 项目元数据与可执行文件定义
├── .cursorrules      # (自动生成) Cursor 规则
├── .clinerules       # (自动生成) Cline 规则
└── panshi-code-standard.md  # (自动生成) 磐石前端开发标准手册
```

## ⚖️ 授权协议

[ISC License](LICENSE)
