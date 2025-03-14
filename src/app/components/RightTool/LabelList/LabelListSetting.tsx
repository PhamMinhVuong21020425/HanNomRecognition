import { cloneDeep } from 'lodash';
import { Dropdown, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import {
  deleteAllShapes,
  selectSelDrawImageIndex,
  selectSelShapeIndex,
  selectShapes,
  setSelShapeIndex,
  setShapes,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

function LabelListSetting() {
  const dispatch = useAppDispatch();
  const selDrawImageIndex = useAppSelector(selectSelDrawImageIndex);
  const shapes = useAppSelector(selectShapes);
  const selShapeIndex = useAppSelector(selectSelShapeIndex);

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
      dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
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
