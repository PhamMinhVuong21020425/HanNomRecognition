import '../scss/StepAnnotation.scss';
import { FormattedMessage } from 'react-intl';

function StepAnnotation() {
  return (
    <div className="step-container">
      <div className="step-header font-sans">
        <FormattedMessage id="stepannotate.title" />
      </div>
      <div className="step-content">
        <div className="step">
          <div className="step-image">
            <img src="https://www.gemoo-resource.com/tools/img/image_step1.png" />
          </div>
          <div className="step-text">
            <h3 className="title">
              <FormattedMessage id="stepannotate.step1" />
            </h3>
            <p className="direction">
              <FormattedMessage id="stepannotate.step1content" />
            </p>
          </div>
        </div>
        <img
          className="step-arrow"
          src="https://www.gemoo-resource.com/tools/img/step-arrow.svg"
        />
        <div className="step">
          <div className="step-image">
            <img src="https://www.gemoo-resource.com/tools/img/image_step2.png" />
          </div>
          <div className="step-text">
            <h3 className="title">
              <FormattedMessage id="stepannotate.step2" />
            </h3>
            <p className="direction">
              <FormattedMessage id="stepannotate.step2content" />
            </p>
          </div>
        </div>
        <img
          className="step-arrow2"
          src="https://www.gemoo-resource.com/tools/img/step-arrow.svg"
        />
        <div className="step">
          <div className="step-image">
            <img src="https://www.gemoo-resource.com/tools/img/image_step3.png" />
          </div>
          <div className="step-text">
            <h3 className="title">
              <FormattedMessage id="stepannotate.step3" />
            </h3>
            <p className="direction">
              <FormattedMessage id="stepannotate.step3content" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepAnnotation;
