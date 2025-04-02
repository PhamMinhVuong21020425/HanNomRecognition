import '../scss/ToolHeader.scss';
import axios from '@/lib/axios';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/navigation';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  message,
  Button,
  Avatar,
  Dropdown,
  Space,
  Modal,
  MenuProps,
  notification,
} from 'antd';

import {
  faUser,
  faHome,
  faObjectGroup,
  faRobot,
  faFlask,
  faCaretDown,
  faSquarePen,
  faKey,
  faRightFromBracket,
  faBell,
  faChartLine,
  faProjectDiagram,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

import {
  useAppDispatch,
  useAppSelector,
  setImageFiles,
  selectImagesRedux,
  selectUser,
  selectImagesInfo,
  selectDrawStatus,
  selectShapes,
  selectSelShapeIndex,
} from '@/lib/redux';
import { connectSocket } from '@/lib/socket';
import { imageSizeFactory, formatDateToString } from '@/utils/general';
import { Notification } from '@/entities/notification.entity';
import { NotificationStatus } from '@/enums/NotificationStatus';
import TrainingModal from './TrainingModal';
import ActiveLearningModal from './ActiveLearningModal';

function ToolHeader() {
  const router = useRouter();
  const [isTrainModalVisible, setIsTrainModalVisible] = useState(false);
  const [isALModalVisible, setIsALModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('detection');

  const userData = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const { imageFiles, selDrawImageIndex, imageSizes } = useAppSelector(
    selectImagesInfo,
    shallowEqual
  );
  const drawStatus = useAppSelector(selectDrawStatus);
  const shapes = useAppSelector(selectShapes);
  const selShapeIndex = useAppSelector(selectSelShapeIndex);

  const files = useAppSelector(selectImagesRedux);
  const isFirstRender = useRef(true);

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

  const [selectedModel, setSelectedModel] = useState(modelMenuItems[0]);

  useEffect(() => {
    if (!isFirstRender.current) return;
    isFirstRender.current = false;

    // Connect to socket
    const socket = connectSocket();
    socket.emit('login', userData?.id);

    // Get notifications from the server
    axios
      .get(`/be/notis/${userData?.id}`)
      .then(response => {
        const notifications = response.data;
        setNotifications(notifications);
      })
      .catch(error => {
        console.error('Error fetching notifications:', error);
      });

    socket.on('receive_message', message => {
      console.log('[📡] Received training update:', message);
      let title;
      let status;
      if (message.content.result.status === 'error') {
        title = 'Training Failed';
        status = NotificationStatus.ERROR;
      } else {
        title = 'Training Completed';
        status = NotificationStatus.SUCCESS;
      }

      const notificationData: Partial<Notification> = {
        message: title,
        description: message.content.result.message,
        status,
        created_at: new Date(),
      };
      openNotification(notificationData);
    });

    if (!files || files.length === 0) return;

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

    // Cleanup on component unmount
    return () => {
      socket.off('receive_message');
    };
  }, []);

  const handleGoHome = () => {
    Modal.confirm({
      title: 'Confirm Exit',
      content:
        'Are you sure you want to go back to the Home page? Data may not be saved!',
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: () => router.push('/'),
    });
  };

  const handleGoModel = () => {
    Modal.confirm({
      title: 'Confirm Exit',
      content:
        'Are you sure you want to go to the Model page? Data may not be saved!',
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: () => router.push('/your-model'),
    });
  };

  const handleMenuClick: MenuProps['onClick'] = e => {
    const selected = modelMenuItems.find(item => item.key === e.key);
    if (selected) {
      setSelectedModel(selected);
    }
  };

  const handleTrain = () => {
    setIsTrainModalVisible(true);
  };

  const handleActiveLearning = () => {
    setIsALModalVisible(true);
  };

  const openNotification = async (notificationData: Partial<Notification>) => {
    if (!userData) return;

    const response = await axios.post('/be/notis/create', {
      ...notificationData,
      user: { id: userData.id },
    });
    const newNotification = response.data;

    notification.open({
      message: newNotification.message,
      description: newNotification.description,
      type: newNotification.status,
      duration: 5,
    });

    // Add to notifications list
    setNotifications(prev => [newNotification, ...prev]);
  };

  const clearNotifications = async () => {
    if (!userData) return;
    const response = await axios.post('/be/notis/delete', {
      userId: userData.id,
    });

    if (response.data === true) {
      setNotifications([]);
    }
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
          <div
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('home');
              handleGoHome();
            }}
          >
            <FontAwesomeIcon icon={faHome} className="nav-icon" />
            <span className="nav-text">Home</span>
          </div>

          <div
            className={`nav-item ${activeTab === 'model' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('model');
              handleGoModel();
            }}
          >
            <FontAwesomeIcon icon={faRobot} className="nav-icon" />
            <span className="nav-text">Model</span>
          </div>

          <div
            className={`nav-item ${activeTab === 'detection' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('detection');
            }}
          >
            <FontAwesomeIcon icon={faObjectGroup} className="nav-icon" />
            <span className="nav-text">Detection</span>
          </div>

          <div
            className={`nav-item ${activeTab === 'classification' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('classification');
            }}
          >
            <FontAwesomeIcon icon={faProjectDiagram} className="nav-icon" />
            <span className="nav-text">Classification</span>
          </div>
        </div>
      </div>

      <div className="right-header">
        {/* Notifications Dropdown */}
        <Dropdown
          dropdownRender={() => (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <Button
                    type="text"
                    size="small"
                    onClick={clearNotifications}
                    className="clear-btn"
                  >
                    <FontAwesomeIcon icon={faTrash} className="nav-icon" />
                  </Button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="no-notifications">No new notifications</div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item notification-${notification.status}`}
                  >
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.message}
                      </div>
                      <div className="notification-description">
                        {notification.description}
                      </div>
                      <div className="notification-time">
                        {formatDateToString(notification.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            icon={<FontAwesomeIcon icon={faBell} />}
            className="notifications-button"
          >
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </Button>
        </Dropdown>

        {/* Train Button */}
        <Button
          icon={<FontAwesomeIcon icon={faFlask} />}
          onClick={handleTrain}
          className="train-button"
          type="primary"
        >
          Train
        </Button>

        {/* Active Learning Button (only for Classification tab) */}
        {activeTab === 'classification' && (
          <Button
            icon={<FontAwesomeIcon icon={faChartLine} />}
            onClick={handleActiveLearning}
            className="active-learning-button"
            type="default"
          >
            Active Learning
          </Button>
        )}

        {/* Model Selector Dropdown */}
        <Dropdown
          menu={{
            items: modelMenuItems.map(item => ({
              ...item,
              style:
                item.key === selectedModel.key
                  ? { backgroundColor: '#dbeafe' }
                  : {},
            })),
            onClick: handleMenuClick,
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button className="model-selector" type="default">
            <Space>
              {selectedModel.label}
              <FontAwesomeIcon icon={faCaretDown} />
            </Space>
          </Button>
        </Dropdown>

        {/* User Profile Section */}
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
      </div>

      {/* Training Modal */}
      <TrainingModal
        visible={isTrainModalVisible}
        setVisible={setIsTrainModalVisible}
        openNotification={openNotification}
      />

      {/* Active Learning Modal */}
      <ActiveLearningModal
        visible={isALModalVisible}
        setVisible={setIsALModalVisible}
        openNotification={openNotification}
      />
    </div>
  );
}

export default ToolHeader;
