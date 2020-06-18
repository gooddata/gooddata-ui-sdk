// (C) 2019-2020 GoodData Corporation
import { unmountComponentAtNode } from "react-dom";

export function unmountComponentsAtNodes(
    elementSelectors: string[] = [],
    {
        unmount,
        documentInstance,
    }: {
        unmount: (element: Element) => void;
        documentInstance: Document;
    } = {
        unmount: unmountComponentAtNode,
        documentInstance: document,
    },
) {
    elementSelectors.forEach((elementSelector) => {
        const element = documentInstance.querySelector(elementSelector);
        if (element) {
            unmount(element);
        }
    });
}
