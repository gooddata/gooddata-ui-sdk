// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { IAlignPoint, ShortenedText } from "@gooddata/sdk-ui-kit";
import { areObjRefsEqual, isInsightWidget, IWidget, ObjRef, objRefToString } from "@gooddata/sdk-model";

const tooltipAlignPoints: IAlignPoint[] = [{ align: "cl cr", offset: { x: -20, y: 0 } }];

interface IAttributeFilterConfigurationItemProps {
    widget: IWidget;
    recentlyCheckedFilters: ObjRef[]; // TODO what is this for?
    notAppliedFiltersRefs: ObjRef[];
    onIgnoreChange: (filterDisplayFormRef: ObjRef, ignored: boolean) => void;
    isIgnored: boolean;
    attributeRef: ObjRef;
    displayFormRef: ObjRef;
    title: string;
}

export const AttributeFilterConfigurationItem: React.FC<IAttributeFilterConfigurationItemProps> = (props) => {
    const {
        widget,
        notAppliedFiltersRefs,
        recentlyCheckedFilters,
        onIgnoreChange,
        isIgnored,
        attributeRef,
        displayFormRef,
        title,
    } = props;

    const showLoadingIndicator = recentlyCheckedFilters.some((recentRef) =>
        areObjRefsEqual(recentRef, displayFormRef),
    );

    const showError =
        notAppliedFiltersRefs.some((notAppliedRef) => areObjRefsEqual(notAppliedRef, attributeRef)) &&
        !isIgnored &&
        !showLoadingIndicator;

    const classNames = cx(
        "s-attribute-filter-by-item",
        `s-${stringUtils.simplifyText(title)}`,
        "input-checkbox-label",
        "filter-by-item",
        "attribute-filter-by-item",
        {
            "attribute-filter-error": showError,
        },
    );

    const uniqueKey = objRefToString(displayFormRef);

    return (
        <div>
            <label className={classNames} htmlFor={uniqueKey}>
                <input
                    id={uniqueKey}
                    type="checkbox"
                    className="input-checkbox"
                    checked={!isIgnored}
                    onChange={(e) => onIgnoreChange(displayFormRef, e.target.checked)}
                />
                <span className="input-label-text">
                    <ShortenedText tooltipAlignPoints={tooltipAlignPoints} tagName="span" className="title">
                        {title}
                    </ShortenedText>
                </span>
                {!!showLoadingIndicator && <div className="gd-spinner small" />}
            </label>
            {!!showError && (
                <div className="gd-message error s-not-applied-attribute-filter">
                    {isInsightWidget(widget) ? (
                        <FormattedMessage
                            id="configurationPanel.vizCantBeFilteredByAttribute"
                            values={{ attributeName: title }}
                        />
                    ) : (
                        <FormattedMessage
                            id="configurationPanel.kpiCantBeFilteredByAttribute"
                            values={{ attributeName: title }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
