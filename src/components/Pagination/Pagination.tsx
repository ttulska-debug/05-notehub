import ReactPaginateModule from "react-paginate";
import css from "./Pagination.module.css";

const ReactPaginate: typeof import("react-paginate").default =
  (ReactPaginateModule as unknown as {
    default: typeof import("react-paginate").default;
  }).default;

interface PaginationProps {
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  pageCount,
  currentPage,
  onPageChange,
}: PaginationProps) {
  return (
    <ReactPaginate
      pageCount={pageCount}
      forcePage={currentPage - 1}
      onPageChange={(selectedItem) =>
        onPageChange(selectedItem.selected + 1)
      }
      containerClassName={css.pagination}
      activeClassName={css.active}
      previousLabel="←"
      nextLabel="→"
      breakLabel="..."
      pageRangeDisplayed={3}
      marginPagesDisplayed={1}
      ariaLabelBuilder={(page) => `Go to page ${page}`}
    />
  );
}