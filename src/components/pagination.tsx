import {  useMemo } from "react";

const DOTS = '...';

const range = (start: number, end: number) => {
  let length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

const usePagination = ({
  totalPages,
  currentPage,
  siblings = 1
}: {
  totalPages: number;
  currentPage: number;
  siblings?: number;
}) => {
  const paginationRange = useMemo(() => {
    // Total numbers to show: 1 (first) + 1 (last) + 1 (current) + 2 * siblings + 2 (dots)
    const totalPageNumbers = 5 + 2 * siblings;

    // Case 1: Not enough pages to bother with dots
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblings, 1);
    const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblings;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, lastPageIndex];
    }

    // Case 3: Left dots, but no right dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblings;
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    // This default return should be safe, but it's good practice
    return range(1, totalPages);

  }, [totalPages, currentPage, siblings]);

  return paginationRange || [];
};

// --- Pagination UI Component ---
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination  ({ currentPage, totalPages, onPageChange, isLoading }: PaginationProps)  {
  const paginationRange = usePagination({ currentPage, totalPages, siblings: 1 });

  if (currentPage === 0 || totalPages < 2) {
    return null; // Don't show pagination if there's only one page
  }

  const onNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const lastPage = paginationRange[paginationRange.length - 1];

  const buttonClass = "flex items-center justify-center size-9 rounded-lg transition-colors";
  const textClass = "text-sm font-medium text-white";
  const hoverClass = "hover:bg-gray-700";
  const activeClass = "border-primary-border border-1 bg-black text-primary-foreground! hover:bg-primary-border ";
  const disabledClass = "pointer-events-none opacity-50";

  return (
    <div className="flex w-full justify-center items-center gap-2 text-white">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={currentPage === 1 || isLoading}
        className={`${buttonClass} ${textClass} ${hoverClass} ${ (currentPage === 1 || isLoading) ? disabledClass : '' }`}
      >
        {/* Simple SVG for < */}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      {/* Page Numbers */}
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <span key={index} className={`${buttonClass} ${textClass} ${disabledClass}`}>
              &#8230;
            </span>
          );
        }

        return (
          <button
            key={index}
            onClick={() => onPageChange(pageNumber as number)}
            disabled={isLoading}
            className={`${buttonClass} ${textClass} ${
              pageNumber === currentPage ? activeClass : hoverClass
            } ${isLoading ? disabledClass : ''}`}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={currentPage === lastPage || isLoading}
        className={`${buttonClass} ${textClass} ${hoverClass} ${ (currentPage === lastPage || isLoading) ? disabledClass : '' }`}
      >
        {/* Simple SVG for > */}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    </div>
  );
};