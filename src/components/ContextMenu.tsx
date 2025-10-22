import type { AppMarker, MarkerCategory } from "../types/map.ts";
import { CATEGORY_META } from "../types/map.ts";

interface ContextMenuProps {
  marker: AppMarker;
  onTitleUpdate: (markerId: string, newTitle: string) => void;
  onMemoUpdate: (markerId: string, newMemo: string) => void;
  onCategoriesUpdate: (
    markerId: string,
    newCategories: MarkerCategory[]
  ) => void;
  onDelete: (markerId: string) => void;
}

export const createContextMenu = (
  event: MouseEvent,
  {
    marker,
    onTitleUpdate,
    onMemoUpdate,
    onCategoriesUpdate,
    onDelete,
  }: ContextMenuProps
) => {
  // Remove existing context menu
  const existing = document.getElementById("marker-context-menu");
  if (existing) existing.remove();

  const menu = document.createElement("div");
  menu.id = "marker-context-menu";
  menu.style.position = "fixed";
  menu.style.left = `${event.clientX}px`;
  menu.style.top = `${event.clientY}px`;
  menu.style.zIndex = "1000";
  menu.style.background = "#fff";
  menu.style.border = "1px solid #e5e7eb";
  menu.style.borderRadius = "8px";
  menu.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  menu.style.padding = "8px";
  menu.style.display = "flex";
  menu.style.flexDirection = "column";
  menu.style.gap = "4px";
  menu.style.minWidth = "160px";

  const editTitleBtn = document.createElement("button");
  editTitleBtn.textContent = "📝 제목 수정";
  editTitleBtn.style.padding = "8px 12px";
  editTitleBtn.style.border = "none";
  editTitleBtn.style.background = "transparent";
  editTitleBtn.style.textAlign = "left";
  editTitleBtn.style.borderRadius = "4px";
  editTitleBtn.style.cursor = "pointer";
  editTitleBtn.onmouseover = () => (editTitleBtn.style.background = "#f3f4f6");
  editTitleBtn.onmouseout = () =>
    (editTitleBtn.style.background = "transparent");
  editTitleBtn.onclick = () => {
    const next = window.prompt("새 제목을 입력하세요", marker.title);
    if (next && next.trim()) {
      onTitleUpdate(marker.id, next.trim());
    }
    menu.remove();
  };

  const editMemoBtn = document.createElement("button");
  editMemoBtn.textContent = "📝 메모 수정";
  editMemoBtn.style.padding = "8px 12px";
  editMemoBtn.style.border = "none";
  editMemoBtn.style.background = "transparent";
  editMemoBtn.style.textAlign = "left";
  editMemoBtn.style.borderRadius = "4px";
  editMemoBtn.style.cursor = "pointer";
  editMemoBtn.onmouseover = () => (editMemoBtn.style.background = "#f3f4f6");
  editMemoBtn.onmouseout = () => (editMemoBtn.style.background = "transparent");
  editMemoBtn.onclick = () => {
    const newMemo = window.prompt("메모를 입력하세요", marker.memo || "");
    if (newMemo !== null) {
      onMemoUpdate(marker.id, newMemo);
    }
    menu.remove();
  };

  const changeCategoryBtn = document.createElement("button");
  changeCategoryBtn.textContent = "🏷️ 카테고리 추가/제거";
  changeCategoryBtn.style.padding = "8px 12px";
  changeCategoryBtn.style.border = "none";
  changeCategoryBtn.style.background = "transparent";
  changeCategoryBtn.style.textAlign = "left";
  changeCategoryBtn.style.borderRadius = "4px";
  changeCategoryBtn.style.cursor = "pointer";
  changeCategoryBtn.onmouseover = () =>
    (changeCategoryBtn.style.background = "#f3f4f6");
  changeCategoryBtn.onmouseout = () =>
    (changeCategoryBtn.style.background = "transparent");
  changeCategoryBtn.onclick = () => {
    const categories = Object.keys(CATEGORY_META) as MarkerCategory[];

    // Create a simple category selection dialog
    const selectedCategories: MarkerCategory[] = [];
    categories.forEach((cat) => {
      if (
        confirm(
          `${CATEGORY_META[cat].emoji} ${CATEGORY_META[cat].label} 카테고리를 포함하시겠습니까?`
        )
      ) {
        selectedCategories.push(cat);
      }
    });

    if (selectedCategories.length > 0) {
      onCategoriesUpdate(marker.id, selectedCategories);
    }
    menu.remove();
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️ 삭제";
  deleteBtn.style.padding = "8px 12px";
  deleteBtn.style.border = "none";
  deleteBtn.style.background = "transparent";
  deleteBtn.style.textAlign = "left";
  deleteBtn.style.borderRadius = "4px";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.style.color = "#ef4444";
  deleteBtn.onmouseover = () => (deleteBtn.style.background = "#fef2f2");
  deleteBtn.onmouseout = () => (deleteBtn.style.background = "transparent");
  deleteBtn.onclick = () => {
    if (confirm("이 마커를 삭제하시겠습니까?")) {
      onDelete(marker.id);
    }
    menu.remove();
  };

  menu.appendChild(editTitleBtn);
  menu.appendChild(editMemoBtn);
  menu.appendChild(changeCategoryBtn);
  menu.appendChild(deleteBtn);

  document.body.appendChild(menu);

  const closeMenu = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener("click", closeMenu);
    }
  };
  setTimeout(() => document.addEventListener("click", closeMenu), 0);
};
