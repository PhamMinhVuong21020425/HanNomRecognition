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

  const items = [
    {
      key: 'file',
      label: (
        <span style={{ fontWeight: 'bolder' }}>
          <FileImageFilled style={{ marginRight: '8px' }} />
          {`Images (${imageFiles.length})`}
        </span>
      ),
      children: <ImageList type={type} />,
      collapsible: 'header' as const,
      extra: <ImageListSetting />,
    },
    {
      key: 'label',
      label: (
        <span style={{ fontWeight: 'bolder' }}>
          <FontAwesomeIcon icon={faTag} style={{ marginRight: '8px' }} />
          {type === ProblemType.DETECT
            ? `Labels (${selDrawImageIndex !== -1 && shapes[selDrawImageIndex] ? shapes[selDrawImageIndex].length : 0})`
            : `Labels (${labelClassify ? 1 : 0})`}
        </span>
      ),
      children:
        type === ProblemType.DETECT ? <LabelList /> : <LabelItemClassify />,
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
