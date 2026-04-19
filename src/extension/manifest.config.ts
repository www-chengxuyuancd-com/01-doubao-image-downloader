import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "豆包下载器",
  version: "1.0.0",
  description: "包哥豆包AI生图去水印批量下载器",
  author: { email: "baoge@example.com" },
  homepage_url: "https://github.com/www-chengxuyuancd-com",
  icons: {
    "16": "icons/logo-16.png",
    "48": "icons/logo-48.png",
    "128": "icons/logo-128.png",
  },
  action: {
    default_popup: "src/extension/popup.html",
    default_title: "包哥豆包下载器",
    default_icon: {
      "16": "icons/logo-16.png",
      "48": "icons/logo-48.png",
      "128": "icons/logo-128.png",
    },
  },
  permissions: ["activeTab"],
  content_scripts: [
    {
      matches: ["https://www.doubao.com/*"],
      js: ["src/extension/content.ts"],
      run_at: "document_end",
      world: "MAIN",
    },
  ],
  web_accessible_resources: [
    {
      matches: ["https://www.doubao.com/*"],
      resources: ["assets/*"],
    },
  ],
});
