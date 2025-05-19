// (C) 2025 GoodData Corporation
import React from "react";
import { createRoot } from "react-dom/client";
import { IMetadataObjectBase } from "@gooddata/sdk-model";
import { IntlShape } from "react-intl";

interface IInfoComponentProps {
    id: string;
    item: IMetadataObjectBase;
    intl: IntlShape;
}

function InfoComponent({ item, intl }: IInfoComponentProps) {
    return (
        <div className="gd-gen-ai-chat__autocomplete__info">
            <h3>{item.title}</h3>
            {item.description ? <p>{item.description}</p> : null}
            <div className="type">
                <div className="type-title">{intl.formatMessage({ id: "gd.gen-ai.autocomplete.type" })}</div>
                <div className="type-value">
                    {item.type === "attribute"
                        ? intl.formatMessage({ id: "gd.gen-ai.autocomplete.attribute" })
                        : null}
                    {item.type === "fact" ? intl.formatMessage({ id: "gd.gen-ai.autocomplete.fact" }) : null}
                    {item.type === "measure"
                        ? intl.formatMessage({ id: "gd.gen-ai.autocomplete.metric" })
                        : null}
                </div>
            </div>
        </div>
    );
}

export function getInfo(intl: IntlShape, id: string, item: IMetadataObjectBase): () => Node {
    return () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        root.render(<InfoComponent intl={intl} id={id} item={item} />);
        return container;
    };
}
