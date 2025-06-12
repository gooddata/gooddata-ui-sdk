// (C) 2020 GoodData Corporation
import omit from "lodash/omit.js";
import isEmpty from "lodash/isEmpty.js";
import { IAxisConfig, IChartConfig } from "@gooddata/sdk-ui-charts";
import { IGeoConfig } from "@gooddata/sdk-ui-geo";
import { attributeDisplayFormRef, isUriRef } from "@gooddata/sdk-model";

const ConfigNotApplicableInInsight: Array<keyof IChartConfig | keyof IGeoConfig> = [
    "colorPalette",
    "colors",
    "separators",
    "limits",
    "type",
    "mapboxToken",
];
const AxisAlignmentMapping = {
    x: {
        low: "left",
        middle: "center",
        high: "right",
    },
    y: {
        low: "bottom",
        middle: "center",
        high: "top",
    },
};

function chartConfigToControls(chartConfig: IChartConfig): any {
    const xaxis = chartConfig.xaxis ? { xaxis: axisNameAlignmentCorrection("x", chartConfig.xaxis) } : {};
    const secondary_xaxis = chartConfig.secondary_xaxis
        ? { secondary_xaxis: axisNameAlignmentCorrection("x", chartConfig.secondary_xaxis) }
        : {};
    const yaxis = chartConfig.yaxis ? { yaxis: axisNameAlignmentCorrection("y", chartConfig.yaxis) } : {};
    const secondary_yaxis = chartConfig.secondary_yaxis
        ? { secondary_yaxis: axisNameAlignmentCorrection("y", chartConfig.secondary_yaxis) }
        : {};

    return {
        ...chartConfig,
        ...xaxis,
        ...secondary_xaxis,
        ...yaxis,
        ...secondary_yaxis,
    };
}

/**
 * Transforms chart config to visualization properties as stored in insight. This is a simple transformation
 * that strips away those config props which are not applicable for plug viz.
 *
 * @param chartConfig - may be undefined
 */
export function chartConfigToVisProperties(chartConfig: IChartConfig = {}): any {
    const cleanedConfig = omit(chartConfig, ConfigNotApplicableInInsight);
    const controls = chartConfigToControls(cleanedConfig);

    return { controls };
}

export function geoChartConfigToVisProperties(chartConfig: IGeoConfig): any {
    const cleanedConfig = omit(chartConfig, ConfigNotApplicableInInsight);
    const controls = geoChartConfigToControls(cleanedConfig);

    return { controls };
}

/*
                                 __    _
                            _wr""        "-q__
                         _dP                 9m_
                       _#P                     9#_
                      d#@                       9#m
                     d##                         ###
                    J###                         ###L
                    {###K                       J###K
                    ]####K      ___aaa___      J####F
                __gmM######_  w#P""   ""9#m  _d#####Mmw__
             _g##############mZ_         __g##############m_
           _d####M@PPPP@@M#######Mmp gm#########@@PPP9@M####m_
          a###""          ,Z"#####@" '######"\g          ""M##m
         J#@"             0L  "*##     ##@"  J#              *#K
         #"               `#    "_gmwgm_~    dF               `#_
        7F                 "#_   ]#####F   _dK                 JE
        ]                    *m__ ##### __g@"                   F
                               "PJ#####LP"
         `                       0######_                      '
                               _0########_
             .               _d#####^#####m__              ,
              "*w_________am#####P"   ~9#####mw_________w*"
                  ""9@#####@M""           ""P@#####@M""


   If you find yourself adding code below this line, then it means your component is not designed
   correctly.
 */

/*
 * This compensates for unnecessary translation of one enum to another; where the other enum is used so that meaningful
 * name/desc can be shown on the UI. This should have been a view-only concern that for some reason rippled down and
 * the translated enum has to be stored.
 */
function axisNameAlignmentCorrection(axisType: "x" | "y", axisConfig?: IAxisConfig): any {
    if (!axisConfig || isEmpty(axisConfig)) {
        return {};
    }

    const nameAlignment = axisConfig.name?.position;

    if (!nameAlignment) {
        return axisConfig;
    }

    return {
        ...axisConfig,
        name: {
            position: AxisAlignmentMapping[axisType][nameAlignment],
        },
    };
}

/*
 * This compensates for.. idk probably inability of AD to 'silently' create buckets. Possibly hints that the
 * plug vis SPI is missing some functions that would delegate this concern to the plug viz implementation. And so
 * URI of display form to use for tooltip gets stored in properties and then plug viz has to construct the bucket for
 * tooltip display form.
 *
 * This follows into the React component, which has the tooltip display form as config property - instead of just
 * a bucket. The react component config uses IAttribute, and so to compensate, the URI has to be extracted and
 * stored in properties.
 *
 * Note: the problem here is not the different types. it is the entire existence of the property.
 */
function geoChartConfigToControls(chartConfig: Partial<IGeoConfig>): any {
    const { tooltipText } = chartConfig;
    if (tooltipText) {
        const ref = attributeDisplayFormRef(tooltipText);

        return {
            ...chartConfig,
            tooltipText: isUriRef(ref) ? ref.uri : ref.identifier,
        };
    }

    return chartConfig;
}
