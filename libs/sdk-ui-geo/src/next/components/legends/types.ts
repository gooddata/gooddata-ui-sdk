// (C) 2025 GoodData Corporation

import { ILegendDetails, IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import { IAvailableLegends, IGeoData } from "../../types/shared.js";

export interface ILegendBodyProps {
    containerId: string;
    legendDetails: ILegendDetails | null;
    categoryItems: IPushpinCategoryLegendItem[];
    geoData: IGeoData | null;
    availableLegends: IAvailableLegends;
    colorLegendValue: string | null;
    legendWidth: number;
    legendHeight: number;
    isFluidLayout: boolean;
    responsive: boolean | "autoPositionWithPopup";
    onCategoryItemClick: (item: IPushpinCategoryLegendItem) => void;
}
