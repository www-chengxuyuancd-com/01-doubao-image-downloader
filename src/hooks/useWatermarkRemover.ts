import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { NEW_IMAGES_EVENT } from "./installHook";

/**
 * React 适配层:订阅 installHook 派发的全局事件,转给 React state。
 *
 * 真正的 hook 已经在 main.tsx 模块顶层完成,这里只做事件桥接。
 */
export function useWatermarkRemover(onNewImages: (urls: string[]) => void) {
  const callbackRef = useRef(onNewImages);
  callbackRef.current = onNewImages;
  const greetedRef = useRef(false);

  useEffect(() => {
    if (!greetedRef.current) {
      greetedRef.current = true;
      // 延迟一帧再弹,确保 <Toaster /> 已经 mount 完
      setTimeout(() => {
        try {
          toast.success("🥟 包哥豆包下载器已就绪");
        } catch (e) {
          console.warn("[豆包下载器] toast 失败", e);
        }
      }, 100);
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string[]>).detail;
      if (Array.isArray(detail) && detail.length > 0) {
        callbackRef.current(detail);
      }
    };
    window.addEventListener(NEW_IMAGES_EVENT, handler);
    return () => {
      window.removeEventListener(NEW_IMAGES_EVENT, handler);
    };
  }, []);
}
