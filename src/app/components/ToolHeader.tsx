import '../scss/ToolHeader.scss';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FormattedMessage } from 'react-intl';
import { message, Button, Avatar, Dropdown, Space, Modal } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faHome,
  faProjectDiagram,
  faTasks,
  faRobot,
  faSignOutAlt,
  faCaretDown,
  faSquarePen,
  faKey,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

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
    Modal.confirm({
      title: 'Xác nhận thoát',
      content: 'Chắc chắn thoát? Dữ liệu có thể không được lưu!',
      okText: 'Thoát',
      cancelText: 'Hủy',
      onOk: () => router.push('/'),
    });
  };

  const userMenuItems = [
    {
      key: '1',
      label: (
        <Link href="/" className="account-link">
          <i className="icon">
            <FontAwesomeIcon icon={faSquarePen} />
          </i>
          <span className="title">
            <FormattedMessage id="homeheader.profile" />
          </span>
        </Link>
      ),
    },
    {
      key: '2',
      label: (
        <Link href="/" className="account-link">
          <i className="icon">
            <FontAwesomeIcon icon={faKey} />
          </i>
          <span className="title">
            <FormattedMessage id="homeheader.changepass" />
          </span>
        </Link>
      ),
    },
    {
      key: '3',
      label: (
        <Link href="/be/auth/logout" className="account-link">
          <i className="icon">
            <FontAwesomeIcon icon={faRightFromBracket} />
          </i>
          <span className="title">
            <FormattedMessage id="homeheader.logout" />
          </span>
        </Link>
      ),
      danger: true,
    },
  ];

  const modelMenuItems = [
    {
      key: '1',
      label: 'Default Model',
    },
    {
      key: '2',
      label: 'Custom Model 1',
    },
    {
      key: '3',
      label: 'Custom Model 2',
    },
  ];

  return (
    <div className="tool-header-container">
      <div className="left-header">
        <div className="logo">
          <img
            src="/images/logo.png"
            alt="Hanomize Logo"
            className="logo-image"
          />
          <span className="brand-name">Hanomize</span>
        </div>

        <div className="navigation">
          <div className="nav-item" onClick={handleGoHome}>
            <FontAwesomeIcon icon={faHome} className="nav-icon" />
            <span className="nav-text">Home</span>
          </div>

          <Link href="/projects" className="nav-item">
            <FontAwesomeIcon icon={faProjectDiagram} className="nav-icon" />
            <span className="nav-text">Projects</span>
          </Link>

          <Link href="/tasks" className="nav-item">
            <FontAwesomeIcon icon={faTasks} className="nav-icon" />
            <span className="nav-text">Tasks</span>
          </Link>

          <Link href="/models" className="nav-item">
            <FontAwesomeIcon icon={faRobot} className="nav-icon" />
            <span className="nav-text">Models</span>
          </Link>
        </div>
      </div>

      <div className="right-header">
        <Dropdown
          menu={{ items: modelMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button className="model-selector" type="default">
            <Space>
              Default Model
              <FontAwesomeIcon icon={faCaretDown} />
            </Space>
          </Button>
        </Dropdown>

        {userData ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <div className="user-profile">
              <Avatar
                size="small"
                icon={<FontAwesomeIcon icon={faUser} />}
                className="user-avatar"
              />
              <span className="username">{userData.name}</span>
              <FontAwesomeIcon icon={faCaretDown} className="dropdown-icon" />
            </div>
          </Dropdown>
        ) : (
          <Link href="/auth/login" className="login-button">
            <FontAwesomeIcon icon={faUser} className="login-icon" />
            <span>Login</span>
          </Link>
        )}

        <Button
          type="primary"
          danger
          icon={<FontAwesomeIcon icon={faSignOutAlt} />}
          onClick={handleGoHome}
          className="exit-button"
        >
          <span className="exit-text">Exit</span>
        </Button>
      </div>
    </div>
  );
}

export default ToolHeader;
