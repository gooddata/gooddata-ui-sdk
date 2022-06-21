// (C) 2019-2022 GoodData Corporation
import { unmountComponentAtNode } from "react-dom";

export function unmountComponentsAtNodes(
    elementSelectors: Array<HTMLElement | string> = [],
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
): void {
    elementSelectors.forEach((elementOrSelector) => {
        const element =
            typeof elementOrSelector === "string"
                ? documentInstance.querySelector(elementOrSelector)
                : elementOrSelector;

        if (element) {
            unmount(element);
        }
    });
}
