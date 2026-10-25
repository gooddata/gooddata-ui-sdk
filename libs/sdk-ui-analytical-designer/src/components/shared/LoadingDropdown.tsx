// (C) 2007-2026 GoodData Corporation

interface ILoadingDropdownProps {
    height?: number;
}

export function LoadingDropdown(props: ILoadingDropdownProps) {
    return <div className="dropdown-loading s-dropdown-loading" style={{ height: props.height ?? 300 }} />;
}
