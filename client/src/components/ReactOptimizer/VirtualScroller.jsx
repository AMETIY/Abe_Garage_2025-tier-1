import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "./VirtualScroller.css";

const VirtualScroller = ({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
  renderItem,
  className = "",
  onScroll,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const scrollRef = useRef(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!containerHeight || !itemHeight) return { start: 0, end: 0 };

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: endIndex,
    };
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange.start, visibleRange.end]);

  // Handle scroll event
  const handleScroll = useCallback(
    (event) => {
      const newScrollTop = event.target.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(event);
    },
    [onScroll]
  );

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = totalHeight - containerHeight;
    }
  }, [totalHeight, containerHeight]);

  // Auto-scroll to bottom when new items are added
  useEffect(() => {
    if (
      scrollRef.current &&
      scrollRef.current.scrollTop + containerHeight >=
        scrollRef.current.scrollHeight - itemHeight
    ) {
      scrollToBottom();
    }
  }, [items.length, scrollToBottom, containerHeight, itemHeight]);

  return (
    <div
      className={`virtual-scroller ${className}`}
      style={{ height: containerHeight }}
      {...props}
    >
      <div
        ref={scrollRef}
        className="virtual-scroller-content"
        style={{ height: totalHeight }}
        onScroll={handleScroll}
      >
        <div
          className="virtual-scroller-items"
          style={{
            transform: `translateY(${visibleRange.start * itemHeight}px)`,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index;
            return (
              <div
                key={actualIndex}
                className="virtual-scroller-item"
                style={{ height: itemHeight }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Optimized list item component
const VirtualListItem = React.memo(
  ({ item, index, renderItem, itemHeight }) => {
    return (
      <div className="virtual-list-item" style={{ height: itemHeight }}>
        {renderItem(item, index)}
      </div>
    );
  }
);

VirtualListItem.displayName = "VirtualListItem";

// HOC for virtual scrolling
const withVirtualScrolling = (Component, options = {}) => {
  return React.memo(({ items, ...props }) => {
    const {
      itemHeight = 50,
      containerHeight = 400,
      overscan = 5,
      renderItem,
    } = options;

    return (
      <VirtualScroller
        items={items}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        overscan={overscan}
        renderItem={renderItem}
        {...props}
      />
    );
  });
};

withVirtualScrolling.displayName = "withVirtualScrolling";

export default VirtualScroller;
