// (C) 2026 GoodData Corporation

export function getUiListboxItemFullTitle(item: { stringTitle: string; secondaryTitle?: string }): string {
    return [item.stringTitle, item.secondaryTitle].filter(Boolean).join(" ");
}
