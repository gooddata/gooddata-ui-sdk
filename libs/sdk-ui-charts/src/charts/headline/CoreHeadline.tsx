// (C) 2007-2018 GoodData Corporation
import React from "react";
import { fixEmptyHeaderItems } from "@gooddata/sdk-ui-vis-commons";
import {
    newErrorMapping,
    IErrorDescriptors,
    IntlTranslationsProvider,
    ITranslationsComponentProps,
    IntlWrapper,
    ErrorCodes,
    ILoadingInjectedProps,
    withEntireDataView,
} from "@gooddata/sdk-ui";
import { ICoreChartProps } from "../../interfaces";
import HeadlineTransformation from "./internal/HeadlineTransformation";
import { defaultCoreChartProps } from "../_commons/defaultProps";

type Props = ICoreChartProps & ILoadingInjectedProps;
export class HeadlineStateless extends React.Component<Props> {
    public static defaultProps = defaultCoreChartProps;

    private errorMap: IErrorDescriptors;

    constructor(props: Props) {
        super(props);
        this.errorMap = newErrorMapping(props.intl);
    }

    public render(): JSX.Element {
        const { dataView, error, isLoading } = this.props;

        const ErrorComponent = this.props.ErrorComponent;
        const LoadingComponent = this.props.LoadingComponent;

        if (error) {
            const errorProps =
                this.errorMap[
                    Object.prototype.hasOwnProperty.call(this.errorMap, error)
                        ? error
                        : ErrorCodes.UNKNOWN_ERROR
                ];
            return ErrorComponent ? <ErrorComponent code={error} {...errorProps} /> : null;
        }

        // when in pageble mode (getPage present) never show loading (its handled by the component)
        if (isLoading || !dataView) {
            return LoadingComponent ? <LoadingComponent /> : null;
        }

        return this.renderVisualization();
    }

    protected renderVisualization(): JSX.Element {
        const { afterRender, drillableItems, locale, dataView, onDrill, config } = this.props;

        return (
            <IntlWrapper locale={locale}>
                <IntlTranslationsProvider>
                    {(props: ITranslationsComponentProps) => {
                        // TODO: evil; fix this conceptually
                        fixEmptyHeaderItems(dataView, `(${props.emptyHeaderString})`);

                        return (
                            <HeadlineTransformation
                                dataView={dataView}
                                onAfterRender={afterRender}
                                onDrill={onDrill}
                                drillableItems={drillableItems}
                                config={config}
                            />
                        );
                    }}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }
}

/**
 * NOTE: exported to satisfy sdk-ui-ext; is internal, must not be used outside of SDK; will disapppear.
 *
 * @internal
 */
export const CoreHeadline = withEntireDataView(HeadlineStateless);
