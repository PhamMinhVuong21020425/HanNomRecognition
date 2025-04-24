import { useRef, useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { Collapse } from 'antd';
import { FileImageFilled } from '@ant-design/icons';
import { faTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ImageList from './ImageList';
import ImageListSetting from './ImageList/ImageListSetting';
import LabelList from './LabelList';
import LabelListSetting from './LabelList/LabelListSetting';
import LabelItemClassify from '../LabelItemClassify';
import { ProblemType } from '@/enums/ProblemType';
import { selectImagesInfo, selectShapes, useAppSelector } from '@/lib/redux';

function RightToolbar({ type }: { type: ProblemType }) {
  const { imageFiles, selDrawImageIndex } = useAppSelector(
    selectImagesInfo,
    shallowEqual
  );
  const shapes = useAppSelector(selectShapes);
  const labelClassify = imageFiles[selDrawImageIndex]?.label;

  const imageListRef = useRef<HTMLDivElement>(null);
  const [labelMaxHeight, setLabelMaxHeight] = useState(400);

  useEffect(() => {
    const containerHeight = 650;
    if (imageListRef.current) {
      const imageHeight = imageListRef.current.offsetHeight;
      setLabelMaxHeight(containerHeight - imageHeight);
    }
  }, [imageFiles.length]);

  const items = [
    {
      key: 'file',
      label: (
        <span className="font-bold">
          <FileImageFilled className="mr-2" />
          {`Images (${imageFiles.length})`}
        </span>
      ),
      children: (
        <div ref={imageListRef}>
          <ImageList type={type} />
        </div>
      ),
      collapsible: 'header' as const,
      extra: <ImageListSetting />,
    },
    {
      key: 'label',
      label: (
        <span className="font-bold">
          <FontAwesomeIcon icon={faTag} className="mr-2" />
          {type === ProblemType.DETECT
            ? `Labels (${selDrawImageIndex !== -1 && shapes[selDrawImageIndex] ? shapes[selDrawImageIndex].length : 0})`
            : `Labels (${labelClassify ? 1 : 0})`}
        </span>
      ),
      children: (
        <div
          className="overflow-auto"
          style={{ maxHeight: `${labelMaxHeight}px` }}
        >
          {type === ProblemType.DETECT ? <LabelList /> : <LabelItemClassify />}
        </div>
      ),
      collapsible: 'header' as const,
      extra: type === ProblemType.DETECT ? <LabelListSetting /> : null,
    },
  ];

  return (
    <Collapse
      bordered={false}
      defaultActiveKey={['file', 'label']}
      items={items}
    />
  );
}

export default RightToolbar;
