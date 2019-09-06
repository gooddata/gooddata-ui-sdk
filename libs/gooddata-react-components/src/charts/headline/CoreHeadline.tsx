// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { ErrorStates } from "../..";
import { IntlWrapper } from "../../components/core/base/IntlWrapper";
import {
    IntlTranslationsProvider,
    ITranslationsComponentProps,
} from "../../components/core/base/TranslationsProvider";
import { fixEmptyHeaderItems2 } from "../../components/core/base/utils/fixEmptyHeaderItems";
import { withEntireDataView } from "../../components/exp/NewLoadingHOC";
import { IErrorProps } from "../../components/simple/ErrorComponent";
import { ILoadingProps } from "../../components/simple/LoadingComponent";
import { generateErrorMap, IErrorMap } from "../../helpers/errorHandlers";
import { HeadlinePropTypes, Requireable } from "../../proptypes/Headline";
import {
    defaultCommonVisProps,
    IChartProps,
    ICommonVisualizationProps,
    ILoadingInjectedProps,
} from "../chartProps";
import HeadlineTransformation from "./internal/HeadlineTransformation";

export { Requireable };

type Props = IChartProps & ILoadingInjectedProps;
export class HeadlineStateless extends React.Component<Props, {}> {
    public static defaultProps: Partial<ICommonVisualizationProps> = defaultCommonVisProps;

    public static propTypes = HeadlinePropTypes;

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
        const { afterRender, drillableItems, locale, dataView, onFiredDrillEvent, config } = this.props;

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
                                onFiredDrillEvent={onFiredDrillEvent}
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
