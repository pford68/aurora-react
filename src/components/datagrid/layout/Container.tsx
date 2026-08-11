import {type ReactElement, useRef} from "react";
import styles from "./Container.module.css";
import {joinCss} from "../../../util/utils";
import {ContainerContext as ContainerContext1, containerContext} from "./ContainerContext.tsx";


type ContainerProps = {
    resizable: boolean,
    height?: number,
    children: ReactElement,
    border?: boolean,
    width?: number,
    className?: string,
}

/**
 *
 * @param props
 * @constructor
 */
export default function Container(props: ContainerProps) {
    const {
        height,
        resizable = false,
        width,
        children,
        className,
        border,
    } = props;

    const ref = useRef<HTMLDivElement | null>(null);

    return (
        <div
            ref={ref}
            className={joinCss(
                styles.container,
                resizable ? styles.resizable : "",
                border === true ? styles.border : styles.borderless,
                className
            )}
            style={{height: `${height}px`, width: `${width != null ? `${width}px` : "auto"}`}}
        >
            <ContainerContext1 value={{
                ...containerContext,
                containerRef: ref,
            }}>
                {children}
            </ContainerContext1>
        </div>
    );
}


