import '../scss/ToolHeader.scss';
import { useEffect, useRef } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import {
  useAppDispatch,
  useAppSelector,
  setImageFiles,
  selectImagesRedux,
  selectUser,
} from '@/lib/redux';
import { imageSizeFactory } from '@/utils/general';

function ToolHeader() {
  const router = useRouter();
  const userData = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.annotation);
  const {
    imageFiles,
    selDrawImageIndex,
    imageSizes,
    drawStatus,
    shapes,
    selShapeIndex,
  } = state;

  const files = useAppSelector(selectImagesRedux);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isFirstRender.current) return;
    if (!files || files.length === 0) return;

    isFirstRender.current = false;

    const msg =
      files.length > 1 ? `${files.length} images` : `${files.length} image`;
    message.success(`Success to load ${msg}.`);

    const newImageFiles = [...imageFiles, ...files];
    const newImageSizes = newImageFiles.map((_, index) =>
      imageSizes[index] ? imageSizes[index] : imageSizeFactory({})
    );
    const newShapes = newImageFiles.map((_, index) =>
      shapes[index] ? shapes[index] : []
    );

    dispatch(
      setImageFiles({
        imageFiles: newImageFiles,
        selDrawImageIndex: selDrawImageIndex > 0 ? selDrawImageIndex : 0,
        imageSizes: newImageSizes,
        drawStatus,
        shapes: newShapes,
        selShapeIndex,
      })
    );
  }, []);

  const handleGoHome = () => {
    if (window.confirm('Chắc chắn thoát? Dữ liệu có thể không được lưu!')) {
      router.push('/import');
    } else {
      return;
    }
  };

  return (
    <div className="tool-header-container">
      <div className="left-header">
        <div className="title">Hanomize</div>
        <div className="link-home" onClick={handleGoHome}>
          Home
        </div>
        <a className="link">Projects</a>
        <a className="link">Tasks</a>
        <a className="link">Models</a>
      </div>
      <div className="right-header">
        <button className="model-name">Default Model</button>
        {userData ? (
          <div className="user-info">
            <div>
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="name">{userData.name}</div>
          </div>
        ) : (
          <div className="user-info">
            <FontAwesomeIcon icon={faUser} />
            <a className="login-link" href="/auth/login">
              Login
            </a>
          </div>
        )}
        <a className="exit" href="/import">
          Thoát
        </a>
      </div>
    </div>
  );
}

export default ToolHeader;
