// (C) 2026 GoodData Corporation

// Splice destination for inserting into gap (0..n), compensating for the dragged row's removal;
// null = no-op.
export const resolveTarget = (from: number, gap: number): number | null => {
    const to = gap > from ? gap - 1 : gap;
    return to === from ? null : to;
};

export const moveItem = <T>(items: readonly T[], from: number, to: number): T[] => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
};

// With the whole row draggable, a press-and-move inside a text field would drag the row instead of
// selecting text — so drags originating in form fields are cancelled.
export const startsInFormField = (target: EventTarget | null): boolean =>
    target instanceof Element && target.closest("input, textarea, select") !== null;
