<div align="center">
  <img src="./src/assets/logo.png" width="120" alt="logo" />
  <h1>包哥豆包 AI 生图去水印批量下载器</h1>
  <p>一款支持<b>批量下载豆包 AI 生图无水印原图</b>的小工具,一份源码同时输出油猴脚本与 Chrome MV3 扩展。</p>
</div>

> 作者:包哥 · 发布日期:2026-04-19
> GitHub: <https://github.com/www-chengxuyuancd-com>
> 个人网站介绍页:<https://www.xd1997.com/812.html>

---

## ⚠️ 关于失效

豆包后端会不定期升级接口,**一旦字段调整,本工具可能立即失效**。
若发现按钮没反应或下载下来仍带水印,通常是豆包接口改了,需要更新插件。

📣 **关注公众号「包哥软件人生」,获取最新版本**:

<div align="center">
  <img src="./src/assets/wechat-qrcode.png" width="380" alt="包哥软件人生 公众号" />
</div>

---

## 产物形态

| 形态 | 适合谁 | 安装方式 |
| --- | --- | --- |
| 油猴脚本 `*.user.js` | 装了 Tampermonkey / Violentmonkey 的用户 | 拖文件进 Tampermonkey 安装即可 |
| Chrome / Edge MV3 扩展 | 不想装油猴的普通用户 | `chrome://extensions/` → 加载已解压扩展 |

> 个人网站详细介绍 / 视频演示 / 历史版本归档:<https://www.xd1997.com/812.html>

---

## 技术栈

- React 19 + TypeScript
- Vite 7
- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) —— 输出油猴脚本
- [@crxjs/vite-plugin](https://crxjs.dev/) —— 输出 MV3 浏览器扩展
- Tailwind CSS v4
- [sonner](https://sonner.emilkowal.ski/) —— Toast 通知
- [JSZip](https://stuk.github.io/jszip/) + [FileSaver](https://github.com/eligrey/FileSaver.js/) —— 批量打包下载

---

## 核心原理:怎么去的水印?

**不是用 Canvas 抠掉水印,而是 hook 全局 `JSON.parse`,把豆包接口已经下发的"无水印原图 URL"替换到展示/下载链路里。**

豆包生图接口返回的 JSON 里,每张图实际有多个版本:

| 字段 | 说明 |
| --- | --- |
| `image_ori` | 原图(带水印,展示用) |
| `image_preview` | 预览图(带水印) |
| `image_thumb` | 缩略图(带水印) |
| `image_ori_raw` | **原始未加水印的源图**(平时前端不用,但接口照样下发了) |

核心代码见 `src/hooks/useWatermarkRemover.ts`:

1. 改写 `window.JSON.parse`
2. 解析后递归找到响应里的 `creations` 数组
3. 把每张图的 `image_ori_raw.url` 同时赋给 `image_ori / image_preview / image_thumb` 的 `url`
4. 同时把新出现的 URL 推送给 React state,UI 自动展示并支持批量下载

> 油猴脚本由 `vite-plugin-monkey` 注入到主世界,扩展则在 manifest 里设置 `"world": "MAIN"`,这样改写的 `JSON.parse` 才会被豆包前端真正用到。

---

## 目录结构

```
.
├── src/
│   ├── App.tsx                       # React 根组件
│   ├── main.tsx                      # 挂载入口
│   ├── assets/                       # logo、公众号二维码等图片资源
│   ├── components/
│   │   ├── Indicator.tsx             # 右侧悬浮按钮(可拖拽)
│   │   ├── Home.tsx                  # 下载弹窗 + 关于面板
│   │   └── ImageGrid.tsx             # 图片网格 + 多选
│   ├── hooks/
│   │   └── useWatermarkRemover.ts    # 核心 hook:JSON.parse 拦截
│   ├── utils/
│   │   └── downloader.ts             # 单图保存 / JSZip 批量打包
│   ├── styles/
│   │   └── index.css                 # Tailwind + 自定义类
│   └── extension/                    # 仅扩展产物用
│       ├── manifest.config.ts        # MV3 manifest
│       ├── content.ts                # content script 入口
│       ├── popup.html / popup.css / popup.ts
├── vite.config.ts                    # 双产物配置(userscript / extension)
├── tsconfig.json
├── package.json
└── README.md
```

---

## 安装与开发

```bash
# 安装依赖
pnpm install

# 开发(油猴脚本模式,自带 HMR + 自动安装提示)
pnpm dev

# 开发(扩展模式,产物输出到 dist/extension,可直接加载到浏览器)
pnpm dev:ext

# 一次性构建两种产物
pnpm build

# 单独构建
pnpm build:userscript    # -> dist/userscript/doubao-downloader.user.js
pnpm build:extension     # -> dist/extension/

# TypeScript 类型检查
pnpm type-check
```

---

## 使用方法

### 方式一:油猴脚本(推荐,最方便)

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. `pnpm build:userscript`,把 `dist/userscript/doubao-downloader.user.js` 拖进 Tampermonkey 安装
3. 打开 <https://www.doubao.com/chat>,正常生图
4. 页面右侧会出现一个悬浮按钮,点击即可批量下载无水印原图

### 方式二:浏览器扩展(Chrome / Edge)

1. `pnpm build:extension`
2. 打开 `chrome://extensions/`,开启右上角"开发者模式"
3. 点"加载已解压的扩展程序",选择本项目的 `dist/extension/` 目录
4. 打开 <https://www.doubao.com/chat>,生图后点页面右侧悬浮按钮即可

---

## 注意事项 & 免责声明

- 本工具仅供个人学习交流,**不得用于商业用途或侵犯他人版权**。
- 下载的图片版权归原作者及豆包平台所有。
- 实现完全依赖豆包接口下发的 `image_ori_raw` 字段,**一旦官方调整接口可能立即失效** —— 失效后请到公众号「包哥软件人生」获取新版。
- 请勿用于绕过付费、批量爬取等违反豆包用户协议的场景。

---

## 相关链接

- 📦 GitHub:<https://github.com/www-chengxuyuancd-com/01-doubao-image-downloader>
- 🌐 个人网站介绍页:<https://www.xd1997.com/812.html>
- 👤 作者主页:<https://github.com/www-chengxuyuancd-com>
- 📣 公众号:**包哥软件人生**(微信搜一搜)

---

## License

MIT © 包哥
