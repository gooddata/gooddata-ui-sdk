// (C) 2007-2025 GoodData Corporation

import { createRoot } from "react-dom/client";

export function renderIntoDocumentWithUnmount(element: any) {
    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(element);

    // Return an object that mimics the old component API for backward compatibility
    const component: any = {};
    component.unmount = () => {
        root.unmount();
    };

    return component;
}
