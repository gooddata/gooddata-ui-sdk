// (C) 2020-2022 GoodData Corporation
import { getOptimalAlignment, getOptimalAlignmentForRegion } from "../overlay";

function generateOverlay() {
    const boundaryRegion = {
        top: 100,
        left: 100,
        width: 1000,
        height: 1000,
    };

    const targetRegion = {
        top: 900,
        left: 900,
        width: 100,
        height: 100,
    };

    const selfRegion = {
        top: 0,
        left: 0,
        width: 200,
        height: 200,
    };

    const alignPoints = [
        {
            align: "tr tl",
        },
        {
            align: "tl tr",
        },
    ];

    return {
        boundaryRegion,
        targetRegion,
        selfRegion,
        alignPoints,
    };
}

function generateOverlayWithCustomAlign(align: string) {
    const boundaryRegion = {
        top: 0,
        left: 0,
        width: 1000,
        height: 1000,
    };

    const targetRegion = {
        top: 50,
        left: 50,
        width: 100,
        height: 100,
    };

    const selfRegion = {
        top: 0,
        left: 0,
        width: 200,
        height: 200,
    };

    const alignPoints = [
        {
            align,
        },
    ];

    return {
        boundaryRegion,
        targetRegion,
        selfRegion,
        alignPoints,
    };
}

describe("Overlay utils", () => {
    it("should align inside document when aligned element is outside of the viewport", () => {
        const { alignPoints, targetRegion, selfRegion } = generateOverlay();

        const getViewportRegion = () => ({
            left: 0,
            top: 0,
            width: 500,
            height: 500,
        });

        const getDocumentRegion = () => ({
            left: 0,
            top: 0,
            width: 1000,
            height: 2500,
        });

        const optimalAlignment = getOptimalAlignment({
            targetRegion,
            selfRegion,
            alignPoints,
            getViewportRegion,
            getDocumentRegion,
        });

        expect(optimalAlignment).toMatchSnapshot();
    });

    describe("without offset", () => {
        it("should use second alignPoint because it would be hidden or partially visible using the first one", () => {
            const { boundaryRegion, targetRegion, selfRegion, alignPoints } = generateOverlay();
            const optimalAlignment = getOptimalAlignmentForRegion({
                boundaryRegion,
                targetRegion,
                selfRegion,
                alignPoints,
                overlayRootElement: document.body,
            });

            expect(optimalAlignment).toMatchSnapshot();
        });

        it("should use first alignPoint because aligned node fits fully into viewport", () => {
            const { boundaryRegion, targetRegion, alignPoints } = generateOverlay();

            const smallerSelfRegion = {
                width: 100,
                height: 100,
                top: 0,
                left: 0,
            };

            const optimalAlignPoint = getOptimalAlignmentForRegion({
                boundaryRegion,
                targetRegion,
                selfRegion: smallerSelfRegion,
                alignPoints,
                overlayRootElement: document.body,
            });

            expect(optimalAlignPoint).toEqual({
                alignment: {
                    left: 1000,
                    right: 0,
                    top: 900,
                    align: "tr tl",
                },
                visiblePart: 1,
            });
        });

        it("should use best result when node is not fully visible in any case", () => {
            const { boundaryRegion, targetRegion, alignPoints } = generateOverlay();

            const biggerSelfRegion = {
                width: 500,
                height: 500,
                top: 0,
                left: 0,
            };

            const optimalAlignPoint = getOptimalAlignmentForRegion({
                boundaryRegion,
                targetRegion,
                selfRegion: biggerSelfRegion,
                alignPoints,
                overlayRootElement: document.body,
            });

            expect(optimalAlignPoint).toEqual({
                alignment: {
                    left: 400,
                    right: 200,
                    top: 900,
                    align: "tl tr",
                },
                visiblePart: 0.4,
            });
        });
    });

    describe("with offset", () => {
        const alignPointsWithOffset = [
            {
                align: "tr tl",
                offset: {
                    x: -100,
                    y: -100,
                },
            },
            {
                align: "tl tr",
                offset: {
                    x: 0,
                    y: -100,
                },
            },
        ];

        it("should use first alignPoint because aligned node fits fully into viewport thanks to negative offset", () => {
            const { boundaryRegion, targetRegion, selfRegion } = generateOverlay();
            const optimalAlignPoint = getOptimalAlignmentForRegion({
                boundaryRegion,
                targetRegion,
                selfRegion,
                alignPoints: alignPointsWithOffset,
                overlayRootElement: document.body,
            });

            expect(optimalAlignPoint).toEqual({
                alignment: {
                    left: 900,
                    right: 0,
                    top: 800,
                    align: "tr tl",
                },
                visiblePart: 1,
            });
        });

        it("should use second alignPoint because aligned node does not fit into viewport using first alignPoint", () => {
            const { boundaryRegion, targetRegion } = generateOverlay();
            const biggerSelfRegion = {
                width: 300,
                height: 300,
                top: 0,
                left: 0,
            };

            const optimalAlignPoint = getOptimalAlignmentForRegion({
                boundaryRegion,
                targetRegion,
                selfRegion: biggerSelfRegion,
                alignPoints: alignPointsWithOffset,
                overlayRootElement: document.body,
            });

            expect(optimalAlignPoint).toEqual({
                alignment: {
                    left: 600,
                    right: 200,
                    top: 800,
                    align: "tl tr",
                },
                visiblePart: 1,
            });
        });
    });

    describe("Alignment computing", () => {
        it("should align overlay to given node top-left both", () => {
            const align = "tl tl";

            const { boundaryRegion, targetRegion, selfRegion, alignPoints } =
                generateOverlayWithCustomAlign(align);
            const optimalAlignment = getOptimalAlignmentForRegion({
                boundaryRegion,
                targetRegion,
                selfRegion,
                alignPoints,
                overlayRootElement: document.body,
            });

            expect(optimalAlignment).toMatchSnapshot();
        });

        it("should align overlay top left to given node center-center", () => {
            const align = "cc tl";

            const { boundaryRegion, targetRegion, selfRegion, alignPoints } =
                generateOverlayWithCustomAlign(align);
            const optimalAlignment = getOptimalAlignmentForRegion({
                boundaryRegion,
                targetRegion,
                selfRegion,
                alignPoints,
                overlayRootElement: document.body,
            });

            expect(optimalAlignment).toMatchSnapshot();
        });

        it("should align overlay center-center to given node bottom right", () => {
            const align = "br cc";

            const { boundaryRegion, targetRegion, selfRegion, alignPoints } =
                generateOverlayWithCustomAlign(align);
            const optimalAlignment = getOptimalAlignmentForRegion({
                boundaryRegion,
                targetRegion,
                selfRegion,
                alignPoints,
                overlayRootElement: document.body,
            });

            expect(optimalAlignment).toMatchSnapshot();
        });

        it("should align overlay bottom-left to given node bottom-right", () => {
            const align = "br bl";

            const { boundaryRegion, targetRegion, selfRegion, alignPoints } =
                generateOverlayWithCustomAlign(align);
            const optimalAlignment = getOptimalAlignmentForRegion({
                boundaryRegion,
                targetRegion,
                selfRegion,
                alignPoints,
                overlayRootElement: document.body,
            });

            expect(optimalAlignment).toMatchSnapshot();
        });
    });
});
