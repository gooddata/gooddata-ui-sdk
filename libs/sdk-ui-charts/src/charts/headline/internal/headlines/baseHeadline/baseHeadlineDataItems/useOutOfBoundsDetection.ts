// (C) 2025 GoodData Corporation

import {
    type RefObject,
    createRef,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { shouldRenderPagination } from "@gooddata/sdk-ui-vis-commons";

import { getCompareSectionClasses } from "../../../utils/HeadlineDataItemUtils.js";
import { useBaseHeadline } from "../BaseHeadlineContext.js";

export const useOutOfBoundsDetection = (
    onValueOverflow?: (isOverflowing: boolean) => void,
    measurementTrigger?: number,
) => {
    const div = useRef<HTMLDivElement>(null);
    const lastReportedValue = useRef<boolean | null>(null);
    const measurementTimeoutId = useRef<number | null>(null);
    const callbackRef = useRef(onValueOverflow);
    const hasMeasured = useRef(false);

    // Keep callback ref updated without causing re-runs of effects
    callbackRef.current = onValueOverflow;

    const handler = useCallback(() => {
        const element = div.current;
        if (!element || !callbackRef.current) {
            return;
        }

        const { scrollWidth, clientWidth } = element;
        const isOverflowing = scrollWidth > clientWidth;

        // Only call the callback if the value has actually changed OR if this is the first measurement
        if (lastReportedValue.current !== isOverflowing || !hasMeasured.current) {
            lastReportedValue.current = isOverflowing;
            hasMeasured.current = true;
            callbackRef.current(isOverflowing);
        }
    }, []);

    // Only measure once after the component mounts and layout is complete
    useLayoutEffect(() => {
        // Clear any existing timeout
        if (measurementTimeoutId.current) {
            clearTimeout(measurementTimeoutId.current);
        }

        // Schedule measurement after layout is complete, but only if we haven't measured yet
        if (!hasMeasured.current) {
            measurementTimeoutId.current = setTimeout(() => {
                handler();
            }, 0) as unknown as number; // fix node vs. browser type mismatch
        }

        return () => {
            if (measurementTimeoutId.current) {
                clearTimeout(measurementTimeoutId.current);
            }
        };
    }, [handler]);

    // Trigger remeasurement when the measurement trigger changes
    useEffect(() => {
        if (measurementTrigger !== undefined && measurementTrigger > 0) {
            // Reset the measurement state to force a new measurement
            hasMeasured.current = false;
            lastReportedValue.current = null;
            handler();
        }
    }, [measurementTrigger, handler]);

    return {
        containerRef: div,
    };
};

export interface IOverflowState {
    isSecondaryOverflow: boolean;
    isTertiaryOverflow: boolean;
    measurementComplete: boolean;
    measurementKey: number; // Used to trigger new measurements
    // Track which measurements we've received
    hasSecondaryMeasurement: boolean;
    hasTertiaryMeasurement: boolean;
}

const SIGNIFICANT_CHANGE_THRESHOLD_IN_PX = 5;

export const usePagination = (hasTertiaryItem: boolean) => {
    const { config, clientHeight, clientWidth } = useBaseHeadline();
    const { enableCompactSize } = config ?? {};

    const secondaryItemTitleWrapperRef = createRef<HTMLDivElement>();

    // Determine if the container is too small and need to render pagination based on its width and height
    const isContainerTooSmall = useMemo(
        () => shouldRenderPagination(enableCompactSize ?? false, clientWidth, clientHeight),
        [enableCompactSize, clientHeight, clientWidth],
    );

    // Determine the classes to apply to the compare section based on the container width
    const compareSectionClassNames = useMemo(
        () =>
            getCompareSectionClasses(clientWidth, secondaryItemTitleWrapperRef as RefObject<HTMLDivElement>),
        [clientWidth, secondaryItemTitleWrapperRef],
    );

    // Track overflow state in a single object to prevent race conditions
    const [overflowState, setOverflowState] = useState<IOverflowState>({
        isSecondaryOverflow: false,
        isTertiaryOverflow: false,
        measurementComplete: false,
        measurementKey: 0,
        hasSecondaryMeasurement: false,
        hasTertiaryMeasurement: false,
    });

    // Track resize state to coordinate with overflow measurements
    const isResizing = useRef(false);
    const resizeTimeoutId = useRef<number | null>(null);

    // Reset overflow state when dimensions change significantly
    const prevDimensions = useRef({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const prevWidth = prevDimensions.current.width || 0;
        const prevHeight = prevDimensions.current.height || 0;

        // Only reset if dimensions have actually changed and are valid
        // On the first render (prev = 0), always trigger if current dimensions are valid
        const isFirstRender = prevWidth === 0 && prevHeight === 0;
        const hasSignificantChange =
            Math.abs(clientWidth - prevWidth) > SIGNIFICANT_CHANGE_THRESHOLD_IN_PX ||
            Math.abs(clientHeight - prevHeight) > SIGNIFICANT_CHANGE_THRESHOLD_IN_PX;

        if (clientWidth > 0 && clientHeight > 0 && (isFirstRender || hasSignificantChange)) {
            setOverflowState((prev) => ({
                isSecondaryOverflow: false,
                isTertiaryOverflow: false,
                measurementComplete: false,
                measurementKey: prev.measurementKey + 1, // Increment to trigger new measurements
                hasSecondaryMeasurement: false,
                hasTertiaryMeasurement: false,
            }));
            isResizing.current = false;

            prevDimensions.current = { width: clientWidth, height: clientHeight };
        }
    }, [clientWidth, clientHeight]);

    // Handle overflow callback with coordination
    const handleOverflowCallback = useCallback(
        (field: "isSecondaryOverflow" | "isTertiaryOverflow") => (isOverflowing: boolean) => {
            // Don't update state if we're in the middle of a resize
            if (isResizing.current) {
                return;
            }

            setOverflowState((prevState) => {
                const newState = { ...prevState, [field]: isOverflowing };

                // Track which measurements we've received
                if (field === "isSecondaryOverflow") {
                    newState.hasSecondaryMeasurement = true;
                } else if (field === "isTertiaryOverflow") {
                    newState.hasTertiaryMeasurement = true;
                }

                // Mark the measurement complete only when ALL expected measurements are received
                if (hasTertiaryItem) {
                    // With tertiary item, we need BOTH secondary and tertiary measurements
                    newState.measurementComplete =
                        newState.hasSecondaryMeasurement && newState.hasTertiaryMeasurement;
                } else {
                    // With only secondary item, we only need the secondary measurement
                    newState.measurementComplete = newState.hasSecondaryMeasurement;
                }

                return newState;
            });
        },
        [hasTertiaryItem],
    );

    const handleSecondaryOverflow = handleOverflowCallback("isSecondaryOverflow");
    const handleTertiaryOverflow = handleOverflowCallback("isTertiaryOverflow");

    // Clean up any pending timeouts on component unmount
    useEffect(() => {
        return () => {
            if (resizeTimeoutId.current) {
                // we want to clear the timeout during component unmount, not matter what
                // eslint-disable-next-line react-hooks/exhaustive-deps
                clearTimeout(resizeTimeoutId.current);
            }
        };
    }, []);

    // Determine if we should use pagination based on built-in logic OR overflow detection
    const shouldUsePagination = useMemo(() => {
        // Always use built-in pagination logic if it applies
        if (isContainerTooSmall && hasTertiaryItem) {
            return true;
        }
        // Only use overflow-based pagination if the measurement is complete and there are overflows
        if (overflowState.measurementComplete && hasTertiaryItem) {
            return overflowState.isSecondaryOverflow || overflowState.isTertiaryOverflow;
        }
        return false;
    }, [isContainerTooSmall, hasTertiaryItem, overflowState]);

    const prevShouldUsePagination = useRef(shouldUsePagination);
    if (prevShouldUsePagination.current !== shouldUsePagination) {
        prevShouldUsePagination.current = shouldUsePagination;
    }

    return {
        shouldUsePagination,
        compareSectionClassNames,
        overflowState,
        handleSecondaryOverflow,
        handleTertiaryOverflow,
        secondaryItemTitleWrapperRef,
    };
};
