// (C) 2007-2025 GoodData Corporation

import { ReactElement, useMemo } from "react";

import {
    ErrorCodes,
    IErrorDescriptors,
    ILoadingInjectedProps,
    IntlWrapper,
    newErrorMapping,
    withEntireDataView,
} from "@gooddata/sdk-ui";

import XirrTransformation from "./internal/XirrTransformation.js";
import { ICoreChartProps } from "../../interfaces/index.js";
import { withDefaultCoreChartProps } from "../_commons/defaultProps.js";

type Props = ICoreChartProps & ILoadingInjectedProps;

function XirrStateless(props: Props): ReactElement {
    const { dataView, error, isLoading, intl, afterRender, drillableItems, locale, onDrill, config } =
        withDefaultCoreChartProps(props);

    const errorMap: IErrorDescriptors = useMemo(() => newErrorMapping(intl), [intl]);

    const ErrorComponent = props.ErrorComponent;
    const LoadingComponent = props.LoadingComponent;

    if (error) {
        const errorProps =
            errorMap[
                Object.prototype.hasOwnProperty.call(errorMap, error) ? error : ErrorCodes.UNKNOWN_ERROR
            ];
        return ErrorComponent ? <ErrorComponent code={error} {...errorProps} /> : null;
    }

    // when in pageable mode (getPage present) never show loading (its handled by the component)
    if (isLoading || !dataView) {
        return LoadingComponent ? <LoadingComponent /> : null;
    }

    return (
        <IntlWrapper locale={locale}>
            <XirrTransformation
                dataView={dataView}
                onAfterRender={afterRender}
                onDrill={onDrill}
                drillableItems={drillableItems}
                config={config}
            />
        </IntlWrapper>
    );
}

/**
 * NOTE: exported to satisfy sdk-ui-ext; is internal, must not be used outside of SDK; will disapppear.
 *
 * @internal
 */
export const CoreXirr = withEntireDataView(XirrStateless);
