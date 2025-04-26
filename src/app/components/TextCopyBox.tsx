import { useEffect, useState } from 'react';
import { Input, Modal, Radio, RadioChangeEvent, Space, Typography } from 'antd';
import { MdOutlineCheckCircle } from 'react-icons/md';
import {
  useAppDispatch,
  useAppSelector,
  selectShapes,
  selectSelDrawImageIndex,
  selectTextCopyBoxVisible,
  setTextCopyBoxVisible,
} from '@/lib/redux';
import { sortShapesByColumn, sortShapesByRow } from '@/utils/sort';

type SortMode =
  | 'original'
  | 'topToBottomRightToLeft'
  | 'leftToRightTopToBottom';

const { TextArea } = Input;
const { Text } = Typography;

function TextCopyBox() {
  const dispatch = useAppDispatch();
  const [text, setText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('original');
  const textCopyBoxVisible = useAppSelector(selectTextCopyBoxVisible);
  const shapes = useAppSelector(selectShapes);
  const selDrawImageIndex = useAppSelector(selectSelDrawImageIndex);

  const generateText = (mode: SortMode): string => {
    if (selDrawImageIndex === -1 || !shapes[selDrawImageIndex]) return '';

    let sortedShapes;
    switch (mode) {
      case 'topToBottomRightToLeft': {
        sortedShapes = sortShapesByColumn(shapes[selDrawImageIndex]);
        break;
      }
      case 'leftToRightTopToBottom': {
        sortedShapes = sortShapesByRow(shapes[selDrawImageIndex]);
        break;
      }
      default: {
        const visibleShapes = shapes[selDrawImageIndex].filter(
          shape => shape.visible
        );
        const size = 25;
        sortedShapes = Array.from(
          { length: Math.ceil(visibleShapes.length / size) },
          (_, i) => visibleShapes.slice(i * size, (i + 1) * size)
        );
        break;
      }
    }

    return sortedShapes
      .map(item => item.map(shape => shape.label).join(''))
      .join('\n');
  };

  useEffect(() => {
    if (selDrawImageIndex === -1 || !textCopyBoxVisible) return;
    const newText = generateText(sortMode);
    setText(newText);
    setIsCopied(false);
  }, [selDrawImageIndex, textCopyBoxVisible, sortMode]);

  const onOk = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
  };

  const onCancel = () => {
    dispatch(setTextCopyBoxVisible({ textCopyBoxVisible: false }));
  };

  const handleSortChange = (e: RadioChangeEvent) => {
    setSortMode(e.target.value);
  };

  return (
    <Modal
      width="460px"
      maskClosable={false}
      title="Text Preview Box"
      open={textCopyBoxVisible}
      onOk={onOk}
      onCancel={onCancel}
      okText={
        isCopied ? (
          <div className="flex items-center gap-1">
            <MdOutlineCheckCircle size={12} /> Copied
          </div>
        ) : (
          'Copy'
        )
      }
      okButtonProps={
        isCopied
          ? {
              style: {
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
              },
            }
          : {}
      }
    >
      {textCopyBoxVisible && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Arrangement Options:</Text>
            <Radio.Group
              onChange={handleSortChange}
              value={sortMode}
              style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}
            >
              <Radio value="original" style={{ marginBottom: 8 }}>
                Original
              </Radio>
              <Radio value="topToBottomRightToLeft" style={{ marginBottom: 8 }}>
                Top to Bottom & Right to Left
              </Radio>
              <Radio value="leftToRightTopToBottom">
                Left to Right & Top to Bottom
              </Radio>
            </Radio.Group>
          </div>

          <TextArea
            rows={10}
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <Text type="secondary">
            Note: You can edit the text above if needed.
          </Text>
        </Space>
      )}
    </Modal>
  );
}

export default TextCopyBox;
