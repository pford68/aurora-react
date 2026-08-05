import Input, {type InputProps} from "./Input";
import {STATE_CODES} from "../util/constants";


export default function StateList(props: InputProps) {
    const {id} = props;
    const fillStates = () => {
        return Object.keys(STATE_CODES).map((key: string, index: number) => {
            return <option value={key} key={index} />
        })
    }

    return [
        <Input {...props} id={undefined} list={id} autoComplete="off"/>,
        <datalist id={id}>
            {fillStates()}
        </datalist>
    ]
}