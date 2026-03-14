# Panshi React Generator CLI

`panshi-react-generator-cli` 用来把磐石前端规则稳定地注入到常见 AI IDE 配置文件里，并为 Gemini Antigravity 安装 1 个对外入口 skill 和 3 个内部子 skill。

## 它实际做什么

- 给项目内的 `.cursorrules`、`.clinerules`、`.windsurfrules`、`.traerules`、`CLAUDE.md`、`AGENTS.md` 和 `.github/copilot-instructions.md` 写入一个受管规则区块。
- 在 `~/.gemini/antigravity/skills/` 下安装：
  - 对外入口：`panshi`
  - 内部子 skill：`panshi-core-architecture`
  - 内部子 skill：`panshi-pro-components`
  - 内部子 skill：`panshi-business-components`
- 在用户选择 `standard` 时，额外生成 `panshi-code-standard.md`。

说明：
- Gemini Antigravity 会拿到真正的 `SKILL.md` 文件。
- 日常使用时只需要记住 `panshi` 这个入口 skill。
- Cursor、Cline、Windsurf、Trae、GitHub Copilot 这几类环境拿到的是规则文本，不是原生 skill 安装。

## 规则内容

`panshi` 会继续分发到 3 类内部场景：

1. 核心架构：`@pms/console` 导入策略、页面静态属性、`request`、权限 hooks、socket 清理。
2. 高级组件：`Table`、`PageForm`、`ProForm`、`ProDescriptions`、`Chart` 的推荐用法。
3. 业务组件：`CompanyLocal`、`PbsEmployeesModal`、上传组件以及 `file` API。

## 使用方式

在磐石项目根目录执行：

```bash
npx git+http://gitlab.pinming.org/group-zhgd-front/zhgd-web-skills.git
```

现在默认不会再把所有 IDE 规则都装一遍。

- 在交互终端里执行时，CLI 会提示你选择要安装的 IDE/目标。
- 在非交互环境里执行时，必须显式传 `--targets=...`。

例如：

```bash
npx git+http://gitlab.pinming.org/group-zhgd-front/zhgd-web-skills.git --targets=gemini,cursor
```

```bash
npx git+http://gitlab.pinming.org/group-zhgd-front/zhgd-web-skills.git --targets=cline
```

```bash
npx git+http://gitlab.pinming.org/group-zhgd-front/zhgd-web-skills.git --targets=claude,codex,standard
```

支持的 target 值：

- `gemini`
- `cursor`
- `windsurf`
- `cline`
- `trae`
- `claude`
- `codex`
- `copilot`
- `standard`

CLI 会只更新你选中的目标；如果文件里已有自定义内容，受管区块外的内容会尽量保留。

补充说明：

- 未选择 `copilot` 时，不会新建 `.github/`。
- 如果项目里残留了旧版本生成的受管 `copilot-instructions.md`，CLI 会自动清理它。
- 只有在 `.github/` 因此变空时，才会顺带移除空目录；用户自己的 `.github` 文件不会被删。

受管区块标记如下：

```html
<!-- PANSHI:BEGIN -->
...
<!-- PANSHI:END -->
```

## 提示词建议

- 直接描述业务目标，例如“做一个项目列表页，接口是 `/api/project/list`”。
- 如果你在 Gemini Antigravity 里显式提 skill 名，只需要提 `panshi`。
- 如果你希望覆盖默认映射，请明确说出来，例如“这里不要 `PageForm`，用普通 `ProForm` 内嵌到详情页里”。
- 页面静态属性统一使用 `menuName`，不要写成 `MenuName`。

## 本地开发

根据需要在临时目录里手动运行 CLI 做验证即可，例如：

```bash
npx git+http://gitlab.pinming.org/group-zhgd-front/zhgd-web-skills.git --targets=claude,codex,standard
```
