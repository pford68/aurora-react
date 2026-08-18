import * as React from "react";
import StatefulInput from "./StatefulInput.tsx";
import styles from "../../../stories/css/Renderers.stories.module.css";
import type {Meta} from "@storybook/react-vite";

type PropsAndArgs = React.ComponentProps<typeof StatefulInput> & {width: number, name: string};

const meta: Meta<PropsAndArgs> = {
    title: "renderers/StatefulInput",
    component: StatefulInput,
    args: {
        width: 800,
        name: "Message",
        value: "Hello, world!",
        placeholder: "NULL",
        readOnly: false,
        disabled: false,
        type: "text",
    },
    argTypes: {
        type: {
            options: ['text', 'tel', 'url', 'date', "datetime-local", "email", "search", "range", "number"],
            control: {type: "radio"}
        }
    },
};
export default meta;

const renderDefault = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <div style={{width: "800px"}}>
            <form style={{width: "50%"}} className={styles.form}>
                <label>
                    {props.name}
                    <StatefulInput {...props} />
                </label>
            </form>
        </div>
    );
};

export const Primary = {
    args: {
        type: "tel"
    },

    render: renderDefault
}

export const Required  = {
    render: renderDefault,
    args: {
        validator: (v:string) => v != null && v.trim().length > 0
    },
}

