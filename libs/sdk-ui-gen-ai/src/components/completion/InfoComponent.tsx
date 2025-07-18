// (C) 2025 GoodData Corporation
import { createRoot } from "react-dom/client";
import { IDataSetMetadataObject, IMetadataObjectBase, isIdentifierRef, ObjRef } from "@gooddata/sdk-model";
import { IntlShape } from "react-intl";

interface IInfoComponentProps {
    id: string;
    item: IMetadataObjectBase;
    intl: IntlShape;
    group?: ObjRef;
    dataset?: IDataSetMetadataObject;
    canManage?: boolean;
    canAnalyze?: boolean;
}

function InfoComponent({ item, intl, canManage, canAnalyze, dataset, group, id }: IInfoComponentProps) {
    return (
        <div className="gd-gen-ai-chat__autocomplete__info">
            <h3>{item.title}</h3>
            {item.description ? <p>{item.description}</p> : null}
            <div className="gd-gen-ai-chat__autocomplete__info__item">
                <div className="gd-gen-ai-chat__autocomplete__info__item__title">
                    {intl.formatMessage({ id: "gd.gen-ai.autocomplete.type" })}
                </div>
                <div className="gd-gen-ai-chat__autocomplete__info__item__value">
                    {item.type === "attribute"
                        ? intl.formatMessage({ id: "gd.gen-ai.autocomplete.attribute" })
                        : null}
                    {item.type === "fact" ? intl.formatMessage({ id: "gd.gen-ai.autocomplete.fact" }) : null}
                    {item.type === "measure"
                        ? intl.formatMessage({ id: "gd.gen-ai.autocomplete.metric" })
                        : null}
                    {item.type === "dataSet"
                        ? intl.formatMessage({ id: "gd.gen-ai.autocomplete.date" })
                        : null}
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
