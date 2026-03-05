#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('🔄 开始安装 panshi-react-generator 技能...');

// 技能内容（直接作为字符串，避免附带多余文件）
const skillContent = "---\nname: panshi-react-generator\ndescription: \"This skill should be used when translating .pen files into React code, ensuring it follows the Panshi route configuration rules (props to page, auth, org rendering, breadcrumbs).\"\ncategory: development\nrisk: safe\n---\n\n# panshi-react-generator\n\n## Purpose\nThis skill dictates the rules for generating React code from `.pen` design files within the project, specifically adhering to the **Panshi framework's static route configuration properties**.\n\n## When to Use This Skill\nThis skill should be used when the user asks to:\n- Generate React code from a `.pen` design file.\n- Convert `.pen` files into React components that need routing configuration over the Panshi platform.\n- The user mentions \"生成react代码\", \"根据 .pen 文件生成代码\", or asks for React components to be configured.\n\n## Generation Rules & Guidelines\nWhen generating React code, you MUST attach the following static properties to the exported page component based on the context of the page:\n\n### 1. 通用静态属性 (General Component Route Props)\n```javascript\n// Example Page Component\nconst MyPage = () => {\n  return <div>内容</div>;\n};\n\n// 1. menuName (必填): 菜单显示的名称\nMyPage.menuName = \"页面名称\";\n\n// 2. organizationType (选填): 控制页面在哪些组织层级显示 (1: 企业, 2: 项目, 3: 子公司)\nMyPage.organizationType = [1, 2];\n\n// 3. order (选填): 指定菜单渲染顺序\nMyPage.order = 3;\n\n// 4. hideRenderChild (选填): 是否在子级导航中渲染自身\nMyPage.hideRenderChild = true;\n\n// 5. style (选填): 页面容器样式\nMyPage.style = { padding: 0 };\n```\n\n### 2. 面包屑与高级隐藏 (Breadcrumbs and Hiding Props)\nIf the page is a child route or detail route not explicitly in the menu, it might need to hide its menu or breadcrumb.\n- `MyPage.hideMenu = true;` (在菜单组件中隐藏自身，面包屑中也会随之隐藏)\n- `MyPage.hideBreadCrumb = true;` (隐藏面包屑)\n- `MyPage.closeAuthValidation = true;` (开启权限模式下，让页面自行处理权限逻辑，中台不干涉。)\n\n### 3. 按组织架构渲染 (Conditional organization rendering)\n当需要“一套代码、多层级适配”时，通过设置静态属性 `organizationType` 来实现。\n例如，如果只在企业层和项目层显示：\n```javascript\nMyPage.organizationType = [1, 2]; \n```\n\n### 4. 编程式路由跳转带面包屑名称 (Programmatic Routing with Breadcrumbs)\n对于非菜单直接关联的详情页（叶子节点），需要通过跳转时的 `state` 传递 `pathName` 来定义面包屑显示的名称。\n\n```javascript\nimport { useHistory } from 'umi';\n\nconst ListComponent = () => {\n    const history = useHistory();\n\n    const goToDetail = () => {\n        history.push({\n            pathname: '/path/to/detail',\n            state: { pathName: '详情页标题' },\n        });\n    };\n    return <a onClick={goToDetail}>查看详情</a>;\n}\n```\nOr using `<Link>`:\n```javascript\nimport { Link } from 'umi';\n\n<Link to={{\n  pathname: '/path/to/detail',\n  state: { pathName: '详情页标题' },\n}}>查看详情</Link>\n```\n\n### 5. 自己控制路由的权限 (Custom Route Auth Control)\n除了在组件级别配置 `closeAuthValidation` 外，全局路由权限也可以在项目的 `app.ts` 中通过 `patchRoutes` 钩子，结合 `@pms/console` 的 `auth` 模块进行更细粒度的路由权限过滤。在生成代码时，如无需组件级静态拦截，需要提醒用户在 `app.ts` 层配置或默认开启细粒度控制。\n\n## Generation Workflow\n1. Analyze the `.pen` file via Pencil MCP tools.\n2. Determine if the component being extracted acts as a page-level component or a sub-page (e.g., Detail page).\n3. If it is a page component, infer the exact `menuName`, `order`, and basic styling like `style: { padding: 0 }`.\n4. If it's a list page navigating to a detail page, ensure the navigation method (either via `history.push` or `<Link>`) passes `state: { pathName: 'xxx' }`.\n5. Attach the correct static properties (`menuName`, `organizationType`, etc.) to the very bottom of the file right before `export default`.";

// 目标目录：全局的 gemini antigravity skills 目录
const homeDir = os.homedir();
const targetDir = path.join(homeDir, '.gemini', 'antigravity', 'skills', 'panshi-react-generator');

try {
  // 创建目标目录
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 写入 SKILL.md  
  const skillPath = path.join(targetDir, 'SKILL.md');
  fs.writeFileSync(skillPath, skillContent);
  console.log('✅ 成功写入技能文件');

  console.log('\n🚀 安装完成！您的 Antigravity / Gemini 助手现在已经具备 panshi-react-generator 技能。');

} catch (error) {
  console.error('❌ 安装失败:', error.message);
  process.exit(1);
}
