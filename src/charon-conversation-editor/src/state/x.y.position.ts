import { XYPosition } from "@xyflow/react";

/**
 * Checks if two XYPosition objects are equal
 */
export function arePositionsEquals(position1: XYPosition | undefined, position2: XYPosition | undefined) {
    return position1 === position2 ||
        (position1?.x === position2?.x && position1?.y === position2?.y);
};

/**
 * Extracts XYPosition from URLSearchParams or query string
 */
export function getPosition(specification: string | URLSearchParams): XYPosition | undefined {
    const parsedSpecification = specification instanceof URLSearchParams ? specification : new URLSearchParams(String(specification || ''));
    const x = Number(parsedSpecification.get('x'));
    const y = Number(parsedSpecification.get('y'));
    if (isNaN(x) || !isFinite(x) || isNaN(y) || !isFinite(y)) {
        return undefined;
    }
    return { x: x | 0, y: y | 0 };
}

/**
 * Sets XYPosition in URLSearchParams or query string
 */
export function setPosition(specification: string | URLSearchParams, position: XYPosition | undefined): URLSearchParams {
    const parsedSpecification = specification instanceof URLSearchParams ? specification : new URLSearchParams(String(specification || ''));
    if (!position) {
        parsedSpecification.delete('x');
        parsedSpecification.delete('y');
    } else {
        parsedSpecification.set('x', String(position.x | 0));
        parsedSpecification.set('y', String(position.y | 0));
    }
    return parsedSpecification;
}

/**
 * Clamps position coordinates to integers
 */
export function clampPosition(position: XYPosition): XYPosition;
export function clampPosition(position: undefined): undefined;
export function clampPosition(position: XYPosition | undefined): XYPosition | undefined;
export function clampPosition(position: XYPosition | undefined): XYPosition | undefined {
    if (!position) {
        return undefined;
    } if ((position.x | 0) === position.x && (position.y | 0) === position.y) {
        return position;
    }

    return { x: position.x | 0, y: position.y | 0 };
}