// (C) 2007-2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import { mount } from "enzyme";

import createDummyDataSource from "@gooddata/goodstrap/lib/data/DummyDataSource";
import { LegacyList, ILegacyListProps } from "../LegacyList";

interface IDummyRowItemProps {
    isFirst?: boolean;
    isLast?: boolean;
    item?: any;
    scrollToSelected?: boolean;
}

describe("List", () => {
    const renderList = (options: Partial<ILegacyListProps>) => {
        return mount(<LegacyList {...options} />);
    };

    const dataSource = createDummyDataSource([{ title: "one" }, { title: "two" }, { title: "three" }]);

    class DummyRowItem extends React.Component<IDummyRowItemProps> {
        static defaultProps = {
            isFirst: false,
            isLast: false,
            item: {},
            scrollToSelected: false,
        };

        render() {
            const className = cx(this.props.item.title, {
                "is-first": this.props.isFirst,
                "is-last": this.props.isLast,
            });

            return <div className={className}>{this.props.item.title}</div>;
        }
    }

    it("should render list with first and last items marked", () => {
        const wrapper = renderList({
            dataSource,
            rowItem: <DummyRowItem />,
        });

        const firstItem = wrapper.find(".one");
        const secondItem = wrapper.find(".two");
        const thirdItem = wrapper.find(".three");

        expect(firstItem.hasClass("is-first")).toEqual(true);
        expect(firstItem.hasClass("is-last")).toEqual(false);

        expect(secondItem.hasClass("is-first")).toEqual(false);
        expect(secondItem.hasClass("is-last")).toEqual(false);

        expect(thirdItem.hasClass("is-first")).toEqual(false);
        expect(thirdItem.hasClass("is-last")).toEqual(true);
    });

    it("should have scrollToSelected prop", () => {
        const wrapper = renderList({
            dataSource,
            rowItem: <DummyRowItem />,
        });

        const scrollToSelectedProps = wrapper.props().scrollToSelected;
        expect(scrollToSelectedProps).toEqual(false);
    });
});
