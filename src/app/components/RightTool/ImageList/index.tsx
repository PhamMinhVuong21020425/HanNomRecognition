import { useEffect, useRef } from 'react';
import { Row, Col } from 'antd';
import ImageItem from './ImageItem';
import { ProblemType } from '@/enums/ProblemType';
import {
  selectImageFiles,
  selectSelDrawImageIndex,
  useAppSelector,
} from '@/lib/redux';

function ImageList({ type }: { type: ProblemType }) {
  const imageFiles = useAppSelector(selectImageFiles);
  const selDrawImageIndex = useAppSelector(selectSelDrawImageIndex);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selDrawImageIndex !== -1 && containerRef.current) {
      const itemName = imageFiles[selDrawImageIndex].name;
      const element = document.getElementById(`image-item-${itemName}`);

      if (element && containerRef.current) {
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
  }, [selDrawImageIndex]);

  return (
    <Row
      className="max-h-[250px]"
      justify="start"
      style={{ overflow: 'auto' }}
      ref={containerRef}
    >
      {imageFiles.map((item, index) => (
        <Col key={item.name} id={`image-item-${item.name}`} xs={24}>
          <ImageItem
            index={index}
            name={`${item.name.split('$$').pop()}`}
            type={type}
          />
        </Col>
      ))}
    </Row>
  );
}

export default ImageList;
