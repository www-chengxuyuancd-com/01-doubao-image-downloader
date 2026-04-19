import { useCallback, useState } from "react";
import { Toaster, toast } from "sonner";
import Indicator from "./components/Indicator";
import Home from "./components/Home";
import { useWatermarkRemover } from "./hooks/useWatermarkRemover";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);

  const handleNewImages = useCallback((newUrls: string[]) => {
    setUrls((prev) => {
      const set = new Set(prev);
      const fresh = newUrls.filter((u) => !set.has(u));
      if (fresh.length === 0) return prev;
      toast("🎉 有新图片", {
        description: `本次新增 ${fresh.length} 张无水印图`,
        action: {
          label: "查看",
          onClick: () => setIsOpen(true),
        },
      });
      return [...prev, ...fresh];
    });
  }, []);

  useWatermarkRemover(handleNewImages);

  return (
    <>
      <Indicator count={urls.length} onClick={() => setIsOpen((v) => !v)} />
      <Home
        urls={urls}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onClear={() => setUrls([])}
      />
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
