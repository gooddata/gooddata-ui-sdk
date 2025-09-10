// (C) 2024-2025 GoodData Corporation

import React from "react";

import {
    type ISemanticSearchRelationship,
    type ISemanticSearchResultItem,
    isSemanticSearchResultItem,
} from "@gooddata/sdk-model";
import { IIconProps, Icon, type IconType, InsightIcon, UiIcon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

const {
    Dashboard: DashboardIcon,
    Dataset: DatasetIcon,
    Attribute: AttributeIcon,
    Label: LabelIcon,
    Fact: FactIcon,
    Metric: MetricIcon,
    Date: DateIcon,
} = Icon;

type Props = {
    item: ISemanticSearchResultItem | ISemanticSearchRelationship;
    icon?: IconType;
};

/**
 * Pick an icon according to the item type.
 */
export function SearchItemIcon({ item, icon }: Props) {
    const theme = useTheme();

    if (icon) {
        return <UiIcon type={icon} color="complementary-5" />;
    }

    const props: IIconProps = {
        color: theme?.palette?.complementary?.c5 ?? "#B0BECA",
        ariaHidden: true,
    };
    const type = isSemanticSearchResultItem(item) ? item.type : item.sourceObjectType;
    const visualizationUrl = isSemanticSearchResultItem(item) ? item.visualizationUrl : undefined;

    return (
        <div aria-label={type} role="img">
            {(() => {
                switch (type) {
                    case "dashboard":
                        return <DashboardIcon {...props} />;
                    case "visualization":
                        return <InsightIcon visualizationUrl={visualizationUrl} iconProps={props} />;
                    case "dataset":
                        return <DatasetIcon {...props} />;
                    case "attribute":
                        return <AttributeIcon {...props} />;
                    case "label":
                        return <LabelIcon {...props} />;
                    case "fact":
                        return <FactIcon {...props} />;
                    case "metric":
                        return <MetricIcon {...props} />;
                    case "date":
                        return <DateIcon {...props} />;
                    default:
                        return exhaustiveCheck(type);
                }
            })()}
        </div>
    );
}

const exhaustiveCheck = (type: never): never => {
    throw new Error(`Unknown item type: ${type}`);
};
