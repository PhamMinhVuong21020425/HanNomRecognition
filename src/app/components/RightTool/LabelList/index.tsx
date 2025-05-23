import { useEffect, useRef } from 'react';
import { Row, Col } from 'antd';
import LabelItem from './LabelItem';
import {
  selectSelDrawImageIndex,
  selectSelShapeIndex,
  selectShapes,
  useAppSelector,
} from '@/lib/redux';

function LabelList({ labelMaxHeight }: { labelMaxHeight: number }) {
  const selDrawImageIndex = useAppSelector(selectSelDrawImageIndex);
  const shapes = useAppSelector(selectShapes);
  const selShapeIndex = useAppSelector(selectSelShapeIndex);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selShapeIndex !== -1 && containerRef.current) {
      const element = document.getElementById(
        `label-item-${selDrawImageIndex}-${selShapeIndex}`
      );

      if (element) {
        // Calculate positions relative to the container
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // Calculate where we need to scroll to
        const elementRelativeTop = elementRect.top - containerRect.top;
        const elementRelativeBottom = elementRect.bottom - containerRect.top;

        // If element is not visible or only partially visible
        if (
          elementRelativeTop < 0 ||
          elementRelativeBottom > containerRect.height
        ) {
          // Scroll the element to the center of the container
          const centerPosition =
            elementRelativeTop +
            container.scrollTop -
            containerRect.height / 2 +
            elementRect.height / 2;

          container.scrollTo({
            top: centerPosition,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [selShapeIndex]);

  return (
    <Row
      justify="start"
      style={{ maxHeight: `${labelMaxHeight}px`, overflow: 'auto' }}
      ref={containerRef}
    >
      {shapes[selDrawImageIndex] &&
        Array.isArray(shapes[selDrawImageIndex]) &&
        shapes[selDrawImageIndex].map((item, index) => (
          <Col
            key={`label-item-${selDrawImageIndex}-${index}`}
            xs={24}
            id={`label-item-${selDrawImageIndex}-${index}`}
            className="scroll-mt-8"
          >
            <LabelItem
              index={index}
              label={item.label}
              visible={item.visible}
            />
          </Col>
        ))}
    </Row>
  );
}

export default LabelList;
