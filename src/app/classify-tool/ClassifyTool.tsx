'use client';
import '../scss/ClassifyTool.scss';
import { useEffect } from 'react';
import { Row, Col } from 'antd';
import LeftToolbarClassify from './LeftToolBarClassify';
import RightToolbar from '../components/RightTool';
import SVGWrapper from '../components/SVGWrapper';
import TopBarClassify from './TopBarClassify';
import ToolHeader from '../components/ToolHeader';
import Footer from '../components/Footer';
import { getIntl } from '@/utils/i18n';
import { ProblemType } from '@/enums/ProblemType';
import { useAppSelector, selectLanguage } from '@/lib/redux';

function ClassifyTool() {
  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'metadata.classify-tool.title',
    });
  }, [locale]);

  return (
    <div>
      <Row className="mb-24" justify="center" style={{ height: '100%' }}>
        <ToolHeader type={ProblemType.CLASSIFY} />
        <TopBarClassify />
        <Col xs={24} style={{ height: '100%' }}>
          <Row
            className="tool-container"
            justify="center"
            style={{ height: '100%' }}
          >
            <Col
              className="left-tool"
              xs={24}
              md={1}
              style={{ maxHeight: '100%', overflow: 'hidden' }}
            >
              <div className="inner-left-tool">
                <LeftToolbarClassify />
              </div>
            </Col>
            <Col className="main-tool" xs={24} md={19} style={{}}>
              <Row justify="center" style={{ height: '100%' }}>
                <Col
                  className="center-tool"
                  xs={24}
                  style={{ height: 'calc(100% - 30px)' }}
                >
                  <SVGWrapper />
                </Col>
              </Row>
            </Col>
            <Col
              className="right-tool"
              xs={24}
              md={4}
              style={{ maxHeight: '100%', overflow: 'auto' }}
            >
              <RightToolbar type={ProblemType.CLASSIFY} />
            </Col>
          </Row>
        </Col>
      </Row>
      <Footer />
    </div>
  );
}

export default ClassifyTool;
