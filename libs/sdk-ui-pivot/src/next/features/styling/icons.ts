// (C) 2025 GoodData Corporation

export const getAscSortIcon = (color: string) => `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 4.50015L10.5 9.50015H3.5L7 4.50015Z" fill="${color}"/>
    </svg>
`;

export const getDescSortIcon = (color: string) => `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 9.49985L10.5 4.49985H3.5L7 9.49985Z" fill="${color}"/>
    </svg>
`;

export const getMenuIcon = (color: string) => `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 5.89499C8.37868 5.89499 7.875 5.39131 7.875 4.76999C7.875 4.14867 8.37868 3.64499 9 3.64499C9.62132 3.64499 10.125 4.14867 10.125 4.76999C10.125 5.39131 9.62132 5.89499 9 5.89499Z" fill="${color}"/>
        <path d="M9 10.125C8.37868 10.125 7.875 9.62131 7.875 8.99999C7.875 8.37867 8.37868 7.87499 9 7.87499C9.62132 7.87499 10.125 8.37867 10.125 8.99999C10.125 9.62131 9.62132 10.125 9 10.125Z" fill="${color}"/>
        <path d="M9 14.355C8.37868 14.355 7.875 13.8513 7.875 13.23C7.875 12.6087 8.37868 12.105 9 12.105C9.62132 12.105 10.125 12.6087 10.125 13.23C10.125 13.8513 9.62132 14.355 9 14.355Z" fill="${color}"/>
    </svg>
`;
