import type {RefObject} from "react";

export function normalizePosition(
    ref: RefObject<HTMLElement | null>,
    position: Record<string, number | undefined>,
    offsets: Record<string, number>
) {
    const {left, top} = position;
    const {left:offsetLeft, top:offsetTop} = offsets;
    if (ref.current != null && left != null && top != null) {
        const normalized: Record<string, number> = {left, top};
        if (window.innerWidth - left < (ref.current.offsetWidth + offsetLeft)) {
            normalized.left = left - ref.current.offsetWidth - offsetLeft;
        } else {
            normalized.left += offsetLeft;
        }
        if (window.innerHeight - top < ref.current.offsetHeight + offsetTop) {
            normalized.top = top - ref.current.offsetHeight - offsetTop;
        } else {
            normalized.top += offsetTop;
        }

        return normalized;
    }

    return {};
}

/*
I don't want to set either CSS position pros to "undefinedpx."
This function constructs the positioning.
 */
export function getCoords(
    left: number | undefined,
    top: number | undefined
): {left?: string, top?: string} {
    const coords: {left?: string, top?: string} = {};
    if (left != null) coords.left = `${left}px`;
    if (top != null) coords.top = `${top}px`;
    return coords;
}