// (C) 2023-2026 GoodData Corporation

import { type ComponentClass, type ComponentType } from "react";

/**
 * This HOC enables to extract effective props passed to the wrapped component
 */
export const withPropsExtractor = () => {
    let effectiveProps: any;
    const extractProps = () => effectiveProps;
    return {
        wrap: (Component: ComponentType) => (props: any) => {
            effectiveProps = { ...(Component as unknown as ComponentClass)["defaultProps"], ...props };
            return <Component {...props} />;
        },
        extractProps,
    };
};

/**
 * Same as {@link withPropsExtractor}, except the captured props are scoped to a single mount instead of
 * being kept in one shared slot.
 *
 * The shared-slot variant above is 'last render wins', so callers must serialize their mounts to read the
 * props back reliably. This variant lets a suite kick off many mounts up-front and await them together,
 * which matters for the scenario suites where every mount waits on its own backend-capture timer.
 */
export const withScopedPropsExtractor = () => {
    let currentSlot: { props?: any } | undefined;

    return {
        wrap: (Component: ComponentType) => (props: any) => {
            if (currentSlot) {
                currentSlot.props = {
                    ...(Component as unknown as ComponentClass)["defaultProps"],
                    ...props,
                };
            }

            return <Component {...props} />;
        },
        /**
         * Runs `mount` with a dedicated capture slot active, handing it an extractor for the props recorded
         * into that slot. The slot is only active for the synchronous part of `mount`, so this relies on the
         * mount rendering the wrapped component synchronously - which is how the scenario mounts behave.
         */
        captureProps: <T,>(mount: (extractProps: () => any) => T): T => {
            const slot: { props?: any } = {};
            const previousSlot = currentSlot;
            currentSlot = slot;

            try {
                return mount(() => slot.props);
            } finally {
                currentSlot = previousSlot;
            }
        },
    };
};
