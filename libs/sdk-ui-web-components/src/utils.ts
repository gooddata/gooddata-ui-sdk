// (C) 2026 GoodData Corporation

export function findParentWithAttribute(element: HTMLElement, attribute: string): string | null {
    if (element.hasAttribute(attribute)) {
        return element.getAttribute(attribute) ?? null;
    }
    return element.parentElement ? findParentWithAttribute(element.parentElement, attribute) : null;
}

export function defineCustomElement(name: string, constructor: CustomElementConstructor) {
    const existingConstructor = window.customElements.get(name);

    if (!existingConstructor) {
        window.customElements.define(name, constructor);
    }
}
