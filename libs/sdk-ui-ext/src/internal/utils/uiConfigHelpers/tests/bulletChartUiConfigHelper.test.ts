// (C) 2020 GoodData Corporation
import * as referencePointMock from "../../../tests/mocks/referencePointMocks";
import { getBulletChartUiConfig } from "../bulletChartUiConfigHelper";
import { createInternalIntl } from "../../internalIntlProvider";
import { DEFAULT_BULLET_CHART_CONFIG } from "../../../constants/uiConfig";
import { DefaultLocale, VisualizationTypes } from "@gooddata/sdk-ui";

describe("bulletChartUiConfigHelper", () => {
    describe("getBulletChartUiConfig", () => {
        const intl = createInternalIntl(DefaultLocale);
        const refPointMock = {
            ...referencePointMock.threeMeasuresBucketsReferencePoint,
            uiConfig: DEFAULT_BULLET_CHART_CONFIG,
        };

        it("should return bullet chart ui config", () => {
            const bulletChartUiConfig = getBulletChartUiConfig(refPointMock, intl, VisualizationTypes.BULLET);
            expect(bulletChartUiConfig).toMatchSnapshot();
        });
    });
});
