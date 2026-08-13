import * as React from "react";
import StringRenderer from "../../components/renderers/StringRenderer";
import withReadonlyMode from "../../components/renderers/withReadonlyMode.tsx";
import type {Meta} from "@storybook/react-vite";
import type {ComponentType} from "react";

type PropsAndArgs = React.ComponentProps<typeof StringRenderer> & {
    width: number,
};

const meta:Meta<PropsAndArgs> = {
    title: "renderers/StringRenderer",
    component: StringRenderer,
    args: {
        width: 800,
        name: "First Name",
        value: "Luka",
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
                    <StringRenderer {...props} />
                </label>
            </form>
        </div>
    );
};


const Renderer = withReadonlyMode(StringRenderer as ComponentType<any>);
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
    render: defaultRenderer
}

export const WithReadOnlyMode = {
    render: hocRenderer
}
