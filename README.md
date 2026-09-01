# 写给另一颗星

一个以星空和时间线为视觉线索的互动信件网站。读者会依次经过今夜、分别后的第一周、第二个星期、第三个星期与未来，并在结尾选择不同走向。

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm install
npm run dev
```

终端会显示本地访问地址。其他常用命令：

- `npm run build`：生成生产版本。
- `npm test`：构建并运行项目检查。
- `npm run lint`：检查 TypeScript、React 和无障碍规则。

## 项目结构

- `app/page.tsx`：场景、互动和转场逻辑。
- `app/globals.css`：全站视觉、响应式布局和动效。
- `src/content/letter.ts`：正文、照片槽位和双结局内容。
- `public/images/resonance/`：双星共振漫画。
- `public/memories/`：后续添加的旅行照片。
- `app/layout.tsx`：页面标题、隐私抓取策略和分享信息。
- `.openai/hosting.json`：Sites 项目配置。

## 编辑内容

正文和媒体配置统一维护在 `src/content/letter.ts`。搜索“【这里填写”可定位尚未完成的段落；照片的 `src` 留空时，页面会显示占位卡。

照片建议使用英文文件名，并放入 `public/memories/`。例如：

```ts
src: "/memories/window-01.webp"
```

## 技术结构

项目使用 React、TypeScript、Vinext 和 Vite，生成 Cloudflare Worker 兼容的 Sites 构建。目前没有数据库、应用内登录或上传功能；阅读状态只存在当前页面和网址中。
