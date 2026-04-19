import { useEffect, useState } from "react";
import logoUrl from "@/assets/logo.png?inline";

interface Props {
  count: number;
  onClick: () => void;
}

const STORAGE_KEY = "dd-indicator-top";

export default function Indicator({ count, onClick }: Props) {
  const [top, setTop] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || "33%",
  );
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, top);
  }, [top]);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    const startY = e.clientY;
    const startTop = parseFloat(top);
    const isPercent = top.endsWith("%");
    const startPx = isPercent ? (window.innerHeight * startTop) / 100 : startTop;

    let moved = false;
    const onMove = (ev: MouseEvent) => {
      const dy = ev.clientY - startY;
      if (Math.abs(dy) > 3) moved = true;
      const next = Math.min(
        window.innerHeight - 60,
        Math.max(10, startPx + dy),
      );
      setTop(`${next}px`);
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (!moved) onClick();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className="dd-indicator"
      style={{ top, cursor: dragging ? "grabbing" : "pointer" }}
      onMouseDown={onMouseDown}
      title="包哥豆包下载器"
    >
      <img
        src={logoUrl}
        alt="logo"
        draggable={false}
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          objectFit: "cover",
          userSelect: "none",
        }}
      />
      {count > 0 && (
        <span
          style={{
            marginLeft: 4,
            fontSize: 12,
            fontWeight: 600,
            color: "#ea580c",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}
