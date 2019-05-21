// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { InjectedIntlProps } from "react-intl";
import { IMappingHeader } from "../../../../interfaces/MappingHeader";

import { withIntl } from "../../utils/intlUtils";
import { ITableProps, Table } from "../Table";
import { ITableTransformationProps, TableTransformation } from "../TableTransformation";
import {
    EXECUTION_REQUEST_2A_3M,
    EXECUTION_RESPONSE_2A_3M,
    EXECUTION_RESULT_2A_3M,
} from "../fixtures/2attributes3measures";
import { IHeaderPredicateContext } from "../../../../interfaces/HeaderPredicate";

const WrappedTable = withIntl(TableTransformation);

describe("TableTransformation", () => {
    function createComponent(
        customProps: Partial<ITableTransformationProps> = {},
    ): React.ReactElement<ITableTransformationProps & InjectedIntlProps> {
        const defaultProps = {
            executionRequest: EXECUTION_REQUEST_2A_3M,
            executionResponse: EXECUTION_RESPONSE_2A_3M,
            executionResult: EXECUTION_RESULT_2A_3M,
        };
        const props = { ...defaultProps, ...customProps };
        return <WrappedTable {...props} />;
    }

    it("should use default renderer", () => {
        const wrapper = mount(createComponent());
        const component = wrapper.find(TableTransformation);
        expect(component.prop("tableRenderer")).toBeDefined();
    });

    it("should use custom renderer", () => {
        const tableRenderer: (props: ITableProps) => JSX.Element = jest
            .fn()
            .mockImplementation(() => <div />);
        mount(createComponent({ tableRenderer }));
        expect(tableRenderer).toHaveBeenCalled();
    });

    it("should pass containerHeight if height is set in props", () => {
        const tableRenderer = jest.fn().mockImplementation(() => <div />);
        mount(createComponent({ tableRenderer, height: 255 }));
        expect(tableRenderer.mock.calls[0][0].containerHeight).toEqual(255);
    });

    it("should pass containerWidth if width is set in props", () => {
        const tableRenderer = jest.fn().mockImplementation(() => <div />);
        mount(createComponent({ tableRenderer, width: 700 }));
        expect(tableRenderer.mock.calls[0][0].containerWidth).toEqual(700);
    });

    it("should accept drillableItems and convert it to drillablePredicates required by Table visualization", () => {
        const wrapper = mount(
            createComponent({
                drillableItems: [
                    { uri: "/uri" },
                    { uri: "identifier" },
                    (_header: IMappingHeader, _context: IHeaderPredicateContext) => true,
                ],
            }),
        );
        const component = wrapper.find(Table);
        expect(component.prop("drillablePredicates")).toHaveLength(3);
        component.prop("drillablePredicates").forEach(predicate => {
            expect(typeof predicate).toBe("function");
        });
    });
});
