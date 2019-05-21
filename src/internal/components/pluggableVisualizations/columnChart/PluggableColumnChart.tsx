// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import { PluggableColumnBarCharts } from "../PluggableColumnBarCharts";
import { AXIS, AXIS_NAME } from "../../../constants/axis";
import {
    COLUMN_CHART_SUPPORTED_PROPERTIES,
    OPTIONAL_STACKING_PROPERTIES,
} from "../../../constants/supportedProperties";
import {
    COLUMN_BAR_CHART_UICONFIG_WITH_OPTIONAL_STACKING,
    DEFAULT_COLUMN_CHART_UICONFIG,
} from "../../../constants/uiConfig";
import { IVisConstruct, IUiConfig } from "../../../interfaces/Visualization";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";

export class PluggableColumnChart extends PluggableColumnBarCharts {
    constructor(props: IVisConstruct) {
        super(props);
        this.secondaryAxis = AXIS_NAME.SECONDARY_Y;
        this.type = VisualizationTypes.COLUMN;
        this.defaultControlsProperties = this.isOptionalStackingEnabled()
            ? {
                  stackMeasures: false,
              }
            : {};
        this.initializeProperties(props.visualizationProperties);
    }

    public getUiConfig(): IUiConfig {
        if (this.isOptionalStackingEnabled()) {
            return cloneDeep(COLUMN_BAR_CHART_UICONFIG_WITH_OPTIONAL_STACKING);
        }

        return cloneDeep(DEFAULT_COLUMN_CHART_UICONFIG);
    }

    public getSupportedPropertiesList() {
        const supportedPropertiesList = COLUMN_CHART_SUPPORTED_PROPERTIES[this.axis || AXIS.DUAL] || [];
        return this.isOptionalStackingEnabled()
            ? [...supportedPropertiesList, ...OPTIONAL_STACKING_PROPERTIES]
            : supportedPropertiesList;
    }
}
