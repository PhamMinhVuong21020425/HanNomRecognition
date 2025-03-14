import { useState, useEffect } from 'react';
import { Modal, Input } from 'antd';
import { shallowEqual } from 'react-redux';

import {
  fetchFileFromObjectUrl,
  generateXML,
  exportXML,
} from '@/utils/general';

import {
  useAppDispatch,
  useAppSelector,
  setXmlPreviewBoxStatus,
  selectImagesInfo,
  selectShapes,
  selectSelPreviewIndex,
  selectXmlPreviewBoxVisible,
} from '@/lib/redux';

const { TextArea } = Input;

function XMLPreviewBox() {
  const dispatch = useAppDispatch();
  const [xml, setXml] = useState('');

  const { imageFiles, imageSizes } = useAppSelector(
    selectImagesInfo,
    shallowEqual
  );
  const shapes = useAppSelector(selectShapes);
  const selPreviewIndex = useAppSelector(selectSelPreviewIndex);
  const xmlPreviewBoxVisible = useAppSelector(selectXmlPreviewBoxVisible);

  useEffect(() => {
    if (selPreviewIndex === -1) return;
    const img = imageFiles[selPreviewIndex];
    fetchFileFromObjectUrl(img.obj_url, img.name).then(file => {
      setXml(
        generateXML(file, imageSizes[selPreviewIndex], shapes[selPreviewIndex])
      );
    });
  }, [selPreviewIndex]);

  const onOk = () => {
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
      {xmlPreviewBoxVisible && <TextArea rows={10} value={xml} />}
    </Modal>
  );
}

export default XMLPreviewBox;
