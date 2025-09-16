// (C) 2007-2025 GoodData Corporation

import { ComponentType, ReactElement, useMemo } from "react";

import {
    ErrorCodes,
    IErrorDescriptors,
    ILoadingInjectedProps,
    IntlWrapper,
    newErrorMapping,
    withEntireDataView,
} from "@gooddata/sdk-ui";

import { IHeadlineTransformationProps } from "./HeadlineProvider.js";
import { ICoreChartProps } from "../../interfaces/index.js";
import { withDefaultCoreChartProps } from "../_commons/defaultProps.js";

/**
 * @internal
 */
interface ICoreHeadlineExtendedProps {
    headlineTransformation: ComponentType<IHeadlineTransformationProps>;
}

type CoreHeadlineProps = ICoreChartProps & ILoadingInjectedProps & ICoreHeadlineExtendedProps;

function HeadlineStateless(props: CoreHeadlineProps): ReactElement {
    const {
        dataView,
        error,
        isLoading,
        ErrorComponent,
        LoadingComponent,
        afterRender,
        drillableItems,
        locale,
        onDrill,
        config = {},
        headlineTransformation: HeadlineTransformation,
        intl,
    } = withDefaultCoreChartProps(props);

    const errorMap: IErrorDescriptors = useMemo(() => newErrorMapping(intl), [intl]);

    const renderVisualization = (): ReactElement => {
        return (
            <IntlWrapper locale={locale}>
                <HeadlineTransformation
                    dataView={dataView}
                    onAfterRender={afterRender}
                    onDrill={onDrill}
                    drillableItems={drillableItems}
                    config={config}
                />
            </IntlWrapper>
        );
    };

    if (error) {
        const errorProps =
            errorMap[
                Object.prototype.hasOwnProperty.call(errorMap, error) ? error : ErrorCodes.UNKNOWN_ERROR
            ];
        return ErrorComponent ? <ErrorComponent code={error} {...errorProps} /> : null;
    }

    // when in pageble mode (getPage present) never show loading (its handled by the component)
    if (isLoading || !dataView) {
        return LoadingComponent ? <LoadingComponent /> : null;
    }

    return renderVisualization();
}

/**
 * @internal
 */
const CoreHeadline = withEntireDataView(HeadlineStateless);

/**
 * NOTE: exported to satisfy sdk-ui-ext; is internal, must not be used outside of SDK; will disapppear.
 */
export type { ICoreHeadlineExtendedProps };
export { CoreHeadline };
