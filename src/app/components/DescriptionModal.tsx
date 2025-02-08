import React from 'react';
import { Modal } from 'antd';
import {
  useAppDispatch,
  useAppSelector,
  selectIsOpenDescript,
  setIsOpenDescript,
} from '@/lib/redux';

function DescriptionModal(props: { description: string }) {
  const check = useAppSelector(selectIsOpenDescript);
  const { description } = props;
  const dispatch = useAppDispatch();

  const handleOk = () => {
    dispatch(setIsOpenDescript(false));
  };
  return (
    <Modal
      title="Mô tả của bạn"
      open={check}
      onOk={handleOk}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      {description}
    </Modal>
  );
}

export default DescriptionModal;
