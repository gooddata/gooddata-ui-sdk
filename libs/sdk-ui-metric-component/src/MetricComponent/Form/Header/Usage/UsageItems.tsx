// (C) 2021-2026 GoodData Corporation

import { type PropsWithChildren, useCallback } from "react";

import {
    type IInsight,
    type IMetadataObject,
    areObjRefsEqual,
    isInsight,
    isMeasureMetadataObject,
} from "@gooddata/sdk-model";
import { IconExternalLink, IconInsight, Item } from "@gooddata/sdk-ui-kit";

import { type DefaultTheme, makeStyles } from "../../../../shared/theme/index.js";

const useStyles = makeStyles()((theme: DefaultTheme) => {
    return {
        item: {
            padding: "4px !important",
            cursor: "initial",

            "&:hover": {
                svg: {
                    display: "block",
                },
            },
        },
        active: {
            p: {
                fontWeight: "bold",
                color: theme.globals.colors.active,

                "svg path": {
                    fill: theme.globals.colors.active,
                },

                "&:hover": {
                    color: theme.globals.colors.active,
                },
            },
        },
        hoverUnderline: {
            cursor: "pointer",

            "&:hover": {
                textDecoration: "underline",
            },
        },
        icon: {
            display: "none",
            marginLeft: 8,
        },
    };
});

interface IUsageItemsProps {
    active?: IInsight | IMetadataObject;
    objects?: IInsight[] | IMetadataObject[];
    openType: "external" | "internal";
    onObjectClick?: (object: IInsight | IMetadataObject) => void;
}

interface IUsageItemProps {
    active?: boolean;
    object: IInsight | IMetadataObject;
    openType: IUsageItemsProps["openType"];
    onObjectClick?: IUsageItemsProps["onObjectClick"];
}

export function UsageItems({
    active,
    objects = [],
    onObjectClick,
    openType,
}: PropsWithChildren<IUsageItemsProps>) {
    const getClassNames = useClassNames(active, onObjectClick);

    return (
        <>
            {objects.map((object: IInsight | IMetadataObject, i) => {
                const [className, active] = getClassNames(object);
                return (
                    <Item key={i} className={className} onClick={() => !active && onObjectClick?.(object)}>
                        <UsageItem
                            active={active}
                            object={object}
                            openType={openType}
                            onObjectClick={onObjectClick}
                        />
                    </Item>
                );
            })}
        </>
    );
}

function UsageItem({ active, object, onObjectClick, openType }: IUsageItemProps) {
    return (
        <p>
            <IconInsight />
            <UsageTitle object={object} />
            <UsageExternalIcon openType={openType} onObjectClick={onObjectClick} active={active} />
        </p>
    );
}

function UsageTitle({ object }: { object: IUsageItemProps["object"] }) {
    if (isInsight(object)) {
        return <>{object.insight.title}</>;
    }
    if (isMeasureMetadataObject(object)) {
        return <>{object.title}</>;
    }
    throw new Error(`Unsupported object type.`);
}

function UsageExternalIcon({
    onObjectClick,
    openType,
    active,
}: Pick<IUsageItemProps, "onObjectClick" | "openType" | "active">) {
    const { classes } = useStyles();

    if (onObjectClick && openType === "external" && !active) {
        return <IconExternalLink width={12} height={12} color="#464e56" className={classes.icon} />;
    }
    return null;
}

function useClassNames(
    active: IUsageItemsProps["active"],
    onObjectClick: IUsageItemProps["onObjectClick"],
): (object: IUsageItemProps["object"]) => [string, boolean] {
    const { classes, cx } = useStyles();

    return useCallback(
        (object) => {
            const isInsightObject = isInsight(object);
            const isMetricObject = isMeasureMetadataObject(object);
            const isActiveObject = isActive(object, active);

            return [
                cx(
                    isInsightObject && "s-usage-insight-item",
                    isMetricObject && "s-usage-metric-item",
                    classes.item,
                    isActiveObject && classes.active,
                    onObjectClick && !isActiveObject && classes.hoverUnderline,
                ),
                isActiveObject,
            ];
        },
        [active, cx, classes.item, classes.active, classes.hoverUnderline, onObjectClick],
    );
}

function isActive(object: IUsageItemProps["object"], active: IUsageItemsProps["active"]) {
    if (isInsight(object) && isInsight(active)) {
        return areObjRefsEqual(object.insight, active.insight);
    }
    if (isMeasureMetadataObject(object) && isMeasureMetadataObject(active)) {
        return areObjRefsEqual(object, active);
    }
    return false;
}
