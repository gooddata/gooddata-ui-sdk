// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { IntlWrapper } from "../../base/translations/IntlWrapper";
import {
    IntlTranslationsProvider,
    ITranslationsComponentProps,
} from "../../base/translations/TranslationsProvider";
import { fixEmptyHeaderItems2 } from "../_base/fixEmptyHeaderItems";
import { ILoadingInjectedProps, withEntireDataView } from "../_base/NewLoadingHOC";
import { IErrorProps } from "../../base/simple/ErrorComponent";
import { ILoadingProps } from "../../base/simple/LoadingComponent";
import { newErrorMapping, IErrorDescriptors } from "../../base/errors/errorHandling";
import { ICommonChartProps, ICoreChartProps } from "../chartProps";
import HeadlineTransformation from "./internal/HeadlineTransformation";
import { defaultCoreChartProps } from "../_commons/defaultProps";
import { ErrorCodes } from "../../base/errors/GoodDataSdkError";

type Props = ICoreChartProps & ILoadingInjectedProps;
export class HeadlineStateless extends React.Component<Props, {}> {
    public static defaultProps: Partial<ICommonChartProps> = defaultCoreChartProps;

    private errorMap: IErrorDescriptors;

    constructor(props: Props) {
        super(props);
        this.errorMap = newErrorMapping(props.intl);
    }

    public render(): JSX.Element {
        const { dataView, error, isLoading } = this.props;

        const ErrorComponent = this.props.ErrorComponent as React.ComponentType<IErrorProps>;
        const LoadingComponent = this.props.LoadingComponent as React.ComponentType<ILoadingProps>;

        if (error) {
            const errorProps = this.errorMap[
                this.errorMap.hasOwnProperty(error) ? error : ErrorCodes.UNKNOWN_ERROR
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
                        // TODO: SDK8: evil; fix this conceptually
                        fixEmptyHeaderItems2(dataView, props.emptyHeaderString);

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

export const CoreHeadline = withEntireDataView(HeadlineStateless);
