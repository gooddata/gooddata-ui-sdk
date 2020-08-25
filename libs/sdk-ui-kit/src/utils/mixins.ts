// (C) 2020 GoodData Corporation

export const transition = (property: string, duration: number, easing?: string, delay?: string): string => `
    transition-property: ${property};
    transition-duration: ${duration}s;
    ${easing && `transition-timing-function: ${easing};`}
    ${delay && `transition-delay: ${delay};`}
 `;

export const gradientLinear = (topColor: string, bottomColor: string): string => `
    background: ${bottomColor};
    background-image: linear-gradient(to top, ${topColor}, ${bottomColor});
`;