import {type ReactElement, type ReactNode, type MouseEvent, useState, useCallback} from "react";
import Overlay from "./Overlay";
import styles from "./menus.module.css";
import {joinCss} from "../util/utils";

type TooltipProps = {
    text: ReactNode,
    children: ReactElement | ReactElement[],
    className?: string,
}

export default function Tooltip({text, children, className}: TooltipProps): ReactElement {
    const [state, setState] = useState({
        visible: false,
        top: 0,
        left: 0,
    });

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



    return (
        <>
            <Overlay
                visible={state.visible}
                top={state.top}
                left={state.left}
                offsetLeft={5}
                offsetTop={5}
                className={joinCss(styles.tooltip, className)}
                modal={false}
            >
                {text}
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