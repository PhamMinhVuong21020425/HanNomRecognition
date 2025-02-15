import '@/app/scss/FileImport.scss';
import { message } from 'antd';
import { IMAGE_TYPES } from '@/constants';
import {
  getURLExtension,
  imageSizeFactory,
  generateXML,
  exportZip,
} from '@/utils/general';
import {
  setImageFiles,
  setSelDrawImageIndex,
  setSelShapeIndex,
  setUrlBoxStatus,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

function FileImport() {
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

  const onFilesChange = (event: { target: { files: any } }) => {
    // only allow image file
    const files = [...event.target.files].filter(
      file =>
        IMAGE_TYPES.indexOf(getURLExtension(file.name).toLowerCase()) !== -1
    );
    if (files.length === 0) return;
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
    const msg =
      files.length > 1 ? `${files.length} images` : `${files.length} image`;
    message.success(`Success to load ${msg}.`);
  };

  const onUrlClick = async () => {
    dispatch(setUrlBoxStatus({ urlBoxVisible: true }));
  };

  const onNextImageClick = () => {
    if (!imageFiles.length || imageFiles.length < 2) return;
    let index = selDrawImageIndex + 1;
    if (index >= imageFiles.length) index = 0;
    dispatch(setSelShapeIndex({ selShapeIndex: 0 }));
    dispatch(setSelDrawImageIndex({ selDrawImageIndex: index }));
  };

  const onPrevImageClick = () => {
    if (!imageFiles.length || imageFiles.length < 2) return;
    let index = selDrawImageIndex - 1;
    if (index < 0) index = imageFiles.length - 1;
    dispatch(setSelShapeIndex({ selShapeIndex: 0 }));
    dispatch(setSelDrawImageIndex({ selDrawImageIndex: index }));
  };

  const onSaveClick = () => {
    if (imageFiles.length === 0) {
      message.info('No images are loaded.');
      return;
    }
    const xmls = imageFiles.map((file, index) =>
      generateXML(file, imageSizes[index], shapes[index])
    );
    exportZip(imageFiles, xmls, 'YOLO');
  };

  return (
    <ul className="file-tool-container">
      <li>
        <label>
          <span>Open</span>
          <input
            type="file"
            accept={IMAGE_TYPES.map(type => `.${type}`).join(',')}
            multiple
            onChange={onFilesChange}
            style={{ display: 'none' }}
          />
        </label>
      </li>
      <li>
        <label>
          <span>Open Dir</span>
          <input
            type="file"
            accept={IMAGE_TYPES.map(type => `.${type}`).join(',')}
            multiple
            onChange={onFilesChange}
            style={{ display: 'none' }}
          />
        </label>
      </li>
      {/* <li>
        <span onClick={onUrlClick}>Open URL</span>
      </li> */}
      <li>
        <span onClick={onNextImageClick}>Next Image</span>
      </li>
      <li>
        <span onClick={onPrevImageClick}>Prev Image</span>
      </li>
      <li>
        <span onClick={onSaveClick}>Save</span>
      </li>
    </ul>
  );
}

export default FileImport;
