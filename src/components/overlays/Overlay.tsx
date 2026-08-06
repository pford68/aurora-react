import {type ReactNode, useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import styles from "./menus.module.css";
import {joinCss} from "../../util/utils.ts";
import type {Consumer} from "../../types/types.ts";
import {normalizePosition} from "../../util/layout.tsx";

/*
I don't want to set either CSS position pros to "undefinedpx."
This function constructs the positioning.
 */
function getCoords(
    left: number | undefined,
    top: number | undefined
): {left?: string, top?: string} {
    const coords: {left?: string, top?: string} = {};
    if (left != null) coords.left = `${left}px`;
    if (top != null) coords.top = `${top}px`;
    return coords;
}

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
    /**
     * (Boolean) Whether to put the content in the center of the screen
     * Will override top/left.
     */
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
        top,                    // If null, let flow take over
        left,                   // If null, let flow take over
        className,
        offsetTop = 0,
        offsetLeft = 0,
        noContextMenu = true,
        modal = true,
        center = false,
    } = props;

    const ref = useRef<HTMLDivElement | null>(null);

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
        if (!center && ref.current != null) {
            const {left: normalizedLeft, top: normalizedTop} = left != undefined && top != undefined
                ? normalizePosition(ref, {left, top}, {left: offsetLeft, top: offsetTop})
                : {};
            if (normalizedTop !== undefined) {
                ref.current.style.top = `${normalizedTop}px`;
            }
            if (normalizedLeft !== undefined) {
                ref.current.style.left = `${normalizedLeft}px`;
            }
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
                    style={!center ? getCoords(left, top) : {}}
                >
                    {children}
                </div>
            </div>
        ), document.body);
    }
    return "";
}

