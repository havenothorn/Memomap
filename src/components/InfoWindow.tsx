import type { AppMarker } from "../types/map.ts";
import { CATEGORY_META } from "../types/map.ts";

interface InfoWindowProps {
  marker: AppMarker;
  onMemoUpdate: (markerId: string, newMemo: string) => void;
}

export const createInfoWindowContent = ({
  marker,
  onMemoUpdate,
}: InfoWindowProps) => {
  const container = document.createElement("div");
  container.style.minWidth = "200px";
  container.style.maxWidth = "280px";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "8px";

  // 제목
  const titleEl = document.createElement("div");
  titleEl.textContent = marker.title;
  titleEl.style.fontWeight = "600";
  titleEl.style.fontSize = "16px";
  container.appendChild(titleEl);

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
  memoText.style.fontStyle = marker.memo ? "normal" : "italic";
  memoText.style.minHeight = "20px";
  memoText.style.padding = "4px";
  memoText.style.border = "1px solid #e5e7eb";
  memoText.style.borderRadius = "4px";
  memoText.style.backgroundColor = "#f9fafb";
  memoContainer.appendChild(memoText);

  const memoBtn = document.createElement("button");
  memoBtn.textContent = marker.memo ? "메모 수정" : "메모 추가";
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
