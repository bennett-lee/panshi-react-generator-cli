#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

const MANAGED_BLOCK_START = '<!-- PANSHI:BEGIN -->';
const MANAGED_BLOCK_END = '<!-- PANSHI:END -->';
const LEGACY_HEADER = '# Panshi Framework Rules';
const TARGET_DEFINITIONS = [
  { id: 'gemini', label: 'Gemini Antigravity', installType: 'skill' },
  { id: 'cursor', label: 'Cursor', installType: 'rule', relativePath: '.cursorrules' },
  { id: 'windsurf', label: 'Windsurf', installType: 'rule', relativePath: '.windsurfrules' },
  { id: 'cline', label: 'Cline', installType: 'rule', relativePath: '.clinerules' },
  { id: 'trae', label: 'Trae', installType: 'rule', relativePath: '.traerules' },
  { id: 'claude', label: 'Claude Code', installType: 'rule', relativePath: 'CLAUDE.md' },
  { id: 'codex', label: 'OpenAI Codex', installType: 'rule', relativePath: 'AGENTS.md' },
  {
    id: 'copilot',
    label: 'GitHub Copilot',
    installType: 'rule',
    relativePath: path.join('.github', 'copilot-instructions.md'),
  },
  { id: 'standard', label: 'Panshi Code Standard', installType: 'doc' },
];
const TARGET_ALIASES = {
  github: 'copilot',
  'github-copilot': 'copilot',
  anthropic: 'claude',
  'claude-code': 'claude',
  openai: 'codex',
  agents: 'codex',
};

function joinLines(lines) {
  return lines.join('\n');
}

function printUsage() {
  console.log('用法:');
  console.log('  panshi-react-generator --targets=gemini,cursor');
  console.log('  panshi-react-generator --targets=cline');
  console.log('  panshi-react-generator --targets=claude,codex,standard');
  console.log('');
  console.log('支持的 targets:');
  for (const target of TARGET_DEFINITIONS) {
    console.log(`  - ${target.id}`);
  }
}

function normalizeTargetName(value) {
  const normalized = value.trim().toLowerCase();
  return TARGET_ALIASES[normalized] || normalized;
}

function parseTargetsList(rawValue) {
  const selected = [];

  for (const item of rawValue.split(',')) {
    const normalized = normalizeTargetName(item);
    if (!normalized) {
      continue;
    }
    if (!TARGET_DEFINITIONS.some((target) => target.id === normalized)) {
      throw new Error(`Unsupported IDE target: ${item.trim()}`);
    }
    if (!selected.includes(normalized)) {
      selected.push(normalized);
    }
  }

  if (selected.length === 0) {
    throw new Error('No IDE targets were provided.');
  }

  return selected;
}

function parseCliOptions(argv) {
  const args = [...argv];
  let rawTargets = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--help' || arg === '-h') {
      return { help: true };
    }

    if (arg.startsWith('--targets=')) {
      rawTargets = arg.slice('--targets='.length);
      continue;
    }

    if (arg === '--targets' || arg === '-t') {
      rawTargets = args[index + 1];
      index += 1;
    }
  }

  return { help: false, rawTargets };
}

function askQuestion(promptText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function promptForTargets() {
  console.log('请选择需要安装规则或 skill 的 IDE/目标，支持多选。');
  TARGET_DEFINITIONS.forEach((target, index) => {
    console.log(`  ${index + 1}. ${target.label} (${target.id})`);
  });

  while (true) {
    const answer = await askQuestion('请输入编号或 id，多个值用逗号分隔: ');
    const normalizedAnswer = answer
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = Number(item);
        if (!Number.isNaN(index) && index >= 1 && index <= TARGET_DEFINITIONS.length) {
          return TARGET_DEFINITIONS[index - 1].id;
        }
        return item;
      })
      .join(',');

    try {
      return parseTargetsList(normalizedAnswer);
    } catch (error) {
      console.log(`输入无效: ${error.message}`);
    }
  }
}

async function resolveSelectedTargets(argv) {
  const options = parseCliOptions(argv);

  if (options.help) {
    printUsage();
    return null;
  }

  if (options.rawTargets) {
    return parseTargetsList(options.rawTargets);
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      'No IDE targets were provided. Re-run with --targets=gemini,cursor or use an interactive terminal to choose.'
    );
  }

  return promptForTargets();
}

const childSkills = [
  {
    name: 'panshi-core-architecture',
    title: 'Panshi Core Architecture',
    description:
      'Use when generating or reviewing React pages in projects built on @pms/console with routing, request, auth, or socket concerns',
    guide: joinLines([
      '## When to Use',
      '- 页面基于 `@pms/console`，并且涉及路由、权限、请求、用户上下文或 socket。',
      '- 需要决定页面静态属性、通用导入策略或全局能力接入方式。',
      '',
      '## Rules',
      '1. 优先从 `@pms/console` 导入 `request`、`hooks`、`history`、`socket`、`user` 和 `PmsComponents`。',
      '2. 组件优先从 `PmsComponents` 取；只有缺失时才从 `antd` 导入，避免直连 `@ant-design/pro-components`。',
      '3. 页面标题静态属性统一使用 `menuName`。只有在页面确实需要时再补 `organizationType`、`order`、`hideMenu` 等扩展字段。',
      '4. 网络请求统一走 `request`，不要在页面里手写 token、拦截器或重复封装。',
      '5. 权限按钮优先用 `hooks.useFunCode`，socket 监听必须在 `useEffect` 清理函数里解绑。',
      '',
      '## Example',
      '```javascript',
      "import { history, hooks, request, socket, user, PmsComponents } from '@pms/console';",
      "import { Button } from 'antd';",
      '',
      'const { Table } = PmsComponents;',
      'const { useFunCode } = hooks;',
      '',
      'const ProjectList = () => {',
      "  const funAuth = useFunCode({ btn_delete: { status: false } });",
      '',
      '  useEffect(() => {',
      "    const unlisten = socket.listen('update_location', () => {});",
      '    return () => unlisten?.();',
      '  }, []);',
      '',
      '  return funAuth.btn_delete ? <Button danger>删除</Button> : null;',
      '};',
      '',
      "ProjectList.menuName = '项目列表';",
      '```',
    ]),
  },
  {
    name: 'panshi-pro-components',
    title: 'Panshi Pro Components',
    description:
      'Use when the request involves tables, forms, descriptions, or charts in a Panshi project built on @pms/console',
    guide: joinLines([
      '## When to Use',
      '- 需求里出现表格、搜索表单、全页表单、详情展示或图表。',
      '- 需要把自然语言里的“表格”“表单”“图表”映射成磐石标准组件。',
      '',
      '## Rules',
      '1. 列表页优先使用 `PmsComponents.Table`，通过 `request` 返回 `{ data, success, total }`。',
      '2. 路由级全页表单优先用 `PageForm`，并且只在这种页面上设置 `formPage = true`。',
      '3. 普通内嵌表单用 `ProForm`，弹窗或抽屉场景再选 `ModalForm` 或 `DrawerForm`。',
      '4. 详情展示使用 `ProDescriptions`，图表统一走 `Chart`。',
      '',
      '## Example',
      '```javascript',
      "import { PmsComponents, request } from '@pms/console';",
      "import { Button } from 'antd';",
      "import { useRef } from 'react';",
      '',
      'const { Table, PageForm, ProFormText } = PmsComponents;',
      '',
      'const ProjectList = () => {',
      '  const actionRef = useRef();',
      '',
      '  return (',
      '    <Table',
      '      actionRef={actionRef}',
      '      rowKey="id"',
      '      request={async (params) => {',
      "        const res = await request('/api/project/list', { params });",
      '        return { data: res.list || [], success: true, total: res.total || 0 };',
      '      }}',
      '      toolBarRender={() => [<Button key="create">新建</Button>]}',
      '    />',
      '  );',
      '};',
      '',
      'const ProjectFormPage = () => (',
      '  <PageForm onFinish={async (values) => request.post(\'/api/project/save\', { data: values })}>',
      '    <ProFormText name="title" label="标题" rules={[{ required: true }]} />',
      '  </PageForm>',
      ');',
      '',
      'ProjectFormPage.formPage = true;',
      '```',
    ]),
  },
  {
    name: 'panshi-business-components',
    title: 'Panshi Business Components',
    description:
      'Use when the request involves organization trees, member pickers, or file uploads in a Panshi project built on @pms/console',
    guide: joinLines([
      '## When to Use',
      '- 页面里有组织树、选人弹窗、附件上传、文件预览或下载。',
      '- 需要决定 `subSystem`、`fileOwnerType` 这类业务隔离参数。',
      '',
      '## Rules',
      '1. `CompanyLocal` 外层必须提供明确高度容器，避免树组件白屏或塌陷。',
      '2. 选人弹窗优先用 `PbsEmployeesModal`，通过 `companyProps` 限制可选层级和是否显示成员。',
      '3. 上传组件统一显式传入 `subSystem` 和 `fileOwnerType`，不要写模糊的默认值。',
      '4. 文件预览、下载和直链获取统一走 `file.preview`、`file.download`、`file.getUrl`。',
      '',
      '## Example',
      '```javascript',
      "import { file, PmsComponents } from '@pms/console';",
      '',
      'const { CompanyLocal, PbsEmployeesModal, ProFormUploadDragger } = PmsComponents;',
      '',
      '<div style={{ height: \'calc(100vh - 200px)\' }}>',
      '  <CompanyLocal showMember multiple />',
      '</div>;',
      '',
      '<PbsEmployeesModal',
      '  open={visible}',
      '  companyProps={{ showMember: true, multiple: false }}',
      '  onClose={() => setVisible(false)}',
      '/>;',
      '',
      '<ProFormUploadDragger',
      '  name="files"',
      '  subSystem={2}',
      '  fileOwnerType={2}',
      '/>;',
      '',
      "file.preview('file-uuid');",
      '```',
    ]),
  },
];

const rootSkill = {
  name: 'panshi',
  title: 'Panshi',
  description:
    'Use when working in a Panshi React project built on @pms/console and you want the single entry skill before choosing detailed guidance',
  guide: joinLines([
    '## When to Use',
    '- 只要当前项目是基于 `@pms/console` 的磐石前端项目，就先从这个总 skill 进入。',
    '- 当你只想记住一个 skill 名称，而不想手动判断该先读架构、通用组件还是业务组件规则时，也先读这里。',
    '',
    '## How It Delegates',
    '1. 路由、页面静态属性、`request`、权限、socket 相关问题，继续读取 `panshi-core-architecture`。',
    '2. 表格、表单、详情和图表相关问题，继续读取 `panshi-pro-components`。',
    '3. 组织树、选人弹窗、附件上传和文件操作相关问题，继续读取 `panshi-business-components`。',
    '',
    '## External Entry',
    '- 对外统一入口只暴露 `panshi`。',
    '- 这 3 个子 skill 视为内部拆分，用来降低单个 skill 体积并提高命中准确度。',
  ]),
};

function buildSkillFile(skill) {
  return joinLines([
    '---',
    `name: ${skill.name}`,
    `description: ${skill.description}`,
    '---',
    '',
    `# ${skill.title}`,
    '',
    skill.guide.trim(),
    '',
  ]);
}

function buildManagedBlock() {
  const sections = [];

  sections.push('## Entry Skill');
  sections.push('');
  sections.push('对外统一入口 skill：`panshi`。');
  sections.push('当任务进入磐石项目时，优先使用这个入口，再按场景进入内部规则。');
  sections.push('');
  sections.push('内部拆分：');
  sections.push('- 架构类问题对应 `panshi-core-architecture`');
  sections.push('- 表格/表单/图表类问题对应 `panshi-pro-components`');
  sections.push('- 业务组件类问题对应 `panshi-business-components`');
  sections.push('');

  for (const skill of childSkills) {
    sections.push(`## ${skill.title}`);
    sections.push('');
    sections.push(skill.guide.trim());
    sections.push('');
  }

  return joinLines([
    MANAGED_BLOCK_START,
    LEGACY_HEADER,
    'When generating or reviewing code in a Panshi project, follow these managed rules.',
    '',
    ...sections,
    MANAGED_BLOCK_END,
    '',
  ]);
}

function upsertManagedBlock(existingContent, blockContent) {
  const content = existingContent.replace(/\r\n/g, '\n');
  const startIndex = content.indexOf(MANAGED_BLOCK_START);
  const endIndex = content.indexOf(MANAGED_BLOCK_END);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const before = content.slice(0, startIndex).trimEnd();
    const after = content.slice(endIndex + MANAGED_BLOCK_END.length).trimStart();
    const parts = [];

    if (before) {
      parts.push(before);
    }
    parts.push(blockContent.trimEnd());
    if (after) {
      parts.push(after);
    }

    return `${parts.join('\n\n')}\n`;
  }

  const legacyIndex = content.indexOf(LEGACY_HEADER);

  if (legacyIndex !== -1) {
    const before = content.slice(0, legacyIndex).trimEnd();
    return before ? `${before}\n\n${blockContent}` : blockContent;
  }

  const trimmed = content.trimEnd();
  return trimmed ? `${trimmed}\n\n${blockContent}` : blockContent;
}

function removeManagedBlock(existingContent) {
  const content = existingContent.replace(/\r\n/g, '\n');
  const startIndex = content.indexOf(MANAGED_BLOCK_START);
  const endIndex = content.indexOf(MANAGED_BLOCK_END);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const before = content.slice(0, startIndex).trimEnd();
    const after = content.slice(endIndex + MANAGED_BLOCK_END.length).trimStart();
    const parts = [];

    if (before) {
      parts.push(before);
    }
    if (after) {
      parts.push(after);
    }

    return parts.length > 0 ? `${parts.join('\n\n')}\n` : '';
  }

  const legacyIndex = content.indexOf(LEGACY_HEADER);

  if (legacyIndex !== -1) {
    const before = content.slice(0, legacyIndex).trimEnd();
    return before ? `${before}\n` : '';
  }

  return content;
}

function writeSkillFiles(homeDir) {
  const skillsRoot = path.join(homeDir, '.gemini', 'antigravity', 'skills');

  const allSkills = [rootSkill, ...childSkills];

  for (const skill of allSkills) {
    const skillDir = path.join(skillsRoot, skill.name);
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), buildSkillFile(skill), 'utf8');
  }
}

function injectRule(filePath, targetName, blockContent) {
  try {
    const existingContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    const nextContent = upsertManagedBlock(existingContent, blockContent);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, nextContent, 'utf8');
    console.log(`✅ [${targetName}] 已更新受管规则块`);
  } catch (error) {
    console.error(`⚠️ [${targetName}] 配置注入异常:`, error.message);
  }
}

function tryRemoveDirectoryIfEmpty(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  if (fs.readdirSync(dirPath).length === 0) {
    fs.rmdirSync(dirPath);
  }
}

function cleanupCopilotRule(projectDir) {
  const filePath = path.join(projectDir, '.github', 'copilot-instructions.md');

  if (!fs.existsSync(filePath)) {
    return;
  }

  const existingContent = fs.readFileSync(filePath, 'utf8');
  const nextContent = removeManagedBlock(existingContent).trim();

  if (nextContent) {
    fs.writeFileSync(filePath, `${nextContent}\n`, 'utf8');
    return;
  }

  fs.unlinkSync(filePath);
  tryRemoveDirectoryIfEmpty(path.dirname(filePath));
  console.log('✅ [GitHub Copilot] 未选中，已清理受管 copilot 规则文件');
}

function writeCodeStandard(projectDir, blockContent) {
  const codeStandard = joinLines([
    '# 磐石前端规范',
    '',
    '以下内容由 CLI 自动生成，和各 IDE 规则文件中的受管区块保持一致。',
    '',
    blockContent.trim(),
    '',
  ]);

  fs.writeFileSync(path.join(projectDir, 'panshi-code-standard.md'), codeStandard, 'utf8');
  console.log('✅ [通用参考] 已生成 panshi-code-standard.md');
}

async function main() {
  console.log('🔄 开始安装 Panshi Framework AI 规则...');

  const projectDir = process.cwd();
  const homeDir = os.homedir();
  const blockContent = buildManagedBlock();
  const selectedTargets = await resolveSelectedTargets(process.argv.slice(2));

  if (!selectedTargets) {
    return;
  }

  const selectedSet = new Set(selectedTargets);

  if (selectedSet.has('gemini')) {
    try {
      writeSkillFiles(homeDir);
      console.log('✅ [Gemini Antigravity] 已安装 1 个入口 skill 和 3 个内部子 skill');
    } catch (error) {
      console.error('⚠️ [Gemini Antigravity] 技能安装失败:', error.message);
    }
  }

  for (const target of TARGET_DEFINITIONS) {
    if (target.installType !== 'rule' || !selectedSet.has(target.id)) {
      continue;
    }
    injectRule(path.join(projectDir, target.relativePath), target.label, blockContent);
  }

  if (!selectedSet.has('copilot')) {
    cleanupCopilotRule(projectDir);
  }

  if (selectedSet.has('standard')) {
    writeCodeStandard(projectDir, blockContent);
  }

  console.log('\n🚀 磐石规则与技能已完成更新。');
}

main().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exitCode = 1;
});
