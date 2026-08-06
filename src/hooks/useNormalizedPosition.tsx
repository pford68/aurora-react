import {type RefObject, useLayoutEffect} from "react";
import {normalizePosition} from "../util/layout.tsx";

/**
 * Adjusts the position of the specified DOM node based on proximity to screen edges.
 *
 * @param ref  Refers to the DOM node whose position will be adjusted
 * @param position
 * @param offsets
 */
export default function useNormalizedPosition(
    ref: RefObject<HTMLElement | null>,
    position: Record<string, number | undefined>,
    offsets: Record<string, number >
) {
    const { left, top } = position;
    // Destructure offsets so we can track their actual values
    const offsetLeft = offsets.left;
    const offsetTop = offsets.top;

    useLayoutEffect(() => {
        if (!ref.current) return;

        if (left !== undefined && top !== undefined) {
            const {left: normalizedLeft, top: normalizedTop} = left != undefined && top != undefined
                ? normalizePosition(ref, position, offsets)
                : {};
            if (normalizedTop !== undefined) {
                ref.current.style.top = `${normalizedTop}px`;
            }
            if (normalizedLeft !== undefined) {
                ref.current.style.left = `${normalizedLeft}px`;
            }
        }
    }, [ref, left, top, offsetTop, offsetLeft]);
}