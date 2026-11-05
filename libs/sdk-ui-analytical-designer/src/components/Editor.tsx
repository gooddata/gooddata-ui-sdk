// (C) 2007-2026 GoodData Corporation

import { type RefObject, useLayoutEffect, useRef } from "react";

import classNames from "classnames";
import { useSelector } from "react-redux";

import { isTopBarHidden as isTopBarHiddenSelector } from "../selectors/bootstrap_selector.js";
import { isReportOpeningSelector } from "../selectors/open_report_selector.js";

import { CatalogPanel } from "./CatalogPanel.js";
import { CatalogSidebar } from "./catalogSidebar/CatalogSidebar.js";
import { useCatalogSidebar } from "./catalogSidebar/useCatalogSidebarState.js";
import { EditorHeader } from "./EditorHeader.js";
import { EditorMain } from "./EditorMain.js";

const HEADER_HEIGHT_VARIABLE = "--adi-editor-header-height";

/**
 * Publishes the measured height of the header as a CSS variable on the editor, which places the catalog and the
 * canvas below it. Written to the DOM directly, so a resize does not re-render the header slots.
 */
function usePublishedHeaderHeight(
    editorRef: RefObject<HTMLDivElement | null>,
    headerRef: RefObject<HTMLDivElement | null>,
    isHeaderVisible: boolean,
) {
    useLayoutEffect(() => {
        const editor = editorRef.current;
        const header = headerRef.current;
        if (!editor || !header || !isHeaderVisible) {
            return undefined;
        }

        const publish = () => editor.style.setProperty(HEADER_HEIGHT_VARIABLE, `${header.clientHeight}px`);
        publish();

        if (typeof ResizeObserver === "undefined") {
            return () => editor.style.removeProperty(HEADER_HEIGHT_VARIABLE);
        }
        const observer = new ResizeObserver(publish);
        observer.observe(header);
        return () => {
            observer.disconnect();
            editor.style.removeProperty(HEADER_HEIGHT_VARIABLE);
        };
    }, [editorRef, headerRef, isHeaderVisible]);
}

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
    const editorRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    usePublishedHeaderHeight(editorRef, headerRef, !isTopBarHidden);

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
            ref={editorRef}
            className={classNames("adi-editor", {
                "adi-editor--catalog-sidebar": hasCatalogSidebar,
                "adi-editor--catalog-collapsible": canCollapse,
                "adi-editor--catalog-collapsed": isCollapsed,
            })}
        >
            {!isTopBarHidden && <EditorHeader containerRef={headerRef} />}
            <CatalogSidebar isEnabled={hasCatalogSidebar}>
                <CatalogPanel />
            </CatalogSidebar>
            {renderMain()}
            {renderLoading()}
        </div>
    );
}
