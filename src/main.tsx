import { installHook } from "./hooks/installHook";

// ✦ 第一步:在所有 import 之前先把 hook 装好,确保最早拦截 JSON.parse
//   (这里 import 顺序很重要 —— installHook 必须排在 React 等大模块前面)
try {
  const r = installHook();
  console.log("[豆包下载器] hook 安装:", r);
} catch (e) {
  console.error("[豆包下载器] hook 安装失败:", e);
}

import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

function mount() {
  try {
    if (!document.body) {
      console.warn("[豆包下载器] document.body 还不存在,延后 mount");
      setTimeout(mount, 50);
      return;
    }
    if (document.getElementById("doubao-downloader-root")) return;

    const container = document.createElement("div");
    container.id = "doubao-downloader-root";
    document.body.appendChild(container);
    ReactDOM.createRoot(container).render(<App />);
    console.log("[豆包下载器] React mount 完成");
  } catch (e) {
    console.error("[豆包下载器] React mount 失败:", e);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
  mount();
}
