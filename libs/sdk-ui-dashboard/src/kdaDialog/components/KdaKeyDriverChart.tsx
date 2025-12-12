// (C) 2025 GoodData Corporation

import cx from "classnames";
import noop from "lodash-es/noop.js";
import { useIntl } from "react-intl";

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type ObjRef } from "@gooddata/sdk-model";
import { type IChartConfig } from "@gooddata/sdk-ui-charts";
import { RawChart } from "@gooddata/sdk-ui-charts/internal";
import { UiSkeleton, useElementSize } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { useDrillAttributeHandler } from "../composition/hooks/useDrillAttributeHandler.js";

export interface KdaKeyDriverChartProps {
    config: IChartConfig | null;
    dataView: IDataView | null;
    displayForm?: ObjRef | null;
}

export function KdaKeyDriverChart({ config, dataView, displayForm }: KdaKeyDriverChartProps) {
    const intl = useIntl();
    const theme = useTheme();

    const { ref, width, height } = useElementSize<HTMLDivElement>();
    const { onDrillCallback } = useDrillAttributeHandler();

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
                    drillableItems={displayForm ? [displayForm] : []}
                    onDrill={onDrillCallback}
                    onLegendReady={noop}
                    afterRender={noop}
                    onDataTooLarge={noop}
                    onNegativeValues={noop}
                    theme={theme}
                />
            ) : (
                <UiSkeleton itemWidth={width} itemHeight={height} />
            )}
        </div>
    );
}
