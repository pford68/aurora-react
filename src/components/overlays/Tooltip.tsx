import {type ReactElement, type ReactNode, type MouseEvent, useState, useRef} from "react";
import Overlay from "./Overlay.tsx";
import styles from "./overlays.module.css";
import useNormalizedPosition from "../../hooks/useNormalizedPosition.tsx";
import {joinCss} from "../../util/utils.ts";

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

    const onMouseover = (e: MouseEvent) => {
            setState(() => {
                return {
                    visible: true,
                    top: e.clientY,
                    left: e.clientX,
                }
            })
        };

    const onMouseout = (e: MouseEvent) => {
            setState({
                visible: false,
                top: e.clientY,
                left: e.clientX,
            })
        };

    const {left, top} = state;
    useNormalizedPosition(contentRef, {left, top}, {left:offsetLeft, top:offsetTop});

    return (
        <>
            <Overlay
                visible={state.visible}
                modal={false}
            >
                <div
                    ref={contentRef}
                    className={joinCss(styles.popup, className)}
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