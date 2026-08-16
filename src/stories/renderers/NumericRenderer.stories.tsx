import * as React from "react";
import type {Meta} from "@storybook/react-vite";
import NumberRenderer from "../../components/renderers/NumberRenderer.tsx";
import withReadonlyMode from "../../components/renderers/withReadonlyMode.tsx";
import type {ComponentType} from "react";

type PropsAndArgs = React.ComponentProps<typeof NumberRenderer> & {width: number};

const meta: Meta<PropsAndArgs> = {
    title: "renderers/NumericValue",
    component: NumberRenderer,
    args: {
        width: 800,
        name: "Number",
        value: 1992478144,
    },
};

export default meta;


const renderDefault = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <div style={{width: "800px"}}>
            <form style={{width: "50%"}}>
                <label>
                    {props.name}
                    <NumberRenderer {...props} />
                </label>
            </form>
        </div>
    );
};

const Renderer = withReadonlyMode(NumberRenderer as ComponentType<any>);
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
    render: renderDefault,
}

export const WithReadOnlyMode = {
    render: hocRenderer,
}
