#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('🔄 开始安装 panshi-react-generator 技能...');

// 技能内容（直接作为字符串，避免附带多余文件）
const skillContent = "---\nname: panshi-react-generator\ndescription: \"This skill should be used when translating .pen files into React code, ensuring it follows the Panshi route configuration rules (props to page, auth, org rendering, breadcrumbs).\"\ncategory: development\nrisk: safe\n---\n\n# panshi-react-generator\n\n## Purpose\nThis skill dictates the rules for generating React code from `.pen` design files within the project, specifically adhering to the **Panshi framework's static route configuration properties**.\n\n## When to Use This Skill\nThis skill should be used when the user asks to:\n- Generate React code from a `.pen` design file.\n- Convert `.pen` files into React components that need routing configuration over the Panshi platform.\n- The user mentions \"生成react代码\", \"根据 .pen 文件生成代码\", or asks for React components to be configured.\n\n## Tools to use\nYou have access to the Pencil MCP Server. ALWAYS use the following MCP tools to read the .pen design files: \n- `mcp_pencil_batch_get`: Read the node structure of .pen files.\n- `mcp_pencil_get_guidelines`: Get the general guidelines and schemas.\n- `mcp_pencil_get_variables`: Read variable or theme maps.\n\n## Generation Rules & Guidelines\nWhen generating React code, you MUST attach the following static properties to the exported page component based on the context of the page:\n\n### 1. 通用静态属性 (General Component Route Props)\n```javascript\n// Example Page Component\nconst MyPage = () => {\n  return <div>内容</div>;\n};\n\n// 1. menuName (必填): 菜单显示的名称\nMyPage.menuName = \"页面名称\";\n\n// 2. organizationType (选填): 控制页面在哪些组织层级显示 (1: 企业, 2: 项目, 3: 子公司)\nMyPage.organizationType = [1, 2];\n\n// 3. order (选填): 指定菜单渲染顺序\nMyPage.order = 3;\n\n// 4. hideRenderChild (选填): 是否在子级导航中渲染自身\nMyPage.hideRenderChild = true;\n\n// 5. style (选填): 页面容器样式\nMyPage.style = { padding: 0 };\n```\n\n### 2. 面包屑与高级隐藏 (Breadcrumbs and Hiding Props)\nIf the page is a child route or detail route not explicitly in the menu, it might need to hide its menu or breadcrumb.\n- `MyPage.hideMenu = true;` (在菜单组件中隐藏自身，面包屑中也会随之隐藏)\n- `MyPage.hideBreadCrumb = true;` (隐藏面包屑)\n- `MyPage.closeAuthValidation = true;` (开启权限模式下，让页面自行处理权限逻辑，中台不干涉。)\n\n### 3. 按组织架构渲染 (Conditional organization rendering)\n当需要“一套代码、多层级适配”时，通过设置静态属性 `organizationType` 来实现。\n例如，如果只在企业层和项目层显示：\n```javascript\nMyPage.organizationType = [1, 2]; \n```\n\n### 4. 编程式路由跳转带面包屑名称 (Programmatic Routing with Breadcrumbs)\n对于非菜单直接关联的详情页（叶子节点），需要通过跳转时的 `state` 传递 `pathName` 来定义面包屑显示的名称。\n\n```javascript\nimport { useHistory } from 'umi';\n\nconst ListComponent = () => {\n    const history = useHistory();\n\n    const goToDetail = () => {\n        history.push({\n            pathname: '/path/to/detail',\n            state: { pathName: '详情页标题' },\n        });\n    };\n    return <a onClick={goToDetail}>查看详情</a>;\n}\n```\nOr using `<Link>`:\n```javascript\nimport { Link } from 'umi';\n\n<Link to={{\n  pathname: '/path/to/detail',\n  state: { pathName: '详情页标题' },\n}}>查看详情</Link>\n```\n\n### 5. 自己控制路由的权限 (Custom Route Auth Control)\n除了在组件级别配置 `closeAuthValidation` 外，全局路由权限也可以在项目的 `app.ts` 中通过 `patchRoutes` 钩子，结合 `@pms/console` 的 `auth` 模块进行更细粒度的路由权限过滤。在生成代码时，如无需组件级静态拦截，需要提醒用户在 `app.ts` 层配置或默认开启细粒度控制。\n\n## Generation Workflow\n1. Analyze the `.pen` file using `mcp_pencil_batch_get` and related tools.\n2. Determine if the component being extracted acts as a page-level component or a sub-page (e.g., Detail page).\n3. If it is a page component, infer the exact `menuName`, `order`, and basic styling like `style: { padding: 0 }`.\n4. If it's a list page navigating to a detail page, ensure the navigation method (either via `history.push` or `<Link>`) passes `state: { pathName: 'xxx' }`.\n5. Write React UI code reflecting the .pen file design structure using modern React best practices.\n6. Attach the correct static properties (`menuName`, `organizationType`, etc.) to the very bottom of the generated React file right before `export default`.";

// ==================
// 全渠道 IDE 规则注入逻辑
// ==================
const projectDir = process.cwd();

// 1. Antigravity 专属系统级安装
const antigravityDir = path.join(os.homedir(), '.gemini', 'antigravity', 'skills', 'panshi-react-generator');
try {
  if (!fs.existsSync(antigravityDir)) fs.mkdirSync(antigravityDir, { recursive: true });
  fs.writeFileSync(path.join(antigravityDir, 'SKILL.md'), skillContent);
  console.log('✅ [Antigravity/Claude] 全局规则安装成功！');
} catch (e) {
  console.error('⚠️ [Antigravity] 安装跳过，原因：', e.message);
}

// ==============
// 以下为各家 IDE 的项目级配置注入
// ==============

// 【核心 Prompt 提纯】：把前面的 markdown 描述纯粹化
const purePrompt = "\n" + skillContent.split("## Generation Rules & Guidelines")[1] || skillContent;

// 2. 为 Cursor 生成/追加 .cursorrules
const cursorRulePath = path.join(projectDir, '.cursorrules');
try {
  let existingContent = '';
  if (fs.existsSync(cursorRulePath)) {
    existingContent = fs.readFileSync(cursorRulePath, 'utf8');
  }
  
  if (!existingContent.includes('Panshi framework')) {
    const appendText = `\n\n# Panshi React Generator Rules\nWhen converting designs or writing page components, MUST adhere to:\n${purePrompt}`;
    fs.writeFileSync(cursorRulePath, existingContent + appendText);
    console.log('✅ [Cursor] 成功注入组件生成规则至 .cursorrules');
  } else {
    console.log('👍 [Cursor] .cursorrules 规则已处于最新状态！');
  }
} catch(e) {
  console.error('⚠️ [Cursor] 配置注入异常:', e.message);
}

// 3. 为 GitHub Copilot 生成 .github/copilot-instructions.md
const githubDir = path.join(projectDir, '.github');
const copilotRulePath = path.join(githubDir, 'copilot-instructions.md');
try {
  if (!fs.existsSync(githubDir)) fs.mkdirSync(githubDir, { recursive: true });
  
  let existingContent = '';
  if (fs.existsSync(copilotRulePath)) {
    existingContent = fs.readFileSync(copilotRulePath, 'utf8');
  }
  
  if (!existingContent.includes('Panshi framework')) {
    const appendText = `\n\n# Panshi React Generator Rules\nWhen generating React UI components, MUST attach the static properties:\n${purePrompt}`;
    fs.writeFileSync(copilotRulePath, existingContent + appendText);
    console.log('✅ [GitHub Copilot] 成功注入规则至 .github/copilot-instructions.md');
  } else {
    console.log('👍 [GitHub Copilot] 规则已处于最新状态！');
  }
} catch(e) {
  console.error('⚠️ [GitHub Copilot] 配置注入异常:', e.message);
}

// 4. 为 其他一切 AI (Cline / Windsurf / Codeium 等) 生成通用文档
const genericRulePath = path.join(projectDir, 'panshi-code-standard.md');
try {
  fs.writeFileSync(genericRulePath, `# 磐石前端规范\n请所有 AI 代码生成工具在生成前台组件时，严格遵循以下路由附带参数：\n${purePrompt}`);
  console.log('✅ [通用型大模型] 成功抽取通用指导书至当前目录：panshi-code-standard.md');
} catch(e) {}

console.log('\n🚀 磐石发版全宇宙适配助手运行完毕！现在您可以叫公司所有使用任何 IDE 的人尽情差遣 AI 了。');
