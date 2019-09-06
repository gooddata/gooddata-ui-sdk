// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import HeadlineTransformation from "./internal/HeadlineTransformation";
import { IntlWrapper } from "../../components/core/base/IntlWrapper";
import {
    IntlTranslationsProvider,
    ITranslationsComponentProps,
} from "../../components/core/base/TranslationsProvider";
import { fixEmptyHeaderItems } from "../../components/core/base/utils/fixEmptyHeaderItems";
import { HeadlinePropTypes, Requireable } from "../../proptypes/Headline";
import { IDataSourceProviderInjectedProps } from "../../components/afm/DataSourceProvider";
import {
    ICommonVisualizationProps,
    visualizationLoadingHOC,
    ILoadingInjectedProps,
    commonDefaultProps,
} from "../../components/core/base/VisualizationLoadingHOC";
import { BaseVisualization } from "../../components/core/base/BaseVisualization";

export { Requireable };

export class HeadlineStateless extends BaseVisualization<
    ICommonVisualizationProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps,
    {}
> {
    public static defaultProps: Partial<ICommonVisualizationProps> = commonDefaultProps;

    public static propTypes = HeadlinePropTypes;

    protected renderVisualization(): JSX.Element {
        const {
            afterRender,
            drillableItems,
            locale,
            dataSource,
            resultSpec,
            execution,
            onFiredDrillEvent,
            config,
        } = this.props;

        return (
            <IntlWrapper locale={locale}>
                <IntlTranslationsProvider>
                    {(props: ITranslationsComponentProps) => (
                        <HeadlineTransformation
                            onAfterRender={afterRender}
                            onFiredDrillEvent={onFiredDrillEvent}
                            drillableItems={drillableItems}
                            config={config}
                            executionRequest={{
                                afm: dataSource.getAfm(),
                                resultSpec,
                            }}
                            executionResponse={execution.executionResponse}
                            executionResult={fixEmptyHeaderItems(
                                execution.executionResult,
                                props.emptyHeaderString,
                            )}
                        />
                    )}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }
}

export const CoreHeadline = visualizationLoadingHOC(HeadlineStateless);
