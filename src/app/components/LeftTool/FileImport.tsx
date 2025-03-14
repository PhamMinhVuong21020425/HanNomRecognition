import '@/app/scss/FileImport.scss';
import { ChangeEvent } from 'react';
import { shallowEqual } from 'react-redux';
import { message } from 'antd';
import { IMAGE_TYPES } from '@/constants';
import {
  getURLExtension,
  imageSizeFactory,
  generateXML,
  exportZip,
  fetchFileFromObjectUrl,
} from '@/utils/general';
import {
  selectDrawStatus,
  selectImagesInfo,
  selectSelShapeIndex,
  selectShapes,
  setImageFiles,
  setSelDrawImageIndex,
  setSelShapeIndex,
  setUrlBoxStatus,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

function FileImport() {
  const dispatch = useAppDispatch();
  const { imageFiles, selDrawImageIndex, imageSizes } = useAppSelector(
    selectImagesInfo,
    shallowEqual
  );
  const shapes = useAppSelector(selectShapes);
  const selShapeIndex = useAppSelector(selectSelShapeIndex);
  const drawStatus = useAppSelector(selectDrawStatus);

  const onFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = [...event.target.files].map(
      file =>
        new File([file], `${new Date().getTime()}$$${file.name}`, {
          type: file.type,
        })
    );

    if (files.length === 0) return;
    const newFiles = files.map(file => {
      const obj_url = URL.createObjectURL(file);
      return { obj_url, name: file.name };
    });

    const newImageFiles = [...imageFiles, ...newFiles];
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

  const onSaveClick = async () => {
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
      generateXML(file, imageSizes[index], shapes[index])
    );
    exportZip(files, xmls, 'YOLO');
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
      <li>
        <span onClick={onUrlClick}>Open URL</span>
      </li>
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
