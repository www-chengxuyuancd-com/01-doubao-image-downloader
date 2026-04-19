interface Props {
  urls: string[];
  selected: Set<string>;
  onToggle: (url: string) => void;
}

export default function ImageGrid({ urls, selected, onToggle }: Props) {
  if (urls.length === 0) {
    return (
      <div className="dd-empty">
        <div style={{ fontSize: 48 }}>🖼️</div>
        <div style={{ fontWeight: 600 }}>暂无图片</div>
        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
            lineHeight: 1.6,
            maxWidth: 360,
            textAlign: "center",
          }}
        >
          脚本只能拦截<b>页面加载之后</b>新返回的图片接口。
          <br />
          如果你已经生成过图片,请<b>刷新本页面</b>(F5)
          <br />
          再点开下载器,历史图片会重新被加载并出现在这里。
        </div>
      </div>
    );
  }

  return (
    <div className="dd-grid">
      {urls.map((url) => {
        const isSelected = selected.has(url);
        return (
          <div
            key={url}
            className={`dd-item ${isSelected ? "selected" : ""}`}
            onClick={() => onToggle(url)}
          >
            <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" />
            {isSelected && <div className="dd-item-check">✓</div>}
          </div>
        );
      })}
    </div>
  );
}
