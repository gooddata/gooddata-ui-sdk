// (C) 2024-2025 GoodData Corporation

import {
    type ISemanticSearchRelationship,
    type ISemanticSearchResultItem,
    isSemanticSearchResultItem,
} from "@gooddata/sdk-model";
import {
    type IIconProps,
    IconAttribute,
    IconDashboard,
    IconDataset,
    IconDate,
    IconFact,
    IconLabel,
    IconMetric,
    type IconType,
    InsightIcon,
    UiIcon,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

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
                        return <IconDashboard {...props} />;
                    case "visualization":
                        return <InsightIcon visualizationUrl={visualizationUrl} iconProps={props} />;
                    case "dataset":
                        return <IconDataset {...props} />;
                    case "attribute":
                        return <IconAttribute {...props} />;
                    case "label":
                        return <IconLabel {...props} />;
                    case "fact":
                        return <IconFact {...props} />;
                    case "metric":
                        return <IconMetric {...props} />;
                    case "date":
                        return <IconDate {...props} />;
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
