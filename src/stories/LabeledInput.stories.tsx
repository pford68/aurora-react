import type {Meta, StoryObj} from '@storybook/react-vite';
import { useState } from 'react';
import {LabeledInput} from '../components/Input';

const meta = {
  title: "Forms/LabeledInput",
  component: LabeledInput,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => {
    const props = {...args};
    const [state, setState] = useState({firstName: args.value})
    props.value = state.firstName;
    props.onChange = (e) => {
      setState({firstName: e.target.value});
    }
    return <LabeledInput {...props} />;
  },
} satisfies Meta<typeof LabeledInput>;

export default meta;
type Story = StoryObj<typeof meta>;


export const Basic: Story = {
  args: {
    text: "First Name",
    name: "firstName",
    value: "Philip",
  },
};
