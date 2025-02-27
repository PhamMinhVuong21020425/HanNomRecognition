'use client';
import '../scss/AnnotationTool.scss';
import { useEffect } from 'react';
import { Row, Col } from 'antd';
import SVGWrapper from '../components/SVGWrapper';
import LeftToolbar from '../components/LeftTool';
import LabelBox from '../components/LabelBox';
import RightToolbar from '../components/RightTool';
import XMLPreviewBox from '../components/XMLPreviewBox';
import TopBar from '../components/TopBar';
import ToolHeader from '../components/ToolHeader';
import Footer from '../components/Footer';
import { getIntl } from '@/utils/i18n';
import { useAppSelector, selectLanguage } from '@/lib/redux';

function AnnotationTool() {
  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'metadata.annotation-tool.title',
    });
  }, [locale]);

  return (
    <div>
      <Row className="mb-24" justify="center" style={{ height: '100%' }}>
        <ToolHeader />
        <TopBar />
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
                <LeftToolbar />
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
                {/* <Col xs={24} style={{ height: '30px' }}>
                  Status
                </Col> */}
              </Row>
            </Col>
            <Col
              className="right-tool"
              xs={24}
              md={4}
              style={{ maxHeight: '100%', overflow: 'auto' }}
            >
              <RightToolbar />
            </Col>
            <LabelBox />
            <XMLPreviewBox />
          </Row>
        </Col>
      </Row>
      <Footer />
    </div>
  );
}

export default AnnotationTool;
