import type { AppMarker } from "../types/map.ts";
import { CATEGORY_META } from "../types/map.ts";

interface InfoWindowProps {
  marker: AppMarker;
  onMemoUpdate: (markerId: string, newMemo: string) => void;
  onClose: () => void;
}

export const createInfoWindowContent = ({
  marker,
  onMemoUpdate,
  onClose,
}: InfoWindowProps) => {
  const container = document.createElement("div");
  container.style.minWidth = "200px";
  container.style.maxWidth = "280px";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "8px";
  container.style.position = "relative";

  const infoHeaderContainer = document.createElement("div");
  infoHeaderContainer.style.display = "flex";
  infoHeaderContainer.style.justifyContent = "space-between";
  infoHeaderContainer.style.alignItems = "center";
  infoHeaderContainer.style.marginBottom = "8px";
  container.appendChild(infoHeaderContainer);

  // 제목
  const titleEl = document.createElement("div");
  titleEl.textContent =
    marker.title.slice(0, 10) + (marker.title.length > 10 ? "..." : "");
  titleEl.style.fontWeight = "600";
  titleEl.style.fontSize = "16px";
  titleEl.style.flex = "1";
  infoHeaderContainer.appendChild(titleEl);

  // 닫기 버튼
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "닫기";
  closeBtn.style.fontSize = "12px";
  closeBtn.style.textDecoration = "underline";
  closeBtn.style.border = "none";
  closeBtn.style.background = "transparent";
  closeBtn.style.fontSize = "12px";
  closeBtn.style.color = "#6b7280";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => {
    onClose();
  };
  infoHeaderContainer.appendChild(closeBtn);

  // 카테고리 표시
  const categoryEl = document.createElement("div");
  categoryEl.style.display = "flex";
  categoryEl.style.gap = "4px";
  categoryEl.style.flexWrap = "wrap";
  categoryEl.style.marginBottom = "4px";

  marker.categories.forEach((cat) => {
    const catSpan = document.createElement("span");
    catSpan.textContent = `${CATEGORY_META[cat].emoji} ${CATEGORY_META[cat].label}`;
    catSpan.style.fontSize = "12px";
    catSpan.style.color = "#6b7280";
    categoryEl.appendChild(catSpan);
  });
  container.appendChild(categoryEl);

  // 메모 섹션
  const memoContainer = document.createElement("div");
  memoContainer.style.display = "flex";
  memoContainer.style.flexDirection = "column";
  memoContainer.style.gap = "4px";

  const memoText = document.createElement("div");
  memoText.textContent = marker.memo || "메모를 추가할 수 있어요";
  memoText.style.fontSize = "14px";
  memoText.style.color = marker.memo ? "#374151" : "#9ca3af";
  memoText.style.minHeight = "20px";
  memoText.style.padding = "4px";
  memoText.style.border = "1px solid #e5e7eb";
  memoText.style.borderRadius = "4px";
  memoText.style.backgroundColor = "#f9fafb";
  memoContainer.appendChild(memoText);

  const memoBtn = document.createElement("button");
  memoBtn.textContent = marker.memo ? "메모 수정" : "+";
  memoBtn.style.padding = "4px 8px";
  memoBtn.style.border = "1px solid #d1d5db";
  memoBtn.style.borderRadius = "4px";
  memoBtn.style.fontSize = "12px";
  memoBtn.style.backgroundColor = "#fff";
  memoBtn.style.cursor = "pointer";
  memoBtn.onclick = () => {
    const newMemo = window.prompt("메모를 입력하세요", marker.memo || "");
    if (newMemo !== null) {
      onMemoUpdate(marker.id, newMemo);
    }
  };
  memoContainer.appendChild(memoBtn);

  container.appendChild(memoContainer);

  return container;
};
