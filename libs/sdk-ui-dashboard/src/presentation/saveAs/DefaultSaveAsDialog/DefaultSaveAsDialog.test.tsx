// (C) 2026 GoodData Corporation

import { act, render, renderHook, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { uiActions } from "../../../model/store/ui/index.js";

import { DefaultSaveAsDialog, useSaveAsDialogProps } from "./index.js";
import { type IUseSaveAsProps } from "./useSaveAs.js";

vi.hoisted(() => {
    vi.resetModules();
});

const mocks = vi.hoisted(() => ({
    useSaveAsProps: undefined as IUseSaveAsProps | undefined,
    handleSaveAs: vi.fn(),
    dispatch: vi.fn(),
    addError: vi.fn(),
    addSuccess: vi.fn(),
}));

vi.mock("./useSaveAs.js", () => ({
    useSaveAs: (props: IUseSaveAsProps) => {
        mocks.useSaveAsProps = props;
        return {
            locale: "en-US",
            dashboardTitle: "ABC Title",
            isKpiWidgetEnabled: false,
            isDashboardSaving: false,
            isDashboardLoaded: true,
            isInEditMode: false,
            handleSaveAs: mocks.handleSaveAs,
        };
    },
}));

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardDispatch: () => mocks.dispatch,
    useDashboardSelector: () => true,
}));

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useToastMessage: () => ({ addError: mocks.addError, addSuccess: mocks.addSuccess }),
}));

const saveError = new Error("save failed") as unknown as GoodDataSdkError;

function failSave() {
    act(() => {
        mocks.useSaveAsProps?.onSubmitError?.(saveError);
    });
}

describe("DefaultSaveAsDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.useSaveAsProps = undefined;
    });

    function renderDialog(isVisible = true, onError = vi.fn()) {
        const props = { isVisible, onCancel: vi.fn(), onError, onSuccess: vi.fn() };
        const result = render(<DefaultSaveAsDialog {...props} />);
        return {
            ...result,
            onError,
            setVisible: (visible: boolean) =>
                result.rerender(<DefaultSaveAsDialog {...props} isVisible={visible} />),
        };
    }

    it("should keep the dialog open, show the error and report it when the save failed", () => {
        const { onError } = renderDialog();

        failSave();

        expect(screen.getByText("Save dashboard as new")).toBeInTheDocument();
        expect(screen.getByText(/Dashboard save failed/)).toBeInTheDocument();
        expect(onError).toHaveBeenCalledWith(saveError);
    });

    it("should clear the error when the user submits again", async () => {
        renderDialog();
        failSave();

        await userEvent.click(screen.getByText("Create dashboard"));

        expect(mocks.handleSaveAs).toHaveBeenCalledWith("Copy of ABC Title", true, true);
        expect(screen.queryByText(/Dashboard save failed/)).not.toBeInTheDocument();
    });

    it("should clear the error once the dialog is closed", () => {
        const { setVisible } = renderDialog();
        failSave();

        setVisible(false);
        setVisible(true);

        expect(screen.getByText("Save dashboard as new")).toBeInTheDocument();
        expect(screen.queryByText(/Dashboard save failed/)).not.toBeInTheDocument();
    });
});

describe("useSaveAsDialogProps", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should show the error toast and keep the dialog open when the save failed", () => {
        const { result } = renderHook(() => useSaveAsDialogProps());

        result.current.onError?.(saveError);

        expect(mocks.addError).toHaveBeenCalled();
        expect(mocks.dispatch).not.toHaveBeenCalled();
    });

    it("should close the dialog when the save succeeded", () => {
        const { result } = renderHook(() => useSaveAsDialogProps());

        result.current.onSuccess?.({} as never);

        expect(mocks.addSuccess).toHaveBeenCalled();
        expect(mocks.dispatch).toHaveBeenCalledWith(uiActions.closeSaveAsDialog());
    });
});
