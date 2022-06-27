// (C) 2019-2022 GoodData Corporation
import { unmountComponentsAtNodes } from "../domHelper";

describe("domHelpers", () => {
    describe("unmountComponentsAtNodes", () => {
        const firstSelector = ".first";
        const firstElement = document.createElement("div");
        const secondSelector = ".second";
        const secondElement = document.createElement("div");

        it("should call unmountComponentAtNode for all selectors which are in dom", () => {
            const unmount = jest.fn();
            const querySelector = (selector: string) => {
                switch (selector) {
                    case firstSelector:
                        return firstElement;
                    case secondSelector:
                        return secondElement;
                    default:
                        return null;
                }
            };

            unmountComponentsAtNodes([firstSelector, secondSelector], {
                unmount,
                documentInstance: { ...document, querySelector },
            });
            expect(unmount.mock.calls.length).toBe(2);

            expect(unmount.mock.calls[0][0]).toBe(firstElement);
            expect(unmount.mock.calls[1][0]).toBe(secondElement);
        });

        it("should not call unmountComponentsAtNode for selectors which are not in dom", () => {
            const unmount = jest.fn();
            const querySelector = (selector: string) => {
                switch (selector) {
                    case firstSelector:
                        return null;
                    case secondSelector:
                        return secondElement;
                    default:
                        return null;
                }
            };

            unmountComponentsAtNodes([firstSelector, secondSelector], {
                unmount,
                documentInstance: { ...document, querySelector },
            });
            expect(unmount.mock.calls.length).toBe(1);
            expect(unmount.mock.calls[0][0]).toBe(secondElement);
        });

        it("should do nothing if no selectors given", () => {
            const unmount = jest.fn();

            unmountComponentsAtNodes([], {
                unmount,
                documentInstance: { ...document, querySelector: () => firstElement },
            });

            expect(unmount.mock.calls.length).toBe(0);
        });

        it("should accept elements as input", () => {
            const unmount = jest.fn();

            unmountComponentsAtNodes([firstElement, secondElement], {
                unmount,
                documentInstance: document,
            });

            expect(unmount.mock.calls.length).toBe(2);
        });
    });
});
