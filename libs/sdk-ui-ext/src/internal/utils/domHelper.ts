// (C) 2019-2022 GoodData Corporation
// eslint-disable-next-line react/no-deprecated
import { unmountComponentAtNode } from "react-dom";

/**
 * @internal
 */
export function unmountComponentsAtNodes(
    elementsOrSelectors: Array<HTMLElement | string> = [],
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
    elementsOrSelectors.forEach((elementOrSelector) => {
        const element =
            typeof elementOrSelector === "string"
                ? documentInstance.querySelector(elementOrSelector)
                : elementOrSelector;

        if (element) {
            unmount(element);
        }
    });
}
