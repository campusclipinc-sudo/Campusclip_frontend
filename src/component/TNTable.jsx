import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button, Table } from "react-bootstrap";
import PropTypes from "prop-types";
import { Row, Col } from "react-bootstrap";
import "../scss/TNTable.scss";
const initialState = {
  queryPageIndex: 0,
};

const PAGE_CHANGED = "PAGE_CHANGED";

const reducer = (state, { type, payload }) => {
  switch (type) {
    case PAGE_CHANGED:
      return {
        ...state,
        queryPageIndex: payload,
      };
    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
};

function TNTable({
  columns,
  data,
  paginationData,
  onSelectPage,
  idName = "",
  pageIndexGet = 0,
}) {
  initialState.queryPageIndex = pageIndexGet;

  const [{ queryPageIndex }, dispatch] = React.useReducer(
    reducer,
    initialState,
  );

  const tableInstance = useReactTable({
    columns,
    data,
    initialState: {
      pagination: { pageIndex: queryPageIndex },
    },
    autoResetFilters: false,
    manualPagination: true,
    pageCount: paginationData ? paginationData.last_page : 1,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const {
    getHeaderGroups,
    getRowModel,
    getCanPreviousPage,
    getCanNextPage,
    setPageIndex,
    nextPage,
    previousPage,
    getPageCount,
    getState,
  } = tableInstance;

  const pageIndex = getState().pagination?.pageIndex || 0;
  const rows = getRowModel().rows;
  const firstPageRows = rows ? rows.slice(0, 20) : [];

  React.useEffect(() => {
    if (pageIndex !== undefined) {
      onSelectPage(pageIndex);
      dispatch({ type: PAGE_CHANGED, payload: pageIndex });
    }
  }, [pageIndex]);

  return (
    <>
      <Table
        responsive
        className="text-center table-sortable booking-list"
        id={idName}
      >
        {/* 🔹 Table Header (Fixed getHeaderProps Error) */}
        <thead className="align-middle">
          {getHeaderGroups().map((headerGroup) => {
            return (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(({ column }) => (
                  <th key={column.id} className="table-header">
                    {flexRender(column.columnDef.header, column)}
                    <span>
                      {column.getIsSorted()
                        ? column.getIsSorted() === "desc"
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
                  </th>
                ))}
              </tr>
            );
          })}
        </thead>

        {/* 🔹 Table Body (Fixed getCellProps and renderCell Errors) */}
        <tbody className="table-body">
          {firstPageRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>Data not found</td>
            </tr>
          ) : (
            firstPageRows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="table-content">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <br />
      {/* 🔹 Pagination Controls */}
      {paginationData &&
        Number(paginationData.total) > Number(paginationData.per_page) && (
          <div className="paginationtable">
            <Row className={firstPageRows.length === 0 ? "d-none" : ""}>
              <Col lg={12} xs={12} className="d-flex justify-content-center">
                <div className="tablepagination d-flex justify-content-center gap-1 align-items-center">
                  <Button
                    onClick={() => setPageIndex(0)}
                    disabled={!getCanPreviousPage()}
                    className="table-btn"
                  >
                    {"<<"}
                  </Button>
                  <Button
                    onClick={() => previousPage()}
                    disabled={!getCanPreviousPage()}
                    className="table-btn"
                  >
                    {"<"}
                  </Button>
                  <span>
                    Page{" "}
                    <strong>
                      {pageIndex + 1} of {getPageCount()}
                    </strong>
                  </span>
                  <Button
                    onClick={() => nextPage()}
                    disabled={!getCanNextPage()}
                    className="table-btn"
                  >
                    {">"}
                  </Button>
                  <Button
                    onClick={() => setPageIndex(getPageCount() - 1)}
                    disabled={!getCanNextPage()}
                    className="table-btn"
                  >
                    {">>"}
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        )}
    </>
  );
}

TNTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  paginationData: PropTypes.object,
  t: PropTypes.func.isRequired,
  idName: PropTypes.string,
  onSelectPage: PropTypes.func.isRequired,
  pageIndexGet: PropTypes.number,
};

export default TNTable;
