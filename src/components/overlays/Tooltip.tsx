import {type ReactElement, type ReactNode, type MouseEvent, useState, useCallback, useRef} from "react";
import Overlay from "./Overlay.tsx";
import styles from "./menus.module.css";
import {joinCss} from "../../util/utils.ts";
import useNormalizedPosition from "../../hooks/useNormalizedPosition.tsx";

type TooltipProps = {
    text: ReactNode,
    children: ReactElement | ReactElement[],
    className?: string,
    offsetLeft?: number,
    offsetTop?: number,
}

export default function Tooltip(props: TooltipProps): ReactElement {
    const {
        text,
        children,
        className,
        offsetTop = 5,
        offsetLeft = 5
    } = props;

    const [state, setState] = useState({
        visible: false,
        top: 0,
        left: 0,
    });

    const contentRef = useRef<HTMLDivElement | null>(null)

    const onMouseover = useCallback(
        (e: MouseEvent) => {
            setState(() => {
                return {
                    visible: true,
                    top: e.clientY,
                    left: e.clientX,
                }
            })
        },
        [setState],
    );

    const onMouseout = useCallback(
        (e: MouseEvent) => {
            setState({
                visible: false,
                top: e.clientY,
                left: e.clientX,
            })
        },
        [setState],
    );

    const {left, top} = state;
    useNormalizedPosition(contentRef, {left, top}, {left:offsetLeft, top:offsetTop});

    return (
        <>
            <Overlay
                visible={state.visible}
                className={joinCss(styles.tooltip, className)}
                modal={false}
            >
                <div
                    ref={contentRef}
                    className={styles.popup}
                >
                    {text}
                </div>
            </Overlay>
            <div
                onMouseOver={onMouseover}
                onMouseOut={onMouseout}
            >
                {children}
            </div>
        </>
    );
}