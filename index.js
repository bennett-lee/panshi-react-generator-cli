#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('🔄 开始安装 panshi-react-generator 技能...');

// 技能内容（直接作为字符串，避免附带多余文件）
const skillContent = `---
name: panshi-react-generator
description: "This skill should be used when translating .pen files into React code, ensuring it follows the Panshi route configuration rules (props to page, auth, org rendering, breadcrumbs)."
category: development
risk: safe
---

# panshi-react-generator

## Purpose
This skill dictates the rules for generating React code from \`.pen\` design files within the project, specifically adhering to the **Panshi framework's static route configuration properties**.

## When to Use This Skill
This skill should be used when the user asks to:
- Generate React code from a \`.pen\` design file.
- Convert \`.pen\` files into React components that need routing configuration over the Panshi platform.
- The user mentions "生成react代码", "根据 .pen 文件生成代码", or asks for React components to be configured.

## Generation Rules & Guidelines
When generating React code, you MUST attach the following static properties to the exported page component based on the context of the page:

### 1. 通用静态属性 (General Component Route Props)
\`\`\`javascript
// Example Page Component
const MyPage = () => {
  return <div>内容</div>;
};

// 1. menuName (必填): 菜单显示的名称
MyPage.menuName = "页面名称";

// 2. organizationType (选填): 控制页面在哪些组织层级显示 (1: 企业, 2: 项目, 3: 子公司)
MyPage.organizationType = [1, 2];

// 3. order (选填): 指定菜单渲染顺序
MyPage.order = 3;

// 4. hideRenderChild (选填): 是否在子级导航中渲染自身
MyPage.hideRenderChild = true;

// 5. style (选填): 页面容器样式
MyPage.style = { padding: 0 };
\`\`\`

### 2. 面包屑与高级隐藏 (Breadcrumbs and Hiding Props)
If the page is a child route or detail route not explicitly in the menu, it might need to hide its menu or breadcrumb.
- \`MyPage.hideMenu = true;\` (在菜单组件中隐藏自身，面包屑中也会随之隐藏)
- \`MyPage.hideBreadCrumb = true;\` (隐藏面包屑)
- \`MyPage.closeAuthValidation = true;\` (开启权限模式下，让页面自行处理权限逻辑，中台不干涉。)

### 3. 按组织架构渲染 (Conditional organization rendering)
当需要“一套代码、多层级适配”时，通过设置静态属性 \`organizationType\` 来实现。
例如，如果只在企业层和项目层显示：
\`\`\`javascript
MyPage.organizationType = [1, 2]; 
\`\`\`

### 4. 编程式路由跳转带面包屑名称 (Programmatic Routing with Breadcrumbs)
对于非菜单直接关联的详情页（叶子节点），需要通过跳转时的 \`state\` 传递 \`pathName\` 来定义面包屑显示的名称。

\`\`\`javascript
import { useHistory } from 'umi';

const ListComponent = () => {
    const history = useHistory();

    const goToDetail = () => {
        history.push({
            pathname: '/path/to/detail',
            state: { pathName: '详情页标题' },
        });
    };
    return <a onClick={goToDetail}>查看详情</a>;
}
\`\`\`
Or using \`<Link>\`:
\`\`\`javascript
import { Link } from 'umi';

<Link to={{
  pathname: '/path/to/detail',
  state: { pathName: '详情页标题' },
}}>查看详情</Link>
\`\`\`

### 5. 自己控制路由的权限 (Custom Route Auth Control)
除了在组件级别配置 \`closeAuthValidation\` 外，全局路由权限也可以在项目的 \`app.ts\` 中通过 \`patchRoutes\` 钩子，结合 \`@pms/console\` 的 \`auth\` 模块进行更细粒度的路由权限过滤。在生成代码时，如无需组件级静态拦截，需要提醒用户在 \`app.ts\` 层配置或默认开启细粒度控制。

## Generation Workflow
1. Analyze the \`.pen\` file via Pencil MCP tools.
2. Determine if the component being extracted acts as a page-level component or a sub-page (e.g., Detail page).
3. If it is a page component, infer the exact \`menuName\`, \`order\`, and basic styling like \`style: { padding: 0 }\`.
4. If it's a list page navigating to a detail page, ensure the navigation method (either via \`history.push\` or \`<Link>\`) passes \`state: { pathName: 'xxx' }\`.
5. Attach the correct static properties (\`menuName\`, \`organizationType\`, etc.) to the very bottom of the file right before \`export default\`.
`;

// 目标目录：全局的 gemini antigravity skills 目录
const homeDir = os.homedir();
const targetDir = path.join(homeDir, '.gemini', 'antigravity', 'skills', 'panshi-react-generator');

try {
  // 创建目标目录
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(\`✅ 创建目录: \${targetDir}\`);
  }

  // 写入 SKILL.md  
  const skillPath = path.join(targetDir, 'SKILL.md');
  fs.writeFileSync(skillPath, skillContent);
  console.log(\`✅ 成功写入技能文件: \${skillPath}\`);

  console.log('\\n🚀 安装完成！您的 Antigravity / Gemini 助手现在已经具备 panshi-react-generator 技能。');

} catch (error) {
  console.error('❌ 安装失败:', error.message);
  process.exit(1);
}
