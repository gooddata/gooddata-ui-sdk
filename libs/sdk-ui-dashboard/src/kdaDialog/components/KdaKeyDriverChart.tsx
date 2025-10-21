// (C) 2025 GoodData Corporation

import cx from "classnames";
import noop from "lodash-es/noop.js";
import { useIntl } from "react-intl";

import { IDataView } from "@gooddata/sdk-backend-spi";
import { IChartConfig } from "@gooddata/sdk-ui-charts";
import { RawChart } from "@gooddata/sdk-ui-charts/internal";
import { UiSkeleton, useElementSize } from "@gooddata/sdk-ui-kit";

export interface KdaKeyDriverChartProps {
    config: IChartConfig | null;
    dataView: IDataView | null;
}

export function KdaKeyDriverChart({ config, dataView }: KdaKeyDriverChartProps) {
    const intl = useIntl();

    const { ref, width, height } = useElementSize<HTMLDivElement>();

    return (
        <div className={cx("gd-kda-key-drivers-detail-visualisation-container")} ref={ref}>
            {config && dataView ? (
                <RawChart
                    type="combo"
                    locale={intl.locale}
                    width={width}
                    height={height}
                    config={config}
                    dataView={dataView}
                    drillableItems={[]}
                    onDrill={noop}
                    onLegendReady={noop}
                    afterRender={noop}
                    onDataTooLarge={noop}
                    onNegativeValues={noop}
                />
            ) : (
                <UiSkeleton itemWidth={width} itemHeight={height} />
            )}
        </div>
    );
}
