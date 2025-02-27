import '../scss/SVGWrapper.scss';
import { useEffect, useRef, useMemo, useState, MouseEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
import { Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
} from '@fortawesome/free-solid-svg-icons';

import Loading from './Loading';
import {
  getImageSizeFromUrl,
  coordinateFactory,
  getSVGPathD,
  drawStyleFactory,
  shapeFactory,
  imageSizeFactory,
  shapeFactoryTest,
} from '@/utils/general';

import {
  DRAW_STATUS_TYPES,
  LABEL_STATUS_TYPES,
  SHAPE_TYPES,
} from '@/constants';

import {
  selectDetections,
  setCurrentShape,
  setDrawStatus,
  setImageSizes,
  setLabelBoxStatus,
  setSelShapeIndex,
  setShapes,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

import type {
  Coordinate,
  DrawStyle,
} from '@/lib/redux/slices/annotationSlice/types';

let pointsX: number[] = [];
let pointsY: number[] = [];

function SVGWrapper() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [mouseCoordinate, setMouseCoordinate] = useState<Coordinate>({
    x: 0,
    y: 0,
  });
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.annotation);
  const {
    imageFiles,
    selDrawImageIndex,
    imageSizes,
    currentShape,
    drawStyle,
    drawStatus,
    selShapeType,
    selShapeIndex,
    shapes,
    selLabelType,
    closePointRegion,
    dragStatus,
  } = state;

  const {
    shapeStyle,
    selShapeStyle,
    drawingShapePathStyle,
    drawingShapePointStyle,
    labelStyle,
  } = drawStyle;

  const listDetections = useAppSelector(selectDetections);

  // dragging
  const [isDraw, setIsDraw] = useState(false);
  const [isDragging, setDragging] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });

  // zoom images
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setScale(scale => scale + 0.1);
  };

  const handleZoomOut = () => {
    setScale(scale => scale - 0.1);
  };

  useEffect(() => {
    if (selDrawImageIndex === -1 || imageFiles.length === 0) return;
    const objURL = imageFiles[selDrawImageIndex].obj_url;
    try {
      setLoading(true);
      getImageSizeFromUrl(objURL).then(size => {
        const { width, height } = size;
        listDetections.filter((obj, index) => {
          if (
            obj.image_name.split('.')[0] ===
            imageFiles[selDrawImageIndex].name.split('.')[0]
          ) {
            handleClickPath(imageFiles[selDrawImageIndex].name);
          }
        });
        setLoading(false);
        dispatch(
          setImageSizes({
            imageSizes: imageSizes.map((item, index) =>
              index === selDrawImageIndex
                ? imageSizeFactory({ width, height })
                : item
            ),
            drawStyle: drawStyleFactory(
              width > height ? width : height
            ) as DrawStyle,
          })
        );
      });
    } catch (error) {
      console.error(error);
    }
  }, [imageFiles, selDrawImageIndex]);

  const isValidCoordinate = ({ x, y }: Coordinate) =>
    x >= 0 &&
    x <= imageSizes[selDrawImageIndex].width &&
    y >= 0 &&
    y <= imageSizes[selDrawImageIndex].height;

  useEffect(() => {
    if (imageFiles.length === 0 || !svgRef.current) return;
    if (isValidCoordinate({ ...mouseCoordinate })) {
      switch (selShapeType) {
        case SHAPE_TYPES.POINTER:
          svgRef.current.style.cursor = 'default';
          break;
        case SHAPE_TYPES.MOVE:
          svgRef.current.style.cursor = 'move';
          break;
        case SHAPE_TYPES.ROTATE:
          svgRef.current.style.cursor = 'cell';
          break;
        case SHAPE_TYPES.RECTANGLE:
        case SHAPE_TYPES.POLYGON:
          svgRef.current.style.cursor = 'crosshair';
          if (currentShape && currentShape.paths.length > 0) {
            // change cursor when the current point is equal to the first point
            if (
              selShapeType === SHAPE_TYPES.POLYGON &&
              Math.abs(currentShape.paths[0].x - mouseCoordinate.x) <=
                closePointRegion &&
              Math.abs(currentShape.paths[0].y - mouseCoordinate.y) <=
                closePointRegion
            ) {
              svgRef.current.style.cursor = 'pointer';
            } else {
              svgRef.current.style.cursor = 'crosshair';
            }
          }
          break;
        default:
          svgRef.current.style.cursor = 'default';
          break;
      }
    } else {
      svgRef.current.style.cursor = 'not-allowed';
    }
  }, [imageFiles, currentShape, selShapeType]);

  const imageProps = useMemo(() => {
    if (selDrawImageIndex === -1) {
      return { href: '', width: 0, height: 0 };
    }
    return {
      href: imageFiles[selDrawImageIndex].obj_url,
      width: imageSizes[selDrawImageIndex].width,
      height: imageSizes[selDrawImageIndex].height,
    };
  }, [imageFiles, selDrawImageIndex, imageSizes]);

  const getMouseCoordinate = (
    event: MouseEvent<SVGSVGElement, globalThis.MouseEvent>
  ) => {
    if (!event) return coordinateFactory({ x: 0, y: 0 });

    const CTM = svgRef.current!.getScreenCTM();
    if (!CTM) return coordinateFactory({ x: 0, y: 0 });
    return coordinateFactory({
      x: parseInt(((event.clientX - CTM.e) / CTM.a).toString(), 10),
      y: parseInt(((event.clientY - CTM.f) / CTM.d).toString(), 10),
    });
  };

  // reset draw status
  const resetDrawStatus = () => {
    dispatch(setDrawStatus({ drawStatus: DRAW_STATUS_TYPES.IDLE }));
    svgRef.current!.style.cursor = 'crosshair';
  };

  const movingRectangle = (coordinate: Coordinate) => {
    const currentShapeCopy = cloneDeep(currentShape);
    if (!currentShapeCopy) return;
    const point1 = currentShapeCopy.paths[0];
    const point3 = coordinate;
    const point2 = { x: point1.x, y: point3.y };
    const point4 = { x: point3.x, y: point1.y };

    currentShapeCopy.paths = [point1, point2, point3, point4, point1];
    currentShapeCopy.exactPathCount = currentShapeCopy.paths.length - 1;
    currentShapeCopy.d = getSVGPathD(currentShapeCopy.paths, false);
    dispatch(setCurrentShape({ currentShape: currentShapeCopy }));
  };

  const movingPolygon = (coordinate: Coordinate) => {
    const currentShapeCopy = cloneDeep(currentShape);
    if (!currentShapeCopy) return;
    if (currentShapeCopy.exactPathCount === currentShapeCopy.paths.length) {
      currentShapeCopy.paths.push(coordinate);
    } else {
      currentShapeCopy.paths[currentShapeCopy.paths.length - 1] = coordinate;
    }
    currentShapeCopy.d = getSVGPathD(currentShapeCopy.paths, false);
    dispatch(setCurrentShape({ currentShape: currentShapeCopy }));
  };

  const drawRectanglePoint = () => {
    // finish drawing
    if (!currentShape || currentShape.exactPathCount === 1) return;
    dispatch(
      setLabelBoxStatus({
        selLabelType,
        labelBoxVisible: true,
        labelBoxStatus: LABEL_STATUS_TYPES.CREATE,
      })
    );
    resetDrawStatus();
  };

  const drawPolygonPoint = () => {
    if (!currentShape) return;
    if (
      currentShape.paths.length > 0 &&
      Math.abs(currentShape.paths[0].x - mouseCoordinate.x) <=
        closePointRegion &&
      Math.abs(currentShape.paths[0].y - mouseCoordinate.y) <= closePointRegion
    ) {
      // finish drawing
      if (currentShape.exactPathCount === 1) return;
      dispatch(
        setLabelBoxStatus({
          selLabelType,
          labelBoxVisible: true,
          labelBoxStatus: LABEL_STATUS_TYPES.CREATE,
        })
      );
      resetDrawStatus();
    } else {
      // keep drawing
      pointsX = [];
      pointsY = [];
      for (var i = 0; i < currentShape.paths.length; i++) {
        pointsX.push(currentShape.paths[i].x);
        pointsY.push(currentShape.paths[i].y);
      }

      if (currentShape.exactPathCount === currentShape.paths.length) return;
      const currentShapeCopy = cloneDeep(currentShape);
      currentShapeCopy.paths[currentShapeCopy.paths.length - 1] = {
        ...mouseCoordinate,
      };
      currentShapeCopy.exactPathCount += 1;
      currentShapeCopy.d = getSVGPathD(currentShapeCopy.paths, false);

      dispatch(setCurrentShape({ currentShape: currentShapeCopy }));
    }
  };

  const isLeftMouseClick = (
    event: MouseEvent<SVGSVGElement | SVGPathElement, globalThis.MouseEvent>
  ) => event.button === 0;

  const onSVGMouseDown = (
    event: MouseEvent<SVGSVGElement, globalThis.MouseEvent>
  ) => {
    if (!svgRef.current) return;
    if (dragStatus === 'DRAG_IMAGE') {
      if (selShapeType === SHAPE_TYPES.MOVE) {
        const CTM = svgRef.current.getScreenCTM();
        if (!CTM) return;
        setPrevPosition({
          x: parseInt(((event.clientX - CTM.e) / CTM.a).toString(), 10),
          y: parseInt(((event.clientY - CTM.f) / CTM.d).toString(), 10),
        });
      }
      setDragging(true);
      setIsDraw(false);
    } else if (
      dragStatus === 'NOT_DRAG_IMAGE' &&
      (selShapeType === SHAPE_TYPES.RECTANGLE ||
        selShapeType === SHAPE_TYPES.POLYGON)
    ) {
      setDragging(false);
      setIsDraw(true);
    } else {
      setDragging(false);
      setIsDraw(false);
    }
  };

  const onSVGMouseMove = (
    event: MouseEvent<SVGSVGElement, globalThis.MouseEvent>
  ) => {
    if (!svgRef.current) return;
    if (!isDraw && isDragging) {
      const CTM = svgRef.current.getScreenCTM();
      if (!CTM) return;
      const deltaX =
        parseInt(((event.clientX - CTM.e) / CTM.a).toString(), 10) -
        prevPosition.x;
      const deltaY =
        parseInt(((event.clientY - CTM.f) / CTM.d).toString(), 10) -
        prevPosition.y;
      setPrevPosition({
        x: parseInt(((event.clientX - CTM.e) / CTM.a).toString(), 10),
        y: parseInt(((event.clientY - CTM.f) / CTM.d).toString(), 10),
      });
      setPosition(position => ({
        x: position.x + deltaX,
        y: position.y + deltaY,
      }));
    }

    const coordinate = getMouseCoordinate(event);
    setMouseCoordinate(coordinate);

    if ((drawStatus !== DRAW_STATUS_TYPES.DRAWING && !currentShape) || !isDraw)
      return;

    switch (selShapeType) {
      case SHAPE_TYPES.RECTANGLE:
        movingRectangle(coordinate);
        break;
      case SHAPE_TYPES.POLYGON:
        movingPolygon(coordinate);
        break;
      default:
        break;
    }
  };

  const onSVGMouseUp = (
    event: MouseEvent<SVGSVGElement, globalThis.MouseEvent>
  ) => {
    if (!isDraw) {
      setDragging(false);
    }

    if (!isLeftMouseClick(event)) return;

    if (!isValidCoordinate({ ...mouseCoordinate })) return;
    // check dragging
    if (drawStatus === DRAW_STATUS_TYPES.SELECT) {
      dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
      return;
    }

    if (drawStatus === DRAW_STATUS_TYPES.IDLE && isDraw) {
      // start drawing
      const newShape = shapeFactory(mouseCoordinate);

      dispatch(setCurrentShape({ currentShape: newShape }));
      dispatch(setDrawStatus({ drawStatus: DRAW_STATUS_TYPES.DRAWING }));
    } else if (drawStatus === DRAW_STATUS_TYPES.DRAWING && currentShape) {
      switch (selShapeType) {
        case SHAPE_TYPES.RECTANGLE:
          drawRectanglePoint();
          break;
        case SHAPE_TYPES.POLYGON:
          drawPolygonPoint();
          break;
        default:
          break;
      }
    }
  };

  const onShapeMouseUp = (
    event: MouseEvent<SVGPathElement, globalThis.MouseEvent>,
    index: number
  ) => {
    if (!isLeftMouseClick(event)) return;
    // can not select shape when drawing
    if (drawStatus === DRAW_STATUS_TYPES.DRAWING) return;

    event.stopPropagation();

    if (selShapeType === SHAPE_TYPES.MOVE) {
      setDragging(false);
    }

    dispatch(
      setSelShapeIndex({ selShapeIndex: index === selShapeIndex ? 0 : index })
    );
  };

  const handleClickPath = (imageName: string) => {
    // danh sách tất cả các shapes đang có, phải kiểu dữ liệu mảng
    //const listShape = [shapeFactoryTest(coordinates[0]), shapeFactoryTest(coordinates[1])];
    const result = listDetections.find(item => {
      let imageWithoutEx = item.image_name.split('.')[0];
      let imageNameNew = imageName.split('.')[0];
      return imageWithoutEx === imageNameNew;
    });

    const listBoxes = result
      ? result.objects_detection
          .filter(obj => obj.confidence > 0.2)
          .map(obj => ({
            coordinates: obj.coordinates,
            name: obj.class,
          }))
      : [];

    //console.log(list[0].coordinate);
    // let listShape = listObject
    //     .filter((obj) => obj.image_name === imageName)
    //     .map((obj) => shapeFactoryTest(obj.coordinate));
    // let listLabel = listObject.filter((obj) => obj.imageName === imageName);
    // for (var i = 0; i < listShape.length; i++) {
    //     const newShape = listShape[i];
    //     dispatch({
    //         type: actionTypes.SET_CURRENT_SHAPE,
    //         payload: { currentShape: newShape },
    //     });
    // }

    // for (var i = 0; i < listBoxes.length; i++) {
    //   const newShape = shapeFactoryTest(listBoxes[i].coordinates);
    //   dispatch(setCurrentShape({ currentShape: newShape }));
    // }

    const shapesCopy = cloneDeep(shapes);

    if (
      shapesCopy[selDrawImageIndex] &&
      shapesCopy[selDrawImageIndex].length > 0
    )
      return;

    shapesCopy[selDrawImageIndex] = [];
    for (var i = 0; i < listBoxes.length; i++) {
      let currentShapeCopy = cloneDeep(
        shapeFactoryTest(listBoxes[i].coordinates)
      );
      currentShapeCopy.paths.pop();
      currentShapeCopy.d = getSVGPathD(currentShapeCopy.paths, true);
      currentShapeCopy.label = listBoxes[i].name;
      shapesCopy[selDrawImageIndex] = [
        ...shapesCopy[selDrawImageIndex],
        currentShapeCopy,
      ];
    }

    dispatch(setShapes({ shapes: shapesCopy }));
  };

  return (
    <div className="svg-wrapper flex items-start justify-end">
      {loading && (
        <div className="loading-animation">
          <Loading />
        </div>
      )}
      {imageFiles[selDrawImageIndex] && (
        <svg
          className="svg-container"
          ref={svgRef}
          viewBox={`0 0 ${imageSizes[selDrawImageIndex].width} ${imageSizes[selDrawImageIndex].height}`}
          onMouseMove={onSVGMouseMove}
          onMouseUp={onSVGMouseUp}
          onMouseDown={onSVGMouseDown}
          style={{ cursor: 'cell' }}
          transform={`scale(${scale}) translate(${position.x} ${position.y})`}
        >
          <image
            href={imageProps.href}
            width={imageProps.width}
            height={imageProps.height}
            preserveAspectRatio="xMidYMid slice"
          />

          {currentShape && (
            <g>
              <path
                d={currentShape.d}
                style={{ ...drawingShapePathStyle } as React.CSSProperties}
              />
              {currentShape.paths.map(point => (
                <circle
                  key={uuidv4()}
                  cx={point.x}
                  cy={point.y}
                  style={{ ...drawingShapePointStyle }}
                  r={drawingShapePointStyle.strokeWidth}
                />
              ))}
            </g>
          )}

          {shapes[selDrawImageIndex] &&
            Array.isArray(shapes[selDrawImageIndex]) &&
            shapes[selDrawImageIndex].map((shape, index) =>
              !shape.visible ? null : (
                <Tooltip
                  key={shape.d}
                  title={shape.label}
                  placement="top" // Position: top, bottom, left, right
                  mouseEnterDelay={0} // Delay before showing tooltip
                  mouseLeaveDelay={0} // Delay before hiding tooltip
                  trigger="hover" // Can be hover, click, etc
                  arrow={true} // Show/hide arrow
                  color="#fff"
                  styles={{
                    body: {
                      color: '#333',
                      fontSize: '14px',
                      padding: '8px 12px',
                    },
                  }}
                >
                  <g>
                    <path
                      d={shape.d}
                      style={
                        shape.isSelect
                          ? { ...selShapeStyle }
                          : { ...shapeStyle }
                      }
                      onMouseUp={event => onShapeMouseUp(event, index)}
                    />
                  </g>
                </Tooltip>
              )
            )}
        </svg>
      )}
      <div
        style={{
          display: 'flex',
          right: '0',
          flexDirection: 'column',
          width: '40px',
          marginRight: '3px',
        }}
      >
        <button
          onClick={handleZoomIn}
          style={{
            position: 'relative',
            zIndex: '100',
            fontSize: '20px',
            border: ' 1px solid grey',
            marginBottom: '5px',
            borderRadius: '20%',
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            position: 'relative',
            zIndex: '100',
            fontSize: '20px',
            border: ' 1px solid grey',
            borderRadius: '20%',
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
        </button>
      </div>
    </div>
  );
}

export default SVGWrapper;
export { pointsX, pointsY };
