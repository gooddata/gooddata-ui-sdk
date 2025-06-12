// (C) 2007-2024 GoodData Corporation
import React from "react";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { FilterStories } from "../../../_infra/storyGroups.js";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import { LongPostInteractionTimeout } from "../../../_infra/backstopWrapper.js";

import { action } from "@storybook/addon-actions";
import {
    AttributeFilterButton,
    AttributeFilterError,
    AttributeFilterDropdownButton,
} from "@gooddata/sdk-ui-filters";
import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
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

storiesOf(`${FilterStories}@next/AttributeFilterButton`)
    .add(
        "empty default selection",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterButton
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                        onApply={action("on-apply")}
                    />
                </div>
            );
        },
        {
            screenshots: {
                opened: {
                    clickSelector: ".gd-attribute-filter__next",
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },
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
                        <AttributeFilterButton
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
        {
            screenshots: {
                opened: {
                    clickSelector: ".gd-attribute-filter__next",
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },
    )
    .add(
        "empty default selection - localized",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterButton
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        locale="de-DE"
                        filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                        onApply={action("on-apply")}
                    />
                </div>
            );
        },
        {
            screenshots: {
                opened: {
                    clickSelector: ".gd-attribute-filter__next",
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },
    )
    .add(
        "pre-selected elements",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterButton
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, {
                            uris: [
                                ReferenceData.ProductName.WonderKid.uri,
                                ReferenceData.ProductName.Explorer.uri,
                            ],
                        })}
                        onApply={action("on-apply")}
                    />
                </div>
            );
        },
        {
            screenshots: {
                opened: {
                    clickSelector: ".gd-attribute-filter__next",
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },
    )
    .add(
        "all elements selected in negative selection",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterButton
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newNegativeAttributeFilter(ReferenceMd.Product.Name, {
                            uris: [
                                ReferenceData.ProductName.CompuSci.uri,
                                ReferenceData.ProductName.Educationly.uri,
                                ReferenceData.ProductName.Explorer.uri,
                                ReferenceData.ProductName.GrammarPlus.uri,
                                ReferenceData.ProductName.PhoenixSoft.uri,
                                ReferenceData.ProductName.TouchAll.uri,
                                ReferenceData.ProductName.WonderKid.uri,
                            ],
                        })}
                        onApply={action("on-apply")}
                    />
                </div>
            );
        },
        {
            screenshots: {
                opened: {
                    clickSelector: ".gd-attribute-filter__next",
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },
    )
    .add(
        "attibute filter error",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterButton
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newNegativeAttributeFilter("NON_EXISTING", [])}
                        onApply={action("on-apply")}
                    />

                    <p>with hover state</p>
                    <div className="filter-hover">
                        <AttributeFilterButton
                            backend={backend}
                            workspace={ReferenceWorkspaceId}
                            filter={newNegativeAttributeFilter("NON_EXISTING", [])}
                            onApply={action("on-apply")}
                            ErrorComponent={() => <AttributeFilterError isDraggable={true} />}
                        />
                    </div>

                    <p>can&apos;t load value error </p>
                    <div className="error-not-load-value">
                        <AttributeFilterButton
                            backend={backend}
                            workspace={ReferenceWorkspaceId}
                            filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                            onApply={action("on-apply")}
                            DropdownButtonComponent={() => (
                                <AttributeFilterDropdownButton
                                    title="Product name"
                                    subtitle="Laptop"
                                    isError={true}
                                />
                            )}
                        />
                    </div>

                    <p>can&apos;t load value error and hover state</p>
                    <div className="error-not-load-value-hover">
                        <AttributeFilterButton
                            backend={backend}
                            workspace={ReferenceWorkspaceId}
                            filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                            onApply={action("on-apply")}
                            DropdownButtonComponent={() => (
                                <AttributeFilterDropdownButton
                                    title="Product name"
                                    subtitle="Laptop"
                                    isError={true}
                                    isDraggable={true}
                                />
                            )}
                        />
                    </div>
                </div>
            );
        },
        {
            screenshots: {
                hover: {
                    hoverSelectors: [
                        ".filter-hover .gd-attribute-filter-dropdown-button__next",
                        ".error-not-load-value-hover .gd-attribute-filter-dropdown-button__next",
                    ],
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },
    )
    .add(
        "themed",
        () => {
            return wrapWithTheme(
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterButton
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, [])}
                        onApply={action("on-apply")}
                    />
                </div>,
            );
        },
        {
            screenshots: {
                opened: {
                    clickSelector: ".gd-attribute-filter__next",
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },
    )
    .add(
        "single selection",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <AttributeFilterButton
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        filter={newPositiveAttributeFilter(ReferenceMd.Product.Name, {
                            uris: [ReferenceData.ProductName.WonderKid.uri],
                        })}
                        onApply={action("on-apply")}
                        selectionMode="single"
                    />
                </div>
            );
        },
        {
            screenshots: {
                opened: {
                    clickSelector: ".gd-attribute-filter__next",
                    postInteractionWait: LongPostInteractionTimeout,
                },
            },
        },
    );
