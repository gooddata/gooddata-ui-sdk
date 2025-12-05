// (C) 2007-2025 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IResponsiveTextProps, ResponsiveText } from "../ResponsiveText.js";

describe("ResponsiveText", () => {
    function createWindowMock() {
        return {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            getComputedStyle: vi.fn(
                (): any =>
                    ({
                        fontSize: "20px",
                    }) as any,
            ),
        };
    }

    it("should set component configurable properties", () => {
        const props: IResponsiveTextProps = {
            tagName: "span",
            tagClassName: "test-class",
            title: "Responsive text title",
        };
        render(<ResponsiveText {...props} />);

        expect(screen.getByTitle(props.title!)).toHaveClass("test-class");
        expect(screen.getByTitle(props.title!)).toBeInTheDocument();
    });

    it("should add resize window event listener when component is mounted", async () => {
        const props = {
            window: createWindowMock(),
        };
        render(<ResponsiveText {...props} />);

        await waitFor(() => {
            expect(props.window.addEventListener).toBeCalledWith("resize", expect.any(Function));
        });
    });

    it("should remove window event listener when component is unmounted", async () => {
        const props = {
            window: createWindowMock(),
        };
        const { unmount } = render(<ResponsiveText {...props} />);

        unmount();

        await waitFor(() => {
            expect(props.window.removeEventListener).toBeCalledWith("resize", expect.any(Function));
        });
    });
});
