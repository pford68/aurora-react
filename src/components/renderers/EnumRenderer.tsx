import {type ReactElement} from "react";
import type {BaseRendererProps} from "./types.ts";
import Text from "./Text.tsx";
import StatefulInput from "./StatefulInput.tsx";
import {v4 as uuid} from "uuid";
import styles from "./Renderers.module.css";
import {joinCss} from "../../util/utils.ts";
import type {Role} from "../../types/types.ts";

type EnumRendererProps = BaseRendererProps<string> & {
    listItems: string[],
    role: Role,
}

export default function EnumRenderer(props: EnumRendererProps): ReactElement {
    const {
        name,
        active,
        value,
        rendererRef,
        className,
        listItems,
    } = props;

    const nextProps = {
        name,
        value: String(value),
    }

    if (!active) {
        return <Text value={value} className={className} />;
    }

    const listId = uuid();

    return (
        <section className={joinCss(styles.container, styles.enum)}>
            <StatefulInput
                {...nextProps}
                ref={rendererRef}
                list={listId}
                type="text"
                autoComplete={false}
            />
            <datalist id={listId}>
                {listItems.map(item => <option value={item} />)}
            </datalist>
        </section>
    );
}