import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import monkey from "vite-plugin-monkey";
import { crx } from "@crxjs/vite-plugin";
import path from "node:path";
import { readFileSync } from "node:fs";
import manifest from "./src/extension/manifest.config";

const PKG_NAME = "豆包下载器";
const PKG_VERSION = "1.0.0";
const PKG_DESC = "包哥豆包AI生图去水印批量下载器";
const AUTHOR = "包哥";
const HOMEPAGE = "https://github.com/www-chengxuyuancd-com";
const MATCH = "https://www.doubao.com/chat*";

const logoBase64 = readFileSync(
  path.resolve(__dirname, "src/assets/logo-48.png"),
).toString("base64");
const LOGO_DATA_URI = `data:image/png;base64,${logoBase64}`;

export default defineConfig(({ mode }) => {
  const isExtension = mode === "extension";

  const commonPlugins: PluginOption[] = [react(), tailwindcss()];

  if (isExtension) {
    return {
      plugins: [...commonPlugins, crx({ manifest })],
      resolve: { alias: { "@": path.resolve(__dirname, "src") } },
      build: {
        outDir: "dist/extension",
        emptyOutDir: true,
        rollupOptions: {
          input: { popup: path.resolve(__dirname, "src/extension/popup.html") },
        },
      },
    };
  }

  return {
    plugins: [
      ...commonPlugins,
      monkey({
        entry: "src/main.tsx",
        userscript: {
          name: PKG_NAME,
          namespace: HOMEPAGE,
          version: PKG_VERSION,
          description: PKG_DESC,
          author: AUTHOR,
          homepage: HOMEPAGE,
          icon: LOGO_DATA_URI,
          match: [MATCH],
          "run-at": "document-end",
        },
        build: {
          fileName: "doubao-downloader.user.js",
        },
      }),
    ],
    resolve: { alias: { "@": path.resolve(__dirname, "src") } },
    build: {
      outDir: "dist/userscript",
      emptyOutDir: true,
    },
  };
});
