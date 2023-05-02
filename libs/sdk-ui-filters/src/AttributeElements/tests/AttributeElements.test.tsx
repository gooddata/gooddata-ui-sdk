// (C) 2019-2023 GoodData Corporation
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { attributeIdentifier, idRef } from "@gooddata/sdk-model";
import React from "react";
import { act, render, waitFor } from "@testing-library/react";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";

import { AttributeElements } from "../AttributeElements";

describe("AttributeElements", () => {
    const backend = recordedBackend(ReferenceRecordings.Recordings);
    const workspace = "testWorkspace";
    const identifier = attributeIdentifier(ReferenceMd.Product.Name);

    const renderComponent = (props: any = {}) =>
        render(
            <AttributeElements
                {...props}
                backend={backend}
                workspace={workspace}
                displayForm={idRef(identifier)}
            />,
        );

    it("should load attribute elements by display form identifier", async () => {
        const children = jest.fn().mockReturnValue(<div />);
        renderComponent({ children });

        expect(children).toHaveBeenCalledTimes(1);
        expect(children.mock.calls[0][0].isLoading).toEqual(true);

        await waitFor(() => {
            expect(children).toHaveBeenCalledTimes(2);
            expect(children.mock.calls[1][0].isLoading).toEqual(false);
            expect(children.mock.calls[1][0].validElements.items.length).toEqual(7);
            expect(children.mock.calls[1][0].validElements.items[0].title).toEqual("CompuSci");
        });
    });

    it("should load more attribute elements using the loadMore function", async () => {
        const children = jest.fn().mockReturnValue(<div />);
        renderComponent({ children, limit: 1 });

        await waitFor(() => {
            expect(children.mock.calls[1][0].isLoading).toEqual(false);
            expect(children.mock.calls[1][0].validElements.items.length).toEqual(1);
            expect(children.mock.calls[1][0].validElements.items[0].title).toEqual("CompuSci");
        });

        await act(async () => {
            await children.mock.calls[1][0].loadMore();
        });

        await waitFor(() => {
            expect(children.mock.calls[2][0].isLoading).toEqual(false);
            expect(children.mock.calls[2][0].validElements.items.length).toEqual(2);
            expect(children.mock.calls[2][0].validElements.items[1].title).toEqual("Educationly");
        });
    });
});
