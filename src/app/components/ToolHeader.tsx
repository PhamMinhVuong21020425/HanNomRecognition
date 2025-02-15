import '../scss/ToolHeader.scss';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import { useAppSelector, selectUser } from '@/lib/redux';

function ToolHeader() {
  const userData = useAppSelector(selectUser);
  const router = useRouter();

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
