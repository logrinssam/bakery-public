/**
 * 배포 환경에서만 로드. 우클릭·드래그로 소스/이미지를 바로 긁어가는 행위를 줄임.
 * (F12·네트워크 탭으로의 접근은 웹 특성상 막을 수 없음)
 */
function blockContextMenu(event: MouseEvent) {
  event.preventDefault();
}

function blockDragStart(event: DragEvent) {
  const target = event.target;
  if (target instanceof HTMLImageElement) {
    event.preventDefault();
  }
}

document.addEventListener('contextmenu', blockContextMenu);
document.addEventListener('dragstart', blockDragStart);
