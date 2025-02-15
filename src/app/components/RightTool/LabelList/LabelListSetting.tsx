import { cloneDeep } from 'lodash';
import { Dropdown, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import {
  deleteAllShapes,
  setSelShapeIndex,
  setShapes,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

function LabelListSetting() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.annotation);
  const { selDrawImageIndex, shapes, selShapeIndex } = state;

  const onShowAllClick = (visible: boolean) => {
    if (shapes[selDrawImageIndex]?.length === 0) return;
    const shapesCopy = cloneDeep(shapes);
    shapesCopy[selDrawImageIndex] = shapesCopy[selDrawImageIndex]?.map(item => {
      if (item.visible === visible) return item;
      const itemCopy = cloneDeep(item);
      itemCopy.visible = visible;
      return itemCopy;
    });
    dispatch(setShapes({ shapes: shapesCopy }));
    if (selShapeIndex) {
      dispatch(setSelShapeIndex({ selShapeIndex: 0 }));
    }
  };

  const onClearAllClick = () => {
    if (shapes[selDrawImageIndex]?.length === 0) return;
    dispatch(deleteAllShapes());
  };

  const items = [
    {
      key: '1',
      label: (
        <Button type="text" size="small" onClick={() => onShowAllClick(true)}>
          Show All
        </Button>
      ),
    },
    {
      key: '2',
      label: (
        <Button type="text" size="small" onClick={() => onShowAllClick(false)}>
          Hide All
        </Button>
      ),
    },
    {
      key: '3',
      label: (
        <Button type="text" size="small" onClick={onClearAllClick}>
          Clear All
        </Button>
      ),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" arrow>
      <SettingOutlined />
    </Dropdown>
  );
}

export default LabelListSetting;
