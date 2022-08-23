// (C) 2007-2019 GoodData Corporation
import React from "react";

import { storiesOf } from "../../../_infra/storyRepository";
import { FilterStories } from "../../../_infra/storyGroups";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend";
import { wrapWithTheme } from "../../themeWrapper";
// import { LongPostInteractionTimeout } from "../../../_infra/backstopWrapper";
import { ElementUris } from "./fixtures";

import { action } from "@storybook/addon-actions";
import { AttributeFilterV2 } from "@gooddata/sdk-ui-filters";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newNegativeAttributeFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const wrapperStyle = { width: 400, height: 600, padding: "1em 1em" };
const backend = StorybookBackend();

/*
 * TODO: fix these scenarios, use postInteractionWait selector (string) instead of fixed timeout. this
 *  will highly likely require changes in the attr filter though (tried existing styles, no luck - possibly
 *  because of the fixedDataTable / goodstrap => i believe divs are rendered with zero height first => still
 *  not visible)
 */

storiesOf(`${FilterStories}@next/AttributeFilter`)
    .add(
        "empty default selection",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterV2
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                        onApply={action("on-apply")}
                    />
                </div>
            );
        },
        /* {
            screenshots: {
                closed: {},
                opened: { clickSelector: ".s-product", postInteractionWait: LongPostInteractionTimeout },
                "select-all": {
                    clickSelectors: [".s-product", ".s-select_all"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },*/
    )
    .add(
        "not fit into content",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, 80px)",
                            height: 200,
                            width: 160,
                        }}
                    >
                        <AttributeFilterV2
                            backend={backend}
                            workspace={ReferenceWorkspaceId}
                            filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                            onApply={action("on-apply")}
                        />
                        <div style={{ padding: 4 }}>Second</div>
                    </div>
                </div>
            );
        },
        /* {
        screenshots: {
            closed: {},
            opened: { clickSelector: ".s-product", postInteractionWait: LongPostInteractionTimeout },
            "select-all": {
                clickSelectors: [".s-product", ".s-select_all"],
                postInteractionWait: LongPostInteractionTimeout,
            },
        },
    },*/
    )
    .add(
        "empty default selection - localized",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterV2
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        locale="de-DE"
                        filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                        onApply={action("on-apply")}
                    />
                </div>
            );
        },
        /*{
            screenshots: {
                closed: {},
                opened: { clickSelector: ".s-product", postInteractionWait: LongPostInteractionTimeout },
                "select-all": {
                    clickSelectors: [".s-product", ".s-alle_ausw_hlen"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },*/
    )
    .add(
        "pre-selected elements",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterV2
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, {
                            uris: [ElementUris.WonderKid, ElementUris.Explorer],
                        })}
                        onApply={action("on-apply")}
                    />
                </div>
            );
        },
        /* {
            screenshots: {
                opened: { clickSelector: ".s-product", postInteractionWait: LongPostInteractionTimeout },
                "select-all": {
                    clickSelectors: [".s-product", ".s-select_all"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
                clear: {
                    clickSelectors: [".s-product", ".s-clear"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },*/
    )
    .add(
        "title with pre-selected elements - positive AttributeFilter",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterV2
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, {
                            uris: [ElementUris.WonderKid, ElementUris.Explorer, ElementUris.TouchAll],
                        })}
                        onApply={action("on-apply")}
                        titleWithSelection={true}
                    />
                </div>
            );
        },
        /*  {
            screenshots: {
                closed: {},
                opened: {
                    clickSelector: ".s-product__wonderkid__explorer__touch___3_",
                    postInteractionWait: LongPostInteractionTimeout,
                },
                "select-all": {
                    clickSelectors: [".s-product__wonderkid__explorer__touch___3_", ".s-select_all"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
                clear: {
                    clickSelectors: [".s-product__wonderkid__explorer__touch___3_", ".s-clear"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },*/
    )
    .add(
        "title with pre-selected elements - negative AttributeFilter",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterV2
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, {
                            uris: [ElementUris.WonderKid, ElementUris.Explorer, ElementUris.TouchAll],
                        })}
                        onApply={action("on-apply")}
                        titleWithSelection={true}
                    />
                </div>
            );
        },
        /* {
            screenshots: {
                closed: {},
                opened: {
                    clickSelector: ".s-product__all_except_wonderkid__expl___3_",
                    postInteractionWait: LongPostInteractionTimeout,
                },
                "select-all": {
                    clickSelectors: [".s-product__all_except_wonderkid__expl___3_", ".s-select_all"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
                clear: {
                    clickSelectors: [".s-product__all_except_wonderkid__expl___3_", ".s-clear"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },*/
    )
    .add(
        "all elements selected in negative selection",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterV2
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, {
                            uris: [
                                ElementUris.CompuSci,
                                ElementUris.Educationly,
                                ElementUris.Explorer,
                                ElementUris["Grammar Plus"],
                                ElementUris.PhoenixSoft,
                                ElementUris.TouchAll,
                                ElementUris.WonderKid,
                            ],
                        })}
                        onApply={action("on-apply")}
                    />
                </div>
            );
        },
        /* {
            screenshots: {
                opened: { clickSelector: ".s-product", postInteractionWait: LongPostInteractionTimeout },
                "select-all": {
                    clickSelectors: [".s-product", ".s-select_all"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
                clear: {
                    clickSelectors: [".s-product", ".s-clear"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },*/
    )
    .add(
        "attibute filter error",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterV2
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newNegativeAttributeFilter("NON_EXISTING", [])}
                        onApply={action("on-apply")}
                    />
                </div>
            );
        },
        /* {
            screenshots: {
                opened: { clickSelector: ".s-product", postInteractionWait: LongPostInteractionTimeout },
                "select-all": {
                    clickSelectors: [".s-product", ".s-select_all"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
                clear: {
                    clickSelectors: [".s-product", ".s-clear"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },*/
    )
    .add(
        "themed",
        () => {
            return wrapWithTheme(
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterV2
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                        onApply={action("on-apply")}
                    />
                </div>,
            );
        },
        /* {
            screenshots: {
                closed: {},
                opened: { clickSelector: ".s-product", postInteractionWait: LongPostInteractionTimeout },
                "select-all": {
                    clickSelectors: [".s-product", ".s-select_all"],
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },*/
    );
