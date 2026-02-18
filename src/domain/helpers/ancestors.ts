export function ancestors(el: HTMLElement): HTMLElement[] {
  const elements = [];
  let element = el;
  elements.push(element);
  while (element.parentElement != null) {
    elements.push(element.parentElement);
    element = element.parentElement;
  }
  return elements;
}

export function findInAncestors(el: HTMLElement, predicate: (el: HTMLElement) => boolean): HTMLElement {
  const parent = el?.parentElement || null;
  if (parent == null) {
    return null;
  }
  if (predicate(parent)) {
    return parent;
  }
  return findInAncestors(parent, predicate);
}

export function isInModal(element: HTMLElement): boolean {
  const result = findInAncestors(element, it => it.classList.contains('swm-modal'));
  if (result !== null) return true;
  return false;
}
