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