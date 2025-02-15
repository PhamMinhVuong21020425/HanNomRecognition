import { Collapse } from 'antd';
import { FileImageFilled } from '@ant-design/icons';
import { faTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ImageList from './ImageList';
import ImageListSetting from './ImageList/ImageListSetting';
import LabelList from './LabelList';
import LabelListSetting from './LabelList/LabelListSetting';
import { useAppSelector } from '@/lib/redux';

function RightToolbar() {
  const state = useAppSelector(state => state.annotation);
  const { imageFiles, selDrawImageIndex, shapes } = state;

  const items = [
    {
      key: 'file',
      label: (
        <span style={{ fontWeight: 'bolder' }}>
          <FileImageFilled style={{ marginRight: '8px' }} />
          {`Images (${imageFiles.length})`}
        </span>
      ),
      children: <ImageList />,
      collapsible: 'header' as const,
      extra: <ImageListSetting />,
    },
    {
      key: 'label',
      label: (
        <span style={{ fontWeight: 'bolder' }}>
          <FontAwesomeIcon icon={faTag} style={{ marginRight: '8px' }} />
          {`Labels (${selDrawImageIndex !== 0 ? shapes[selDrawImageIndex].length : 0})`}
        </span>
      ),
      children: <LabelList />,
      collapsible: 'header' as const,
      extra: <LabelListSetting />,
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
