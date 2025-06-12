// (C) 2021 GoodData Corporation

export interface IOffset {
    x?: number;
    y?: number;
}
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        interface Chainable<Subject> {
            /**
             * Drags element to offset position
             */
            dragByOffset: (offset: IOffset, metaKey: boolean, altKey: boolean) => Chainable<Subject>;
        }
    }
}

export default {};

function dragByOffset(dragElement: JQuery, offset: IOffset, metaKey: boolean, altKey: boolean) {
    const dropCoords = dragElement[0].getBoundingClientRect();

    const elementCenterH = dropCoords.height / 2;
    const elementCenterW = dropCoords.width / 2;

    const movePayload = {
        clientX: Math.trunc(dropCoords.x + elementCenterW + (offset?.x ?? 0)),
        clientY: Math.trunc(dropCoords.y + elementCenterH + (offset?.y ?? 0)),
    };

    return cy
        .wrap(dragElement)
        .trigger("mousedown", { button: 0, force: true, metaKey: metaKey, altKey: altKey }) // define button as which: 1 not working
        .trigger("mousemove", { button: 0 }) // We perform a small move event
        .trigger("mousemove", movePayload)
        .trigger("mousemove", { button: 0 }) // We perform a small move event
        .trigger("mouseup", { force: true });
}

Cypress.Commands.add(
    "dragByOffset",
    {
        prevSubject: true,
    },
    dragByOffset,
);
