// (C) 2007-2022 GoodData Corporation
import React, { useState, useEffect } from "react";
import { useAttributeFilterHandler } from "@gooddata/sdk-ui-filters";
import { IAttribute, IAttributeElementsByRef, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import * as Md from "../../../md/full";
import { ColumnChart } from "@gooddata/sdk-ui-charts";

interface ICustomAttributeFilter {
    attribute: IAttribute;
    elements: IAttributeElementsByRef;
    onApply: (elements: IAttributeElementsByRef) => void;
}

export function CustomAttributeFilter(props: ICustomAttributeFilter) {
    const { onApply, attribute, elements } = props;
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const handler = useAttributeFilterHandler({
        backend,
        workspace,
        filter: newNegativeAttributeFilter(attribute, elements),
    });

    useEffect(() => {
        // This is just an example, in a real world scenario,
        // re-initialization logic would be likely more complex.
        handler.init();

        const unsubscribeOnChange = handler.onSelectionChanged((payload) => {
            onApply({ uris: payload.selection.keys });
        });

        return () => {
            unsubscribeOnChange();
        };
    }, [onApply, handler]);

    const initStatus = handler.getInitStatus();
    const loadedElements = handler.getAllElements();
    const committedSelection = handler.getCommittedSelection();
    const isElementSelected = (elementUri: string) => !committedSelection.keys.includes(elementUri);

    if (initStatus === "error") {
        return <div>{handler.getInitError()?.message}</div>;
    }

    if (initStatus === "loading" || initStatus === "pending") {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h3>{handler.getAttribute()?.title ?? ""}</h3>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                {loadedElements.map((element) => (
                    <div
                        key={element.uri}
                        onClick={() => {
                            if (isElementSelected(element.uri)) {
                                handler.changeSelection({
                                    isInverted: committedSelection.isInverted,
                                    keys: [...committedSelection.keys, element.uri],
                                });
                            } else {
                                handler.changeSelection({
                                    isInverted: committedSelection.isInverted,
                                    keys: committedSelection.keys.filter((key) => key !== element.uri),
                                });
                            }
                            handler.commitSelection();
                        }}
                        style={{
                            borderRadius: 5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: 30,
                            marginRight: 10,
                            marginTop: 10,
                            fontWeight: "bold",
                            background: isElementSelected(element.uri) ? "#333" : "#eee",
                            color: isElementSelected(element.uri) ? "#fff" : "#333",
                            cursor: "pointer",
                            padding: "10px 15px",
                        }}
                    >
                        {element.title}
                    </div>
                ))}
            </div>
        </div>
    );
}

const attribute = Md.LocationCity;

const UseAttributeFilterController = () => {
    const [elements, setElements] = useState<IAttributeElementsByRef>({ uris: [] });

    return (
        <div>
            <CustomAttributeFilter attribute={attribute} elements={elements} onApply={setElements} />
            <div style={{ height: 300 }}>
                <ColumnChart
                    measures={[Md.$TotalSales]}
                    viewBy={attribute}
                    filters={[newNegativeAttributeFilter(attribute, elements)]}
                />
            </div>
        </div>
    );
};

export default UseAttributeFilterController;
