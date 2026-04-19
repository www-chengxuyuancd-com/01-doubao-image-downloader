import { useMemo, useState } from "react";
import { toast } from "sonner";
import ImageGrid from "./ImageGrid";
import { downloadImages } from "@/utils/downloader";
import qrcodeUrl from "@/assets/wechat-qrcode.png?inline";

interface Props {
  urls: string[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export default function Home({ urls, isOpen, onClose, onClear }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const selectedList = useMemo(
    () => urls.filter((u) => selected.has(u)),
    [urls, selected],
  );

  const toggle = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(urls));
  const selectNone = () => setSelected(new Set());

  const run = async (targets: string[]) => {
    if (targets.length === 0) {
      toast.warning("请先选择图片");
      return;
    }
    setBusy(true);
    const tid = toast.loading(`下载中 0 / ${targets.length}`);
    try {
      await downloadImages(targets, {
        zipName: document.title || "doubao-images",
        onProgress: (cur, total) => {
          toast.loading(`下载中 ${cur} / ${total}`, { id: tid });
        },
        onError: (url, err) => {
          console.error("下载失败:", url, err);
        },
      });
      toast.success(`下载完成 (${targets.length} 张)`, { id: tid });
    } catch (e) {
      console.error(e);
      toast.error("下载失败,详见控制台", { id: tid });
    } finally {
      setBusy(false);
    }
  };

  const [showAbout, setShowAbout] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="dd-mask" onClick={onClose} />
      <div className="dd-home" onClick={(e) => e.stopPropagation()}>
        <div className="dd-action-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="dd-btn dd-btn-primary"
              onClick={() => run(urls)}
              disabled={busy || urls.length === 0}
            >
              下载所有 ({urls.length})
            </button>
            <button
              className="dd-btn dd-btn-orange"
              onClick={() => run(selectedList)}
              disabled={busy || selectedList.length === 0}
            >
              下载选中 ({selectedList.length})
            </button>
            <button
              className="dd-btn dd-btn-ghost"
              onClick={selectAll}
              disabled={busy || urls.length === 0}
            >
              全选
            </button>
            <button
              className="dd-btn dd-btn-ghost"
              onClick={selectNone}
              disabled={busy || selected.size === 0}
            >
              取消选择
            </button>
            <button
              className="dd-btn dd-btn-ghost"
              onClick={() => {
                setSelected(new Set());
                onClear();
              }}
              disabled={busy}
            >
              清空列表
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="dd-btn dd-btn-ghost"
              onClick={() => setShowAbout((v) => !v)}
              disabled={busy}
              title="关于 / 公众号"
            >
              关于
            </button>
            <button
              className="dd-btn dd-btn-ghost"
              onClick={onClose}
              disabled={busy}
            >
              关闭 ✕
            </button>
          </div>
        </div>

        {showAbout ? (
          <div className="dd-about">
            <h3>关于包哥豆包下载器</h3>
            <p className="dd-about-desc">
              本工具可批量下载豆包 AI 生图的<b>无水印原图</b>。
            </p>

            <div className="dd-about-notice">
              ⚠️ 如果插件失效,通常是<b>豆包接口升级</b>导致。
              <br />
              关注下方公众号 <b>「包哥软件人生」</b>,获取最新版本。
            </div>

            <div className="dd-about-links">
              <a
                href="https://github.com/www-chengxuyuancd-com/01-doubao-image-downloader"
                target="_blank"
                rel="noreferrer"
              >
                📦 GitHub 仓库
              </a>
              <a
                href="https://www.xd1997.com/812.html"
                target="_blank"
                rel="noreferrer"
              >
                🌐 个人网站介绍
              </a>
            </div>

            <div className="dd-about-qrwrap">
              <img src={qrcodeUrl} alt="包哥软件人生 公众号" />
              <div className="dd-about-tip">
                微信搜一搜:<b>包哥软件人生</b>
              </div>
            </div>

            <div className="dd-about-meta">
              作者:包哥 · 发布日期:2026-04-19
            </div>
          </div>
        ) : (
          <ImageGrid urls={urls} selected={selected} onToggle={toggle} />
        )}
      </div>
    </>
  );
}
