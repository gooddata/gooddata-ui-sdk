// (C) 2025 GoodData Corporation

export function KdaKeyDriverChart() {
    return <div style={getTempStyles()}>Chart space</div>;
}

function getTempStyles() {
    return {
        width: "100%",
        height: "100%",
        background: "#d6d6d6",
        borderRadius: "8px",
        border: "3px dashed #8f8f8f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
    };
}
