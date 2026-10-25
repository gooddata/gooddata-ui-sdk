// (C) 2007-2026 GoodData Corporation

import classNames from "classnames";
import { useSelector } from "react-redux";

import { isTopBarHidden as isTopBarHiddenSelector } from "../selectors/bootstrap_selector.js";
import { isReportOpeningSelector } from "../selectors/open_report_selector.js";

import { CatalogPanel } from "./CatalogPanel.js";
import { CatalogSidebar } from "./catalogSidebar/CatalogSidebar.js";
import { useCatalogSidebar } from "./catalogSidebar/useCatalogSidebarState.js";
import { EditorHeader } from "./EditorHeader.js";
import { EditorMain } from "./EditorMain.js";

interface IEditorProps {
    /**
     * Whether the catalog lives in the shared resizable sidebar, whose state the root provides.
     */
    hasCatalogSidebar: boolean;
}

export function Editor({ hasCatalogSidebar }: IEditorProps) {
    const isReportOpening = useSelector(isReportOpeningSelector);
    const isTopBarHidden = useSelector(isTopBarHiddenSelector);
    const { canCollapse, isCollapsed } = useCatalogSidebar();

    function renderMain() {
        if (isReportOpening) {
            return null;
        }

        return <EditorMain key="editor-main" isTopBarHidden={isTopBarHidden} />;
    }

    function renderLoading() {
        return isReportOpening ? <div key="loading" className="editor-loading adi-editor-main" /> : null;
    }

    return (
        <div
            className={classNames("adi-editor", {
                "adi-editor--catalog-sidebar": hasCatalogSidebar,
                "adi-editor--catalog-collapsible": canCollapse,
                "adi-editor--catalog-collapsed": isCollapsed,
            })}
        >
            {!isTopBarHidden && <EditorHeader />}
            <CatalogSidebar isEnabled={hasCatalogSidebar}>
                <CatalogPanel />
            </CatalogSidebar>
            {renderMain()}
            {renderLoading()}
        </div>
    );
}
