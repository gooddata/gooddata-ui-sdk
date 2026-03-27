// (C) 2026 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import { type IPushpinShapeControlProps, PushpinShapeControl } from "../PushpinShapeControl.js";

describe("PushpinShapeControl", () => {
    const defaultProps: IPushpinShapeControlProps = {
        disabled: false,
        properties: {
            controls: {
                points: {
                    shapeType: "oneIcon",
                    icon: "",
                },
            },
        },
        pushData: vi.fn(),
        spriteIcons: [],
    };

    function createComponent(customProps: Partial<IPushpinShapeControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return render(
            <InternalIntlWrapper>
                <PushpinShapeControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("selects the first sprite icon when metadata arrives for empty oneIcon selection", async () => {
        const pushData = vi.fn();
        const { rerender } = createComponent({ pushData });

        rerender(
            <InternalIntlWrapper>
                <PushpinShapeControl
                    {...defaultProps}
                    pushData={pushData}
                    spriteIcons={[
                        { title: "airport", value: "airport" },
                        { title: "harbor", value: "harbor" },
                    ]}
                />
            </InternalIntlWrapper>,
        );

        await waitFor(() => {
            expect(pushData).toHaveBeenCalledWith({
                properties: {
                    controls: {
                        points: {
                            shapeType: "oneIcon",
                            icon: "airport",
                        },
                    },
                },
            });
        });
    });

    it("does not overwrite a non-empty oneIcon selection when sprite metadata changes", async () => {
        const pushData = vi.fn();
        const { rerender } = createComponent({
            pushData,
            properties: {
                controls: {
                    points: {
                        shapeType: "oneIcon",
                        icon: "airport",
                    },
                },
            },
            spriteIcons: [{ title: "airport", value: "airport" }],
        });

        rerender(
            <InternalIntlWrapper>
                <PushpinShapeControl
                    {...defaultProps}
                    pushData={pushData}
                    properties={{
                        controls: {
                            points: {
                                shapeType: "oneIcon",
                                icon: "airport",
                            },
                        },
                    }}
                    spriteIcons={[{ title: "harbor", value: "harbor" }]}
                />
            </InternalIntlWrapper>,
        );

        await waitFor(() => {
            expect(pushData).not.toHaveBeenCalled();
        });
    });

    it("pushes the auto-selected icon only once while waiting for parent props to catch up", async () => {
        const pushData = vi.fn();
        const spriteIcons = [
            { title: "airport", value: "airport" },
            { title: "harbor", value: "harbor" },
        ];
        const { rerender } = createComponent({ pushData, spriteIcons });

        rerender(
            <InternalIntlWrapper>
                <PushpinShapeControl {...defaultProps} pushData={pushData} spriteIcons={spriteIcons} />
            </InternalIntlWrapper>,
        );

        await waitFor(() => {
            expect(pushData).toHaveBeenCalledTimes(1);
        });
    });

    it("keeps the shape dropdown visible but disabled for circle shape with size or color measure", () => {
        createComponent({
            properties: {
                controls: {
                    points: {
                        shapeType: "circle",
                    },
                },
            },
            hasSizeOrColorMeasure: true,
        });

        expect(screen.getByText("Shape")).toBeInTheDocument();
        expect(screen.getByText("Type")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toHaveAttribute("aria-disabled", "true");
    });

    it("keeps the shape dropdown hidden when only circle is available and no metric restriction applies", () => {
        createComponent({
            properties: {
                controls: {
                    points: {
                        shapeType: "circle",
                    },
                },
            },
        });

        expect(screen.queryByText("Shape")).not.toBeInTheDocument();
    });
});
