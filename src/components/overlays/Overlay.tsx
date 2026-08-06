import {type ReactNode, useCallback, useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import styles from "./menus.module.css";
import {joinCss} from "../../util/utils.ts";
import type {Consumer} from "../../types/types.ts";

type OverlayProps = {
    /** (Boolean)  Whether to display the entire overlay */
    visible: boolean,
    /** The content of the overlay, if any */
    children: ReactNode | ReactNode[],
    /** The amount to move the content over horizontally. */
    offsetLeft?: number,
    /** The amount to move the content over vertically. */
    offsetTop?: number,
    /** Content top */
    top?: number,
    /** Content left */
    left?: number,
    noContextMenu?: boolean,
    className?: string;
    onClickOutside?: Consumer<void>,
    modal?: boolean,
    /** (Boolean) Whether to put the content in the center of the screen */
    center?: boolean,
}

/**
 * This component should always be on top, so it attaches to document.body.
 *
 * @param props
 * @constructor
 */
export default function Overlay(props: OverlayProps): ReactNode | ReactNode[] {
    const {
        visible,
        children,
        top,                    // Don't default this to zero:  breaks centering.
        left,                   // Don't default this to zero:  breaks centering.
        className,
        offsetTop = 0,
        offsetLeft = 0,
        noContextMenu = true,
        modal = true,
        center = false,
    } = props;

    const ref = useRef<HTMLDivElement | null>(null);

    const normalizePosition = useCallback(
        (): {left?: number, top?: number} => {
            if (ref.current != null && left != null && top != null) {
                const result = {left, top};
                if (window.innerWidth - left < (ref.current.offsetWidth + offsetLeft)) {
                    result.left = left - ref.current.offsetWidth - offsetLeft;
                } else {
                    result.left += offsetLeft;
                }
                if (window.innerHeight - top < ref.current.offsetHeight + offsetTop) {
                    result.top = top - ref.current.offsetHeight - offsetTop;
                } else {
                    result.top += offsetTop;
                }
                return result;
            }
            return {};
        },
        [left, top, ref, offsetLeft, offsetTop],
    );


    useEffect(() => {
        if (noContextMenu && ref.current) {
            const onContextMenu = (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
            }
            ref.current?.addEventListener("contextmenu", onContextMenu);


            return () => {
                ref.current?.removeEventListener("contextmenu", onContextMenu);
            }
        }
    }, []);


    useEffect(() => {
        if (ref.current != null) {
            const {left: normalizedLeft, top: normalizedTop} = normalizePosition();
            ref.current.style.top = `${normalizedTop}px`;
            ref.current.style.left = `${normalizedLeft}px`;
        }
    }, [visible]);



    if (visible && document.body != null) {
        return createPortal((
            <div
                className={joinCss(
                    styles.layer,
                    !modal ? styles.nonModal : "",
                    center === true ? styles.center : "",
                )}
            >
                <div
                    ref={ref}
                    className={joinCss(
                        styles.popup,
                        className,
                    )}
                    style={{top: `${top}px`, left: `${left}px`}}
                >
                    {children}
                </div>
            </div>
        ), document.body);
    }
    return "";
}

