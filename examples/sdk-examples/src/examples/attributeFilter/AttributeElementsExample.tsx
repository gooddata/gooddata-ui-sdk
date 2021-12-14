// (C) 2007-2021 GoodData Corporation
import React, { Component } from "react";
import { AttributeElements } from "@gooddata/sdk-ui-filters";
import { attributeDisplayFormRef } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

export interface IItem {
    title: string;
    uri: string;
}

export class AttributeFilterItem extends Component<IItem> {
    public onChange(uri: string) {
        return (event: React.ChangeEvent<HTMLInputElement>): void =>
            // eslint-disable-next-line no-console
            console.log("AttributeFilterItem onChange", uri, event.target.value === "on");
    }

    public render(): React.ReactNode {
        const { title, uri } = this.props;
        return (
            <label className="gd-list-item s-attribute-filter-list-item" style={{ display: "inline-flex" }}>
                <input type="checkbox" className="gd-input-checkbox" onChange={this.onChange(uri)} />
                <span>{title}</span>
            </label>
        );
    }
}

export class AttributeElementsExample extends Component {
    public buildAttributeFilterItem(item: IItem): JSX.Element {
        const { title, uri } = item;

        return <AttributeFilterItem key={uri} uri={uri} title={title} />;
    }

    public render(): React.ReactNode {
        return (
            <div style={{ minHeight: 500 }}>
                <AttributeElements displayForm={attributeDisplayFormRef(Md.EmployeeName.Default)} limit={20}>
                    {({ validElements, loadMore, isLoading, error }) => {
                        const { offset = null, items = null, totalCount = null } = validElements ?? {};
                        if (error) {
                            return <div>{error}</div>;
                        }
                        const count = items ? items.length : undefined;
                        return (
                            <div>
                                <button
                                    className="gd-button gd-button-secondary s-show-more-filters-button"
                                    onClick={loadMore}
                                    disabled={isLoading || offset! + count! === totalCount}
                                >
                                    More
                                </button>
                                <h2>validElements</h2>
                                <pre>
                                    isLoading: {isLoading.toString()}
                                    <br />
                                    offset: {offset}
                                    <br />
                                    count: {count}
                                    <br />
                                    total: {totalCount}
                                    <br />
                                    nextOffset: {offset! + count!}
                                </pre>
                                <div>
                                    {validElements
                                        ? validElements.items.map(this.buildAttributeFilterItem)
                                        : null}
                                </div>
                                {validElements ? (
                                    <pre>{JSON.stringify(validElements, null, "  ")}</pre>
                                ) : null}
                            </div>
                        );
                    }}
                </AttributeElements>
            </div>
        );
    }
}

export default AttributeElementsExample;
