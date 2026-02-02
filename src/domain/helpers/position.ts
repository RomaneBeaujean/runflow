import { ancestors, findInAncestors } from "./ancestors";

export type Placement = 'bottom'
  | 'top'
  | 'left'
  | 'right'
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end';

export interface Position {
  top: string;
  left: string;
}

export function resolvePlacements(placement: string, autoPlacement: Placement[]): Placement[] {
  if (placement === '' || placement === 'auto') return autoPlacement;

  const placements = placement.split(',') as Placement[];

  return placements.reduce((all: Placement[], curr: Placement): Placement[] => (
    autoPlacement.includes(curr) ? [...all, curr] : all
  ), []);
}

function getClosestTransformedContainer(el: HTMLElement): HTMLElement {
  return findInAncestors(el, it => getComputedStyle(it).transform !== 'none');
}

export function getPositionOrigin(el: HTMLElement): {
  top: number;
  left: number;
} {
  const container = getClosestTransformedContainer(el);
  if (container === null) return { top: 0, left: 0 };
  const rect = container.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
  };
}

export function getLeftPosition(el: HTMLElement): string {
  const relativeContainer = findInAncestors(el, it => getComputedStyle(it).position === 'relative');

  const leftPositionOfRelativeContainer = relativeContainer.getBoundingClientRect().left;
  const left = el.getBoundingClientRect().left;

  return `${(left - leftPositionOfRelativeContainer)}px`;
}

export function getScaleCoefficient(el: HTMLElement): {
  horizontal: number;
  vertical: number;
} {
  const containers = ancestors(el);
  return containers.reduce(
    (acc, curr) => {
      if (curr !== null) {
        const matrix = getComputedStyle(curr).transform;
        if (matrix !== 'none' && matrix !== '') {
          const coefs = matrix.match(/matrix\(([^)]+)\)/)[1].split(',');
          const coefX = parseFloat(coefs[0]);
          const coefY = parseFloat(coefs[3]);
          return {
            horizontal: acc.horizontal * coefX,
            vertical: acc.vertical * coefY,
          };
        }
      }
      return acc;
    },
    {
      horizontal: 1,
      vertical: 1,
    },
  );
}

export function getWidth(element: HTMLElement): string {
  const scaleCoef = getScaleCoefficient(element);
  const { width } = element.getBoundingClientRect();
  const realWidth = width / scaleCoef.horizontal;
  return `${realWidth}px`;
}

export const isVisibleInside = (element: HTMLElement, container: HTMLElement): boolean => {
  const hostRect = container.getBoundingClientRect();
  const minLeft = Math.floor(hostRect?.left);
  const maxRight = Math.floor(hostRect?.left + hostRect.width);
  const minTop = Math.floor(hostRect?.top);
  const maxBottom = Math.floor(hostRect?.bottom);

  const elementRect = element?.getBoundingClientRect();
  const { left, top } = elementRect;
  const bottom = Math.floor(top) + Math.floor(elementRect.height);
  const right = Math.floor(left) + Math.floor(elementRect.width);

  const isElementVisible = (
    left >= minLeft
    && left <= maxRight
    && right >= minLeft
    && right <= maxRight
    && top >= minTop
    && top <= maxBottom
    && bottom >= minTop
    && bottom <= maxBottom
    && elementRect.width !== 0
  );

  return isElementVisible;
};

export function isVisible(element: HTMLElement): boolean {
  const elementRect = element.getBoundingClientRect();

  const middleX = elementRect.left + elementRect.width / 2;
  const top = elementRect.top + 1; // 1px for marge
  const bottom = elementRect.bottom - 1; // 1px for marge

  const elementsTop = document.elementsFromPoint(middleX, top);
  const elementsBottom = document.elementsFromPoint(middleX, bottom);
  return [elementsTop, elementsBottom].reduce((result, elements) => {
    if (result) {
      return elements.includes(element);
    }
    return false;
  }, true);
}

function isInViewport(element: HTMLElement, positionStyle: Position): boolean {
  const elementRect = element.getBoundingClientRect();
  const position = {
    left: parseFloat(positionStyle.left),
    top: parseFloat(positionStyle.top),
    right: parseFloat(positionStyle.left) + elementRect.width,
    bottom: parseFloat(positionStyle.top) + elementRect.height,
  };
  const windowRect = {
    height: window.innerHeight - getPositionOrigin(element).top,
    width: window.innerWidth - getPositionOrigin(element).left,
  };
  return (
    position.top >= 0
    && position.bottom <= windowRect.height
    && position.left >= 0
    && position.right <= windowRect.width
  );
}

export function computePosition(
  element: HTMLElement,
  placement: Placement,
  reference?: HTMLElement,
): Position {
  const elementRect = element.getBoundingClientRect();
  const referenceElement = reference || element.parentElement || element;
  const referenceRect = referenceElement?.getBoundingClientRect();
  const position: Position = {
    left: '0px',
    top: '0px',
  };

  const origin = getPositionOrigin(element);
  const coefs = getScaleCoefficient(element);

  const vMiddle = ((referenceRect.top + referenceRect.height / 2) - origin.top);
  const top = (referenceRect.top - origin.top);
  const bottom = (referenceRect.top + referenceRect.height - origin.top);
  const left = (referenceRect.left - origin.left);
  const right = (referenceRect.left + referenceRect.width - origin.left);
  const hMiddle = (referenceRect.left + (referenceRect.width / 2) - origin.left);

  // vertical
  const onTop = `${(top - elementRect.height) / coefs.vertical}px`;
  const onBottom = `${bottom / coefs.vertical}px`;
  const onVMiddle = `${(vMiddle - (elementRect.height / 2)) / coefs.vertical}px`;
  const onVStart = `${top / coefs.vertical}px`;
  const onVEnd = `${(bottom - elementRect.height) / coefs.vertical}px`;

  // horizontal
  const onHStart = `${left / coefs.horizontal}px`;
  const onHEnd = `${(right - elementRect.width) / coefs.horizontal}px`;
  const onLeft = `${(left - elementRect.width) / coefs.horizontal}px`;
  const onRight = `${right / coefs.horizontal}px`;
  const onHMiddle = `${(hMiddle - (elementRect.width / 2)) / coefs.horizontal}px`;

  switch (placement) {
    case 'bottom':
      position.top = onBottom;
      position.left = onHMiddle;
      break;
    case 'top':
      position.top = onTop;
      position.left = onHMiddle;
      break;
    case 'left':
      position.top = onVMiddle;
      position.left = onLeft;
      break;
    case 'right':
      position.top = onVMiddle;
      position.left = onRight;
      break;
    case 'bottom-start':
      position.top = onBottom;
      position.left = onHStart;
      break;
    case 'bottom-end':
      position.top = onBottom;
      position.left = onHEnd;
      break;
    case 'top-start':
      position.top = onTop;
      position.left = onHStart;
      break;
    case 'top-end':
      position.top = onTop;
      position.left = onHEnd;
      break;
    case 'right-start':
      position.top = onVStart;
      position.left = onRight;
      break;
    case 'right-end':
      position.top = onVEnd;
      position.left = onRight;
      break;
    case 'left-start':
      position.top = onVStart;
      position.left = onLeft;
      break;
    case 'left-end':
      position.top = onVEnd;
      position.left = onLeft;
      break;
    default:
      break;
  }

  const closestTransformedContainer = getClosestTransformedContainer(element);

  if (closestTransformedContainer !== null) {
    if (closestTransformedContainer.scrollTop > 0) {
      const topp = parseFloat(position.top);
      position.top = `${topp + closestTransformedContainer.scrollTop}px`;
    }
  }

  return position;
}

export function computeWidth(
  element: HTMLElement,
  reference?: HTMLElement,
): string {
  const referenceRect = reference !== undefined
    ? reference.getBoundingClientRect()
    : element.parentElement.getBoundingClientRect();
  const coefs = getScaleCoefficient(element);
  return `${referenceRect.width / coefs.horizontal}px`;
}

export function findPosition(
  el: HTMLElement,
  placements: Placement[],
  reference?: HTMLElement,
): { placement: Placement; position: { left: string; top: string } } {
  const firstPosition = computePosition(el, placements[0], reference);
  const bestPosition = placements.reduce(
    (acc, curr) => {
      if (!acc.inViewport) {
        const placement = curr;
        const position = computePosition(el, curr, reference);
        const inViewport = isInViewport(el, position);
        if (inViewport) {
          return {
            placement,
            position,
            inViewport,
          };
        }
      }
      return acc;
    },
    {
      placement: placements[0],
      position: computePosition(el, placements[0], reference),
      inViewport: isInViewport(el, firstPosition),
    },
  );

  return {
    placement: bestPosition.placement,
    position: bestPosition.position,
  };
}
