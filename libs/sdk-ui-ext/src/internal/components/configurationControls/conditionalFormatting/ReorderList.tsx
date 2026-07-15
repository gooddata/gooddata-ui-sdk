// (C) 2026 GoodData Corporation

import { Fragment, type HTMLAttributes, type ReactNode, useRef, useState } from "react";

import cx from "classnames";

import { moveItem, resolveTarget, startsInFormField } from "./reorderListModel.js";

type IReorderRootProps = Pick<
    HTMLAttributes<HTMLElement>,
    | "draggable"
    | "onPointerDown"
    | "onDragStart"
    | "onDragEnter"
    | "onDragOver"
    | "onDragLeave"
    | "onDrop"
    | "onDragEnd"
>;

export interface IReorderSlot {
    /** Grip element to render inside the row; null when the list is not reorderable. */
    handle: ReactNode;
    /** Spread onto the row root element. */
    rootProps: IReorderRootProps;
    /** Reorder classes to merge into the row's own className. */
    className: string;
}

export interface IReorderListProps<T> {
    items: readonly T[];
    getKey: (item: T) => string;
    /** Receives the full reordered array. */
    onReorder: (items: T[]) => void;
    renderItem: (item: T, slot: IReorderSlot, index: number) => ReactNode;
}

/**
 * Drag-to-reorder for a small vertical list, on native HTML5 DnD (no dependency, no provider).
 * The render prop keeps the consumer's own row markup; the whole row drags (the grip is a hover
 * affordance). Pointer-only — no keyboard reorder yet.
 */
export function ReorderList<T>({ items, getKey, onReorder, renderItem }: IReorderListProps<T>) {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    // Insert gap (0..n), canonical: one gap = one indicator position.
    const [dropGap, setDropGap] = useState<number | null>(null);
    // Enter/leave counter across all rows; at 0 the cursor is outside every row → hide the indicator.
    const overCount = useRef(0);
    const enabled = items.length > 1;

    const reset = () => {
        setDragIndex(null);
        setDropGap(null);
        overCount.current = 0;
    };

    const moves = dragIndex !== null && dropGap !== null && resolveTarget(dragIndex, dropGap) !== null;

    return (
        <>
            {items.map((item, index) => {
                const slot: IReorderSlot = enabled
                    ? {
                          handle: (
                              // Visual affordance only; the whole row initiates the drag.
                              <span className="gd-cf-reorder__handle" aria-hidden="true" />
                          ),
                          className: cx("gd-cf-reorder-item", {
                              "gd-cf-reorder-item--dragging": dragIndex === index,
                              "gd-cf-reorder-item--drop-above": moves && dropGap === index,
                              "gd-cf-reorder-item--drop-below":
                                  moves && index === items.length - 1 && dropGap === items.length,
                          }),
                          rootProps: {
                              draggable: true,
                              onPointerDown: (e) => {
                                  // dragstart fires on the row itself, never on the field under the
                                  // cursor — so decide at press time whether this gesture may drag.
                                  e.currentTarget.draggable = !startsInFormField(e.target);
                              },
                              onDragStart: (e) => {
                                  // Only drags of selected text target the field itself — cancel those.
                                  if (startsInFormField(e.target)) {
                                      e.preventDefault();
                                      return;
                                  }
                                  setDragIndex(index);
                                  e.dataTransfer.effectAllowed = "move";
                                  // Firefox starts a drag only when some data is set.
                                  e.dataTransfer.setData("text/plain", String(index));
                              },
                              onDragEnter: () => {
                                  if (dragIndex !== null) {
                                      overCount.current += 1;
                                  }
                              },
                              onDragOver: (e) => {
                                  // dragIndex is set only by our own dragstart — foreign drags are ignored.
                                  if (dragIndex === null) {
                                      return;
                                  }
                                  e.preventDefault();
                                  e.dataTransfer.dropEffect = "move";
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const gap = e.clientY < rect.top + rect.height / 2 ? index : index + 1;
                                  setDropGap(gap);
                              },
                              onDragLeave: () => {
                                  if (dragIndex === null) {
                                      return;
                                  }
                                  overCount.current = Math.max(0, overCount.current - 1);
                                  if (overCount.current === 0) {
                                      setDropGap(null);
                                  }
                              },
                              onDrop: (e) => {
                                  e.preventDefault();
                                  if (dragIndex !== null && dropGap !== null) {
                                      const to = resolveTarget(dragIndex, dropGap);
                                      if (to !== null) {
                                          onReorder(moveItem(items, dragIndex, to));
                                      }
                                  }
                                  reset();
                              },
                              onDragEnd: reset,
                          },
                      }
                    : { handle: null, rootProps: {}, className: "" };

                return <Fragment key={getKey(item)}>{renderItem(item, slot, index)}</Fragment>;
            })}
        </>
    );
}
