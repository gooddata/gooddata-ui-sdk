// (C) 2025 GoodData Corporation

import { type ILegendDetails } from "@gooddata/sdk-ui-vis-commons";

import { type IAvailableLegends, type IGeoLegendItem } from "../../types/common/legends.js";
import { type IGeoCommonData } from "../../types/geoData/common.js";

export interface ILegendBodyProps {
    containerId: string;
    legendDetails: ILegendDetails | null;
    categoryItems: IGeoLegendItem[];
    geoData: IGeoCommonData | null;
    availableLegends: IAvailableLegends;
    colorLegendValue: string | null;
    legendWidth: number;
    legendHeight: number;
    isFluidLayout: boolean;
    responsive: boolean | "autoPositionWithPopup";
    onCategoryItemClick: (item: IGeoLegendItem) => void;
}
