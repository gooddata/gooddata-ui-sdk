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
import { generateErrorMap, IErrorMap } from "../../base/helpers/errorHandlers";
import { ICommonChartProps, ICoreChartProps } from "../chartProps";
import HeadlineTransformation from "./internal/HeadlineTransformation";
import { defaultCoreChartProps } from "../_commons/defaultProps";
import { ErrorStates } from "../../base/constants/errorStates";

type Props = ICoreChartProps & ILoadingInjectedProps;
export class HeadlineStateless extends React.Component<Props, {}> {
    public static defaultProps: Partial<ICommonChartProps> = defaultCoreChartProps;

    private errorMap: IErrorMap;

    constructor(props: Props) {
        super(props);
        this.errorMap = generateErrorMap(props.intl);
    }

    public render(): JSX.Element {
        const { dataView, error, isLoading } = this.props;

        const ErrorComponent = this.props.ErrorComponent as React.ComponentType<IErrorProps>;
        const LoadingComponent = this.props.LoadingComponent as React.ComponentType<ILoadingProps>;

        if (error) {
            const errorProps = this.errorMap[
                this.errorMap.hasOwnProperty(error) ? error : ErrorStates.UNKNOWN_ERROR
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
