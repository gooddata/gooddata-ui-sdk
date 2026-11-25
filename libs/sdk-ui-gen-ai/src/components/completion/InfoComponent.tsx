// (C) 2025-2026 GoodData Corporation

import { createRoot } from "react-dom/client";
import { type IntlShape } from "react-intl";

import {
    type IDataSetMetadataObject,
    type IMetadataObjectBase,
    type ObjRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";

interface IInfoComponentProps {
    id: string;
    item: IMetadataObjectBase;
    intl: IntlShape;
    group?: ObjRef;
    dataset?: IDataSetMetadataObject;
    canManage?: boolean;
    canAnalyze?: boolean;
}

export function InfoComponent({
    item,
    intl,
    canManage,
    canAnalyze,
    dataset,
    group,
    id,
}: IInfoComponentProps) {
    return (
        <div className="gd-gen-ai-chat__autocomplete__info">
            <h3>{item.title}</h3>
            {item.description ? <p>{item.description}</p> : null}
            <div className="gd-gen-ai-chat__autocomplete__info__item">
                <div className="gd-gen-ai-chat__autocomplete__info__item__title">
                    {intl.formatMessage({ id: "gd.gen-ai.autocomplete.type" })}
                </div>
                <div className="gd-gen-ai-chat__autocomplete__info__item__value">
                    {getInfoTypeLabel(item.type, intl)}
                </div>
            </div>
            {dataset ? (
                <div className="gd-gen-ai-chat__autocomplete__info__item">
                    <div className="gd-gen-ai-chat__autocomplete__info__item__title">
                        {intl.formatMessage({ id: "gd.gen-ai.autocomplete.dataset" })}
                    </div>
                    <div className="gd-gen-ai-chat__autocomplete__info__item__value">{dataset?.title}</div>
                </div>
            ) : null}
            {group && isIdentifierRef(group) ? (
                <div className="gd-gen-ai-chat__autocomplete__info__item">
                    <div className="gd-gen-ai-chat__autocomplete__info__item__title">
                        {intl.formatMessage({ id: "gd.gen-ai.autocomplete.dataset" })}
                    </div>
                    <div className="gd-gen-ai-chat__autocomplete__info__item__value">{group?.identifier}</div>
                </div>
            ) : null}
            {canManage || canAnalyze ? (
                <div className="gd-gen-ai-chat__autocomplete__info__item">
                    <div className="gd-gen-ai-chat__autocomplete__info__item__title">
                        {intl.formatMessage({ id: "gd.gen-ai.autocomplete.id" })}
                    </div>
                    <div className="gd-gen-ai-chat__autocomplete__info__item__value">{id}</div>
                </div>
            ) : null}
        </div>
    );
}

/**
 * Localized name of the object type shown in the info, e.g. "Metric".
 */
export function getInfoTypeLabel(type: IMetadataObjectBase["type"], intl: IntlShape): string | undefined {
    switch (type) {
        case "attribute":
        case "computedAttribute":
            return intl.formatMessage({ id: "gd.gen-ai.autocomplete.attribute" });
        case "fact":
            return intl.formatMessage({ id: "gd.gen-ai.autocomplete.fact" });
        case "measure":
            return intl.formatMessage({ id: "gd.gen-ai.autocomplete.metric" });
        case "dataSet":
            return intl.formatMessage({ id: "gd.gen-ai.autocomplete.date" });
        case "insight":
            return intl.formatMessage({ id: "gd.gen-ai.autocomplete.insight" });
        case "analyticalDashboard":
            return intl.formatMessage({ id: "gd.gen-ai.autocomplete.analyticalDashboard" });
        case "document":
            return intl.formatMessage({ id: "gd.gen-ai.context.type.publisherDocument" });
        case "displayForm":
            return intl.formatMessage({ id: "gd.gen-ai.autocomplete.displayForm" });
        default:
            return undefined;
    }
}

export function getInfo(
    intl: IntlShape,
    id: string,
    item: IMetadataObjectBase,
    {
        dataset,
        group,
        canManage,
        canAnalyze,
    }: {
        group?: ObjRef;
        dataset?: IDataSetMetadataObject;
        canManage?: boolean;
        canAnalyze?: boolean;
    },
): () => Node {
    return () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        root.render(
            <InfoComponent
                intl={intl}
                id={id}
                item={item}
                dataset={dataset}
                group={group}
                canManage={canManage}
                canAnalyze={canAnalyze}
            />,
        );
        return container;
    };
}
