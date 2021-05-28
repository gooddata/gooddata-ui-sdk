// (C) 2007-2020 GoodData Corporation
import * as React from "react";
import cx from "classnames";
import { mount, ReactWrapper } from "enzyme";
import Kefir, { constant, merge } from "kefir";

import { LegacyList, ILegacyListProps } from "../LegacyList";

const MAX_RESPONSE_TIME = 5000;

function createStream() {
    let emitter: any = null;

    const stream = Kefir.stream((_emitter) => {
        emitter = _emitter;

        return () => {
            emitter = null;
        };
    });

    function emit(...args: any[]) {
        if (emitter) {
            emitter.emit(...args);
        }
    }

    function end() {
        if (emitter) {
            emitter.end();
        }
    }

    return { stream, emit, end };
}

class DummyDataSource<T extends { title: string }> {
    public initialRows: T[];
    public moreRows: T[];
    public maxResponseTime: number;
    public allRows: T[];

    public search$: any;
    public emitSearch: any;
    public data$: any;
    public emitRowsUpdate: any;
    public isLoading$: any;
    public firstLoad$: any;
    public finishedReload$: any;
    public rows: T[];
    public rowsCount: number;
    public totalRowsCount: number | T[];

    constructor(initialRows: T[] = [], moreRows: T[] = [], maxResponseTime: number = MAX_RESPONSE_TIME) {
        this.initialRows = initialRows;
        this.moreRows = moreRows;
        this.maxResponseTime = maxResponseTime;
        this.allRows = initialRows.concat(moreRows);

        const searches = createStream();
        this.search$ = searches.stream;
        this.emitSearch = searches.emit;

        const rowsUpdates = createStream();
        this.data$ = rowsUpdates.stream;
        this.emitRowsUpdate = rowsUpdates.emit;

        this.isLoading$ = merge([
            constant({ isLoading: false }),
            this.search$.map((searchString: string) => ({ searchString, isLoading: false })),
        ]);

        this.firstLoad$ = constant(true);
        this.finishedReload$ = constant(true);

        this.load();
    }

    load() {
        this.rows = this.initialRows;

        this.rowsCount = this.rows.length;

        if (typeof this.totalRowsCount === "undefined") {
            this.totalRowsCount = this.allRows;
        }
    }

    search({ searchString }: { searchString: string }) {
        this.emitSearch(searchString);
        const lowerSearchString = searchString.toLowerCase();

        if (this.allRows.length) {
            const allResults = this.allRows.filter((row) =>
                (row.title || "").toLowerCase().includes(lowerSearchString),
            );
            this.rows = allResults.slice(0, 20);
            this.rowsCount = allResults.length;
            this.emitRowsUpdate();
        }

        return false;
    }

    getObjectAt(index: number) {
        if (this.rows[index]) {
            return this.rows[index];
        }

        setTimeout(() => {
            this.rows[index] = this.allRows[index];
            this.rowsCount = this.allRows.length;
            this.emitRowsUpdate();
        }, Math.floor(Math.random() * this.maxResponseTime));

        return null;
    }
}

function createDummyDataSource<T extends { title: string }>(initialRows: T[] = [], moreRows: T[] = []) {
    return new DummyDataSource<T>(initialRows, moreRows);
}

interface IDummyRowItemProps {
    isFirst?: boolean;
    isLast?: boolean;
    item?: IItemProps;
    scrollToSelected?: boolean;
}

class DummyRowItem extends React.Component<IDummyRowItemProps> {
    static defaultProps: Pick<IDummyRowItemProps, "isFirst" | "isLast" | "scrollToSelected"> = {
        isFirst: false,
        isLast: false,
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

interface IItemProps {
    title: string;
}

describe("List", () => {
    const renderList = (options: Partial<ILegacyListProps>): ReactWrapper<LegacyList> => {
        return mount(<LegacyList {...(options as any)} />);
    };

    const dataSource = createDummyDataSource<IItemProps>([
        { title: "one" },
        { title: "two" },
        { title: "three" },
    ]);

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

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const scrollToSelectedProps = wrapper.props().scrollToSelected;
        expect(scrollToSelectedProps).toEqual(false);
    });
});
