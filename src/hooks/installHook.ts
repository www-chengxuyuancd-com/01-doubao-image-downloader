/**
 * 全局水印拦截 hook —— 在 main.tsx 模块顶层立即执行,先于 React mount。
 *
 * 仅拦截 JSON.parse 一条路径(更稳妥,不会污染 fetch 行为)。
 * 处理逻辑:把响应 JSON 里 creations[].image.image_ori_raw.url(无水印原图)
 * 同时塞回 image_ori / image_preview / image_thumb 的 url,并把新 URL 通过
 * 全局事件 `doubao-downloader:new-images` 推给 React 层。
 */

const EVENT_NAME = "doubao-downloader:new-images";
const seen = new Set<string>();

interface ImageField {
  url?: string;
}

interface CreationItem {
  image?: {
    image_ori?: ImageField;
    image_preview?: ImageField;
    image_thumb?: ImageField;
    image_ori_raw?: ImageField;
  };
}

function findAllByKey<T = unknown>(obj: unknown, key: string): T[] {
  const results: T[] = [];
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (!Array.isArray(node) && key in (node as Record<string, unknown>)) {
      results.push((node as Record<string, unknown>)[key] as T);
    }
    const items = Array.isArray(node) ? node : Object.values(node);
    for (const item of items) visit(item);
  };
  visit(obj);
  return results;
}

function processData(data: unknown): void {
  try {
    const creationsList = findAllByKey<CreationItem[]>(data, "creations");
    if (creationsList.length === 0) return;

    const found: string[] = [];
    for (const creations of creationsList) {
      if (!Array.isArray(creations)) continue;
      for (const item of creations) {
        const rawUrl = item?.image?.image_ori_raw?.url;
        if (!rawUrl) continue;
        // 注意:这里只"读取"无水印 URL,不再修改原响应对象,
        // 避免影响豆包页面自身的渲染逻辑。
        if (!found.includes(rawUrl)) found.push(rawUrl);
      }
    }

    const fresh = found.filter((u) => !seen.has(u));
    if (fresh.length === 0) return;
    fresh.forEach((u) => seen.add(u));

    console.log(
      `[豆包下载器] 拦截到 ${fresh.length} 张新图`,
      fresh.slice(0, 3),
    );

    window.dispatchEvent(
      new CustomEvent<string[]>(EVENT_NAME, { detail: fresh }),
    );
  } catch (e) {
    console.warn("[豆包下载器] processData 异常:", e);
  }
}

let installed = false;

export function installHook(): { jsonParse: boolean } {
  if (installed) return { jsonParse: true };
  installed = true;

  const result = { jsonParse: false };

  try {
    const originalParse = JSON.parse;
    JSON.parse = function (text, reviver) {
      const data = originalParse(text, reviver);
      try {
        if (typeof text === "string" && text.includes("creations")) {
          processData(data);
        }
      } catch (e) {
        console.warn("[豆包下载器] JSON.parse hook 内部异常:", e);
      }
      return data;
    };
    result.jsonParse = JSON.parse !== originalParse;
    console.log("[豆包下载器] JSON.parse hook 安装", result.jsonParse ? "成功" : "失败");
  } catch (e) {
    console.warn("[豆包下载器] hook JSON.parse 失败:", e);
  }

  return result;
}

/** 把"已经收集到的所有图"清空。供"清空列表"按钮使用 */
export function clearSeen() {
  seen.clear();
}

/** 返回截止目前已收集的图片数(主要用于调试) */
export function getSeenCount() {
  return seen.size;
}

export const NEW_IMAGES_EVENT = EVENT_NAME;
