import {type ReactElement, useContext} from "react";
import {joinCss} from "./../../util/utils";
import styles from "./DataGrid.module.css";
import {GridContext} from "./GridContext";
import type {TableColumnProps} from "./TableColumn.tsx";
import type {DataGridEntry} from "./Datagrid.types.ts";

type GridRowProps = Required<Pick<TableColumnProps, "cellFactory">> & {
    row: DataGridEntry,
    rowIndex: number,
    className?: string,
}

export default function GridRow(props: GridRowProps): ReactElement {
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
                return cellFactory((col.props), index, rowIndex, row);
            })}
        </div>
    )
}