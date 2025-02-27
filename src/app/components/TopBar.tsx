import '../scss/TopBar.scss';
import { ChangeEvent } from 'react';
import { message } from 'antd';
import { Dropdown, Button } from 'antd';
import JSZip from 'jszip';

import { ANNOTATION_TYPES, IMAGE_TYPES } from '@/constants';

import {
  getURLExtension,
  imageSizeFactory,
  generateCoco,
  exportZip,
  generateYolo,
  fetchFileFromObjectUrl,
} from '@/utils/general';

import {
  useAppDispatch,
  useAppSelector,
  setImageFiles,
  setSelShapeIndex,
  setSelDrawImageIndex,
  setFullScreen,
} from '@/lib/redux';
import { ImageType } from '@/types/ImageType';

function TopBar() {
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

  const onFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).filter(file =>
      IMAGE_TYPES.some(type => file.type.includes(type))
    );

    const newImagesState: ImageType[] = [];

    const formData = new FormData();
    newFiles.forEach(image => {
      formData.append('files', image);
      newImagesState.push({
        obj_url: URL.createObjectURL(image),
        name: image.name,
      });
    });

    // const response = await axios.post(
    //   'http://localhost:5000/api/detect',
    //   formData,
    //   {
    //     headers: { 'Content-Type': 'multipart/form-data' },
    //   }
    // );

    const newImageFiles = [...imageFiles, ...newImagesState];
    const newImageSizes = newImageFiles.map((item, index) =>
      imageSizes[index] ? imageSizes[index] : imageSizeFactory({})
    );
    const newShapes = newImageFiles.map((item, index) =>
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
    const msg =
      files.length > 1 ? `${files.length} images` : `${files.length} image`;
    message.success(`Success to load ${msg}.`);
  };

  const onFilesTxtChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = [...event.target.files].filter(
      file =>
        ANNOTATION_TYPES.indexOf(getURLExtension(file.name).toLowerCase()) !==
        -1
    );

    const msg =
      files.length > 1 ? `${files.length} txt` : `${files.length} txt`;
    message.success(`Success to load ${msg}.`);
  };

  const onFilesZipChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    // import zip file
    const filess = event.target.files[0];
    //const msg = files.length > 1 ? `${files.length} zip` : `${files.length} zip`;
    //message.success(`Success to load ${msg}.`);
    //read zip
    var jsZip = new JSZip();
    let files: any = [];
    jsZip.loadAsync(filess).then(zip => {
      // Extract files from the ZIP file
      Object.keys(zip.files).forEach(filename => {
        files.push(zip.files);
      });
    });
    window.URL.createObjectURL(new Blob(files, { type: 'application/zip' }));
    const newImageFiles = [...imageFiles, ...files];
    const newImageSizes = newImageFiles.map((item, index) =>
      imageSizes[index] ? imageSizes[index] : imageSizeFactory({})
    );
    const newShapes = newImageFiles.map((item, index) =>
      shapes[index] ? shapes[index] : []
    );
    dispatch(
      setImageFiles({
        imageFiles: newImageFiles,
        selDrawImageIndex: imageFiles.length ? selDrawImageIndex : 0,
        imageSizes: newImageSizes,
        drawStatus,
        shapes: newShapes,
        selShapeIndex,
      })
    );
  };

  const onSaveClick = () => {
    if (imageFiles.length === 0) {
      message.info('No images are loaded.');
      return;
    }
    // const xmls = imageFiles.map((file, index) => generateXML(file, imageSizes[index], shapes[index]));
    // exportZip(imageFiles, xmls);
  };

  const onNextImageClick = () => {
    if (!imageFiles.length || imageFiles.length < 2) return;
    let index = selDrawImageIndex + 1;
    if (index >= imageFiles.length) index = 0;
    dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
    dispatch(setSelDrawImageIndex({ selDrawImageIndex: index }));
  };

  const onPrevImageClick = () => {
    if (!imageFiles.length || imageFiles.length < 2) return;
    let index = selDrawImageIndex - 1;
    if (index < 0) index = imageFiles.length - 1;
    dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
    dispatch(setSelDrawImageIndex({ selDrawImageIndex: index }));
  };

  const onFullScreen = () => {
    dispatch(setFullScreen());
  };

  const onCocoDownload = async () => {
    if (imageFiles.length === 0) {
      message.info('No images are loaded.');
      return;
    }

    const files = [];
    for (const img of imageFiles) {
      const file = await fetchFileFromObjectUrl(img.obj_url, img.name);
      files.push(file);
    }

    const xmls = files.map((file, index) =>
      generateCoco(file, imageSizes[index], shapes[index])
    );
    exportZip(files, xmls, 'COCO');
  };

  const onYoloDownload = async () => {
    if (imageFiles.length === 0) {
      message.info('No images are loaded.');
      return;
    }
    const files = [];
    for (const img of imageFiles) {
      const file = await fetchFileFromObjectUrl(img.obj_url, img.name);
      files.push(file);
    }
    const xmls = files.map((file, index) =>
      generateYolo(file, imageSizes[index], shapes[index])
    );
    exportZip(files, xmls, 'YOLO');
  };

  const items = [
    {
      key: '1',
      label: (
        <Button type="text" size="small" onClick={onCocoDownload}>
          Coco Format
        </Button>
      ),
    },
    {
      key: '2',
      label: (
        <Button type="text" size="small" onClick={onYoloDownload}>
          Yolo Format
        </Button>
      ),
    },
  ];

  return (
    <div className="top-bar-container">
      <div className="top-bar-content" style={{ rowGap: '0px' }}>
        <div className="content-left">
          <button type="button" className="menu-button">
            <span className="menu-icon">
              <svg
                viewBox="0 0 40 40"
                width="1em"
                height="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 30h30v-3.333H5V30zm0-8.333h30v-3.334H5v3.334zM5 10v3.333h30V10H5z"
                  fillRule="evenodd"
                ></path>
              </svg>
            </span>
            <span>Menu</span>
          </button>
          <label className="import-button" style={{ width: '50px' }}>
            <input
              type="file"
              accept={IMAGE_TYPES.map(type => `.${type}`).join(',')}
              multiple
              onChange={onFilesChange}
              style={{ display: 'none', zIndex: '100' }}
              value={''}
            />
            <span className="save-icon">
              <svg
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.5 2H6a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-4-4zM15 17H9a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1zm0-5H9v-2h6v2z"
                  stroke="currentColor"
                  fill="none"
                />
              </svg>
            </span>
            <span className="tag-name">Open</span>
          </label>
          {/* <label
            className="import-button"
            style={{ width: '50px' }}
          >
            <input
              type="file"
              accept={importType.map(type => `.${type}`).join(',')}
              multiple
              onChange={onFilesZipChange}
              style={{ display: 'none', zIndex: '100' }}
            />
            <span className="save-icon">
              <svg
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.5 2H6a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-4-4zM15 17H9a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1zm0-5H9v-2h6v2z"
                  stroke="currentColor"
                  fill="none"
                />
              </svg>
            </span>
            <span className="tag-name">Open txt</span>
          </label> */}
          <button type="button" className="save-button" onClick={onSaveClick}>
            <span className="save-icon">
              <svg
                viewBox="0 0 40 40"
                width="1em"
                height="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M29.131 5l5.257 5.257V35H5V5h24.131zm-.866 17.143H10.51v11.633h17.755V22.143zM10.51 6.224H6.224v27.552h3.062V20.918H29.49v12.858h3.673V10.764l-4.539-4.54h-.97v9.796H10.51V6.224zm8.878 20.205a.612.612 0 01.1 1.216l-.1.008h-6.123a.612.612 0 01-.1-1.216l.1-.008h6.123zm2.271.177c.11.116.178.276.178.435a.648.648 0 01-.178.435.644.644 0 01-.435.177.63.63 0 01-.434-.177.64.64 0 01-.178-.435.64.64 0 01.178-.435.641.641 0 01.87 0zm-4.108-2.626a.612.612 0 01.1 1.216l-.1.008h-4.286a.612.612 0 01-.1-1.216l.1-.008h4.286zm8.878-17.756H11.735v8.572h14.694V6.224zM25.51 7.45v6.122h-3.673V7.45h3.673zm-1.224 1.224H23.06v3.674h1.225V8.673z"></path>
              </svg>
            </span>
            <span className="tag-name">
              <Dropdown menu={{ items }} placement="bottomRight" arrow>
                <div>Save</div>
              </Dropdown>
            </span>
          </button>
          <button type="button" className="save-button">
            <span className="save-icon">
              <svg
                viewBox="0 0 40 40"
                width="1em"
                height="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <path id="b" d="M0 0h34v24H0z"></path>
                </defs>
                <g transform="translate(3 8)" fill="none" fillRule="evenodd">
                  <mask id="undoB" fill="#fff">
                    <use xlinkHref="#b"></use>
                  </mask>
                  <path
                    d="M28.62 9.331C20.935.18 8.932-.428 1.308 7.643V2.968H0v6.537c0 .45.293.817.654.817h5.232V8.688H2.35c7.125-7.322 18.2-6.683 24.987 1.8 7.14 8.92 7.14 23.437 0 32.357L28.262 44c7.65-9.557 7.65-25.111 0-34.669z"
                    fill="#000"
                    mask="url(#undoB)"
                  ></path>
                </g>
              </svg>
            </span>
            <span className="tag-name">Undo</span>
          </button>
          <button type="button" className="save-button">
            <span className="save-icon">
              <svg
                viewBox="0 0 40 40"
                width="1em"
                height="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <path id="redoA" d="M0 0h34v24H0z" />
                </defs>
                <g transform="translate(3 8)" fill="none" fillRule="evenodd">
                  <mask id="redoB" fill="#fff">
                    <use xlinkHref="#redoA" />
                  </mask>
                  <path
                    d="M28.262 9.331C20.935.18 8.932-.428 1.308 7.643V2.968H0v6.537c0 .45.293.817.654.817h5.232V8.688H2.35c7.125-7.322 18.2-6.683 24.987 1.8 7.14 8.92 7.14 23.437 0 32.357L28.262 44c7.65-9.557 7.65-25.111 0-34.669z"
                    fill="#000"
                    mask="url(#redoB)"
                    transform="matrix(-1 0 0 1 34 0)"
                  />
                </g>
              </svg>
            </span>
            <span className="tag-name">Redo</span>
          </button>
        </div>
        <div className="content-center">
          <button
            type="button"
            className="center-button"
            onClick={onPrevImageClick}
          >
            {/* <span className="prev-image">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                fill="currentColor"
                height="1em"
                width="1em"
                viewBox="64 64 896 896"
              >
                <path d="M239.825 534.975l409.8 400.525c19.75 19.325 51.825 19.325 71.575 0l47.8-46.7c19.75-19.3 19.75-50.55.075-69.875L444.325 500l324.75-318.925A48.675 48.675 0 00769 111.2l-47.8-46.7a51.45 51.45 0 00-71.575 0L239.825 465a48.675 48.675 0 000 69.95z"></path>
              </svg>
            </span>
            <span>Prev img</span> */}
            Prev
          </button>
          <button
            type="button"
            className="center-button"
            onClick={onNextImageClick}
          >
            {/* <span className="prev-image">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                fill="currentColor"
                height="1em"
                width="1em"
                viewBox="64 64 896 896"
              >
                <path d="M769 534.975L359.2 935.5a51.45 51.45 0 01-71.575 0l-47.8-46.7a48.675 48.675 0 01-.075-69.875L564.5 500 239.75 181.075a48.675 48.675 0 01.075-69.875l47.8-46.7a51.45 51.45 0 0171.575 0L769 465c19.75 19.325 19.75 50.625 0 69.95z"></path>
              </svg>
            </span>
            <span>Next img</span> */}
            Next
          </button>
        </div>

        <div className="content-right">
          <button type="button" className="right-button" onClick={onFullScreen}>
            <span className="icon">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 19 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.48 1a.726.726 0 00-.72.828v4.265a.727.727 0 101.453 0V3.488L6.694 6.97a.726.726 0 101.027-1.028L4.24 2.46h2.605a.726.726 0 100-1.453H2.572A.728.728 0 002.479 1zM17 1a.727.727 0 00-.081.007h-4.264a.726.726 0 100 1.453h2.605L11.78 5.942a.726.726 0 101.027 1.028l3.481-3.482v2.605a.726.726 0 101.453 0V1.826A.726.726 0 0017 1zm-9.806 9.808a.726.726 0 00-.5.22L3.213 14.51v-2.605a.726.726 0 10-1.453 0v4.248a.727.727 0 00.837.837h4.248a.726.726 0 100-1.453H4.24l3.481-3.482a.727.727 0 00-.527-1.247zm5.091 0a.726.726 0 00-.506 1.247l3.481 3.482h-2.605a.727.727 0 100 1.453h4.248a.725.725 0 00.837-.837v-4.248a.726.726 0 10-1.453 0v2.605l-3.481-3.482a.726.726 0 00-.52-.22z"
                  fill="#000"
                ></path>
              </svg>
            </span>
            <span className="tag-name">Full Screen</span>
          </button>
          <button type="button" className="right-button">
            <span className="icon">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.182 0A2.193 2.193 0 000 2.182v11.636C0 15.015.985 16 2.182 16h9.09a.727.727 0 00.515-.213l4-4a.727.727 0 00.213-.514V2.182A2.193 2.193 0 0013.818 0H2.182zm0 1.455h11.636c.411 0 .728.316.728.727v8.727h-2.182c-.804 0-1.455.651-1.455 1.455v2.181H2.182a.716.716 0 01-.727-.727V2.182c0-.411.316-.727.727-.727zM4.364 5.09a.727.727 0 100 1.454h2.909a.727.727 0 100-1.454h-2.91zm5.818 0a.727.727 0 100 1.454h1.454a.727.727 0 100-1.454h-1.454zM4.364 8a.727.727 0 100 1.455h5.818a.727.727 0 100-1.455H4.364z"
                  fill="#000"
                ></path>
              </svg>
            </span>
            <span className="tag-name">Guide</span>
          </button>
          <button type="button" className="right-button">
            <span className="icon">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 19 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_1474_17299)" fill="#000">
                  <path d="M7.604 4.001a.76.76 0 00-.463.228l-.612.62a.76.76 0 101.082 1.07l.106-.11a.911.911 0 01.648-.27h2.007a1 1 0 01.711.297l.107.108a1 1 0 01.289.703v.875a1 1 0 01-.547.891L8.852 9.47a.768.768 0 00-.416.685v.778c0 .42.34.76.76.76h.106a.655.655 0 00.656-.655c0-.247.138-.472.358-.584L12.584 9.3A.767.767 0 0013 8.616V5.924a.775.775 0 00-.226-.54l-1.14-1.155a.758.758 0 00-.536-.228H7.676a.562.562 0 00-.072 0zm1.593 8.46a.76.76 0 00-.76.761v.017a.76.76 0 101.521 0v-.017a.76.76 0 00-.761-.76z"></path>
                  <path d="M9.25 0c-4.962 0-9 4.038-9 9s4.038 9 9 9 9-4.038 9-9-4.038-9-9-9zm0 1.5c4.151 0 7.5 3.349 7.5 7.5s-3.349 7.5-7.5 7.5A7.489 7.489 0 011.75 9c0-4.151 3.349-7.5 7.5-7.5z"></path>
                </g>
                <defs>
                  <clipPath id="clip0_1474_17299">
                    <path
                      fill="#fff"
                      transform="translate(.25)"
                      d="M0 0h18v18H0z"
                    ></path>
                  </clipPath>
                </defs>
              </svg>
            </span>
            <span className="tag-name">Info</span>
          </button>
          <button type="button" className="right-button">
            <span className="icon">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 1c-4.962 0-9 4.038-9 9s4.038 9 9 9 9-4.038 9-9-4.038-9-9-9zm0 1.5c4.151 0 7.5 3.349 7.5 7.5s-3.349 7.5-7.5 7.5A7.489 7.489 0 012.5 10c0-4.151 3.349-7.5 7.5-7.5z"
                  fill="#000"
                ></path>
                <path
                  d="M5.5 7a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zM7 10a.75.75 0 000 1.5h6a.75.75 0 000-1.5H7zm1.5 3a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
                  fill="#000"
                ></path>
              </svg>
            </span>
            <span className="tag-name">Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
