import * as React from "react";
import type {Meta} from "@storybook/react-vite";
import Toggle from "./Toggle.tsx";
import withReadonlyMode from "../datagrid/withReadonlyMode.tsx";


type PropsAndArgs = React.ComponentProps<typeof Toggle> & {
    width: number,
};

const meta: Meta<PropsAndArgs> = {
    title: "renderers/Toggle",
    component: Toggle,
    args: {
        width: 800,
        type: "checkbox",
        active: false,
    },
    argTypes: {
        type: {
            options: ["checkbox", "switch"],
            control: {type: "radio"}
        },
    },
};

export default meta;


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <div style={{width: "800px"}}>
            <form style={{width: "50%"}}>
                <label>
                    {props.name}
                    <Toggle {...props} />
                </label>
            </form>
        </div>
    );
};

const Renderer = withReadonlyMode(Toggle);
const hocRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <div style={{width: "800px"}}>
            <form style={{width: "50%"}}>
                <label>
                    {props.name}
                    <Renderer {...props} />
                </label>
            </form>
        </div>
    );
};


export const Primary = {
    render: defaultRenderer,
}

export const WithReadOnlyMode = {
    args: {
        type: "checkbox"
    },

    render: hocRenderer
}

