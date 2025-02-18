import { Modal, Input } from 'antd';
import { generateXML, exportXML } from '@/utils/general';
import {
  useAppDispatch,
  useAppSelector,
  setXmlPreviewBoxStatus,
} from '@/lib/redux';

const { TextArea } = Input;

function XMLPreviewBox() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.annotation);

  const {
    imageFiles,
    imageSizes,
    shapes,
    selPreviewIndex,
    xmlPreviewBoxVisible,
  } = state;

  const onOk = () => {
    const xml = generateXML(
      imageFiles[selPreviewIndex],
      imageSizes[selPreviewIndex],
      shapes[selPreviewIndex]
    );
    exportXML(xml, `${imageFiles[selPreviewIndex].name.split('.')[0]}.xml`);
  };

  const onCancel = () => {
    dispatch(
      setXmlPreviewBoxStatus({
        selPreviewIndex: -1,
        xmlPreviewBoxVisible: false,
      })
    );
  };

  return (
    <Modal
      width="400px"
      maskClosable={false}
      title="XML Preview Box"
      open={xmlPreviewBoxVisible}
      onOk={onOk}
      onCancel={onCancel}
      okText="Save"
    >
      {xmlPreviewBoxVisible && (
        <TextArea
          rows={10}
          value={generateXML(
            imageFiles[selPreviewIndex],
            imageSizes[selPreviewIndex],
            shapes[selPreviewIndex]
          )}
        />
      )}
    </Modal>
  );
}

export default XMLPreviewBox;
