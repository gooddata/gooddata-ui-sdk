// (C) 2025-2026 GoodData Corporation

import { type MouseEvent } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type ISemanticQualityIssueObject } from "@gooddata/sdk-model";
import { UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

import { QualityIssueObjectDetail } from "./QualityIssueObjectDetail.js";
import { type ICatalogItemRef } from "../catalogItem/index.js";
import { ObjectTypeIconMemo, mapObjectType } from "../objectType/index.js";

type Props = {
    objects: ISemanticQualityIssueObject[];
    onObjectClick?: (event: MouseEvent, ref: ICatalogItemRef) => void;
};

export function QualityIssueObjects({ objects, onObjectClick }: Props) {
    const intl = useIntl();
    return (
        <ul className="gd-analytics-catalog__quality-issue__objects">
            {objects.map((obj) => {
                const type = obj.type ? mapObjectType(obj.type) : undefined;
                return (
                    <li key={obj.identifier} className="gd-analytics-catalog__quality-issue__object">
                        {type ? <ObjectTypeIconMemo intl={intl} type={type} size={14} /> : null}
                        <span
                            className={cx(
                                "gd-analytics-catalog__object-type",
                                "gd-analytics-catalog__quality-issue__object__identifier",
                            )}
                            data-object-type={type}
                            role="link"
                            tabIndex={0}
                            onClick={(event) => {
                                if (!type) return;
                                onObjectClick?.(event, { identifier: obj.identifier, type });
                            }}
                        >
                            {obj.title || obj.identifier}
                        </span>
                        <UiTooltip
                            triggerBy={["hover", "click"]}
                            showArrow
                            anchor={<UiIcon type="question" size={14} color="complementary-7" ariaHidden />}
                            content={<QualityIssueObjectDetail object={obj} />}
                            variant="none"
                        />
                    </li>
                );
            })}
        </ul>
    );
}
