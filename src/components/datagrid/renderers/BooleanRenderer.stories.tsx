import * as React from "react";
import type {Meta} from "@storybook/react-vite";
import BooleanRenderer from "./BooleanRenderer.tsx";
import withReadonlyMode from "./withReadonlyMode.tsx";


type PropsAndArgs = React.ComponentProps<typeof BooleanRenderer> & {
    width: number,
};

const meta: Meta<PropsAndArgs> = {
    title: "renderers/BooleanRenderer",
    component: BooleanRenderer,
    args: {
        width: 800,
        type: "text",
    },
    argTypes: {
        value: {
            control: {type: "boolean"}
        }
    }
};

export default meta;


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <div style={{width: "800px"}}>
            <form style={{width: "50%"}}>
                <label>
                    {props.name}
                    <BooleanRenderer {...props} />
                </label>
            </form>
        </div>
    );
};

const Renderer = withReadonlyMode(BooleanRenderer);
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
    render: hocRenderer,
}

