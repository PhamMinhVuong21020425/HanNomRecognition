import '../scss/PopupAnnotation.scss';
import { useState } from 'react';
import { Modal, Select, Upload, message } from 'antd';
import { UploadChangeParam, UploadFile } from 'antd/es/upload';
import { InboxOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';

import request from '@/lib/axios';
import {
  useAppSelector,
  useAppDispatch,
  setIsUploadModal,
  selectIsUploadModal,
  selectUser,
} from '@/lib/redux';

const { Dragger } = Upload;

const handleCreateModel = async (
  userId: string,
  modelName: string,
  status: string,
  description: string,
  content: string,
  format: string
) => {
  const d = new Date();
  return request.post('/user/upload-model', {
    user_id: userId,
    name: modelName,
    model_date: d.toLocaleDateString(),
    status: status,
    description: description,
    content: content,
    format: format,
  });
};

type PopupAnnotationProps = {
  name: string;
  description: string;
};

function PopupAnnotation(props: PopupAnnotationProps) {
  const { name, description } = props;
  const dispatch = useAppDispatch();
  const check = useAppSelector(selectIsUploadModal);
  const [format, setFormat] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({
    format: '',
    content: '',
  });

  const userData = useAppSelector(selectUser);
  const userId = userData!.id;

  const onCancel = () => {
    dispatch(setIsUploadModal(false));
  };
  const handleSelectFile = (info: UploadChangeParam<UploadFile<any>>) => {
    const file = info.file.originFileObj;
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      function () {
        // convert file to base64 string using reader.result
        setContent(reader.result!.toString());
      },
      false
    );

    if (file) {
      reader.readAsDataURL(file);
    }

    // reader.onload = function (event) {
    //     // event.target.result chứa nội dung của tệp dưới dạng ArrayBuffer
    //     let fileContent = event.target.result;

    //     // Chuyển đổi ArrayBuffer thành chuỗi base64
    //     let base64String = btoa(String.fromCharCode(...new Uint8Array(fileContent)));

    //     // Sử dụng base64String theo nhu cầu của bạn, ví dụ: gửi đến máy chủ
    //     console.log(base64String);
    //     //setContent(base64String.toString());
    // };

    // reader.readAsArrayBuffer(file);
  };
  const handleOkUpload = async () => {
    const newErrors = {
      format: '',
      content: '',
    };
    let isValid = true;
    if (format === '') {
      newErrors.format = 'Please select annotation format';
      isValid = false;
    }
    if (content === '') {
      newErrors.content = 'Please select a file';
      isValid = false;
    }
    setErrors(newErrors);
    if (!isValid) {
      return;
    }

    await handleCreateModel(userId, name, '', description, content, format);

    dispatch(setIsUploadModal(true));
    message.success('Đã thực hiện thành công!');
    setContent('');
    dispatch(setIsUploadModal(false));
  };

  return (
    <Modal
      className="modal-content"
      title={
        <div className="modal-header" style={{ width: '100%', cursor: 'move' }}>
          Import annotation
        </div>
      }
      open={check}
      onCancel={onCancel}
      onOk={handleOkUpload}
    >
      <div className="modal-body">
        <div className="import-format">
          <div className="title">
            Import format <span className="force">*</span>
          </div>
          <div className="select-format">
            <Select
              className="select-tag"
              placeholder="Select annotation format"
              optionFilterProp="children"
              onChange={value => setFormat(value)}
              options={[
                {
                  value: 'coco',

                  label: (
                    <>
                      <FontAwesomeIcon
                        style={{ paddingRight: '8px', color: '#1890ff' }}
                        icon={faArrowUpFromBracket}
                      />
                      COCO
                    </>
                  ),
                },
                {
                  value: 'yolo',
                  label: (
                    <>
                      <FontAwesomeIcon
                        style={{ paddingRight: '8px', color: '#1890ff' }}
                        icon={faArrowUpFromBracket}
                      />
                      YOLO
                    </>
                  ),
                },
              ]}
            />
          </div>
          <div className="error-message">{errors.format}</div>
        </div>
        <div className="import-file">
          <Dragger maxCount={1} onChange={value => handleSelectFile(value)}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
          </Dragger>
        </div>
        <div className="error-message">{errors.content}</div>
      </div>
    </Modal>
  );
}

export default PopupAnnotation;
