# 磐石 AI 规则使用说明

这份说明文档描述的是这套 CLI 注入后的实际行为，而不是理想化的“全平台原生 skill”状态。

## 现在有哪些能力

注入完成后，会有两类能力来源：

1. Gemini Antigravity
   - 安装 1 个对外入口 skill：`panshi`
   - 同时安装 3 个内部子 skill：`panshi-core-architecture`、`panshi-pro-components`、`panshi-business-components`
2. 其他 AI IDE
   - 通过规则文件读取同一套受管规则区块
   - 不保证这些 IDE 具备“skill 发现”和“skill 触发”的原生机制

## 安装时怎么选 IDE

现在安装器不会默认把所有 IDE 类型都写一遍。

- 在交互终端里运行时，会提示你选择要安装的目标
- 在非交互环境里运行时，需要显式传 `--targets=...`

例如：

```bash
npx bennett-lee/panshi-react-generator-cli --targets=gemini,cursor
```

```bash
npx bennett-lee/panshi-react-generator-cli --targets=cline
```

支持的目标值：

- `gemini`
- `cursor`
- `windsurf`
- `cline`
- `trae`
- `claude`
- `codex`
- `copilot`
- `standard`

补充说明：

- `claude` 会写入项目根目录的 `CLAUDE.md`
- `codex` 会写入项目根目录的 `AGENTS.md`
- `standard` 会生成 `panshi-code-standard.md`
- 如果这次没有选择 `copilot`，安装器不会创建新的 `.github/`
- 对旧版本遗留的受管 `copilot-instructions.md`，安装器会自动清理；用户自己的 `.github` 内容会保留

## 你只需要记住哪个 skill

默认只需要记住 `panshi`。

它是总入口，会在内部把问题分发到：

- 架构类规则
- 通用组件类规则
- 业务组件类规则

除非你在调试 skill 本身，否则不需要手动点名 3 个子 skill。

## 推荐怎么提需求

你可以直接说业务目标，不需要把底层导入和组件名写得很细：

```text
新建一个项目列表页，接口是 /api/project/list。
列表要支持关键字、项目状态、创建时间筛选。
```

```text
做一个任务编辑页，详情接口是 /api/task/detail，保存接口是 /api/task/save。
这个页面是路由级全页表单。
```

```text
在这个页面里加选人弹窗和附件上传，上传归属按企业级处理。
```

## 默认映射规则

如果提示词里没有额外说明，`panshi` 会倾向于：

- 表格场景优先映射到 `PmsComponents.Table`
- 路由级全页表单优先映射到 `PageForm`
- 普通内嵌表单优先映射到 `ProForm`
- 组织树优先映射到 `CompanyLocal`
- 选人弹窗优先映射到 `PbsEmployeesModal`
- 文件上传要求显式传入 `subSystem` 和 `fileOwnerType`

## 几个容易写错的点

1. 页面静态属性是 `menuName`，不是 `MenuName`。
2. 规则要求优先从 `@pms/console` 取 `PmsComponents`，缺失时再从 `antd` 导入。
3. 这套规则不会自动判断你“必须”用 `PageForm`；只有在路由级全页表单场景下才推荐设置 `formPage = true`。
4. 规则文档里引用的内容都来自当前生成器，不依赖额外的 `panshi-console-components-overview` 之类外部条目。

## 想覆盖默认规则时怎么说

直接在提示里把偏好说清楚：

```text
这里不要 PageForm，用普通 ProForm 嵌到详情卡片里。
```

```text
这个按钮权限先不要接 useFunCode，保留成普通按钮。
```

```text
图表只需要静态展示，不接接口。
```

这样做比让模型猜测“是不是要套磐石默认方案”更稳定。
