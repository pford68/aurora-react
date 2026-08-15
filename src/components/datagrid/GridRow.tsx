import {type ReactElement, useContext} from "react";
import type {Struct} from "../../types/types";
import {joinCss} from "./../../util/utils";
import styles from "./DataGrid.module.css";
import {GridContext} from "./GridContext";
import type {TableColumnProps} from "./TableColumn.tsx";

type GridRowProps<T extends Struct, V> = {
    row: T,
    rowIndex: number,
    className?: string,
    cellFactory: (columnConfig: TableColumnProps<V>, index: number, rowIndex: number, row: T) => ReactElement,
}

export default function GridRow<T extends Struct, V>(props: GridRowProps<T, V>): ReactElement {
    const {
        row,
        rowIndex,
        cellFactory
    } = props;

    const gridContext = useContext(GridContext);
    const {columns, alternateRows} = gridContext;

    return (
        <div className={joinCss(styles.row, alternateRows && rowIndex % 2 !== 0 ? styles.alternate : "")}>
            {columns.map((col, index) => {
                return cellFactory((col.props as TableColumnProps<V>), index, rowIndex, row);
            })}
        </div>
    )
}