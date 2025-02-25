import '../scss/SVGWrapper.scss';
import { useEffect, useRef, useMemo, useState, MouseEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
import { Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
  faRotateLeft,
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

// Define zoom step and limits
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_ANIMATION_DURATION = 150; // ms

function SVGWrapper() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgContainerRef = useRef<HTMLDivElement | null>(null);
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

  // Dragging state
  const [isDraw, setIsDraw] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });

  // Zoom state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get center point of current view
  const getViewCenter = () => {
    if (!svgRef.current || !svgContainerRef.current) return { x: 0, y: 0 };

    const containerRect = svgContainerRef.current.getBoundingClientRect();
    const svgRect = svgRef.current.getBoundingClientRect();

    return {
      x: (containerRect.width / 2 - position.x) / scale,
      y: (containerRect.height / 2 - position.y) / scale,
    };
  };

  // Zoom around the center point
  const zoomAround = (newScale: number) => {
    if (isTransitioning) return;

    const center = getViewCenter();
    const oldScale = scale;

    // Calculate new position to keep the center point fixed
    const newPosition = {
      x: position.x - center.x * (newScale - oldScale),
      y: position.y - center.y * (newScale - oldScale),
    };

    setIsTransitioning(true);
    setScale(newScale);
    setPosition(newPosition);

    setTimeout(() => {
      setIsTransitioning(false);
    }, ZOOM_ANIMATION_DURATION);
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale + ZOOM_STEP, MAX_ZOOM);
    zoomAround(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - ZOOM_STEP, MIN_ZOOM);
    zoomAround(newScale);
  };

  const handleReset = () => {
    setIsTransitioning(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });

    setTimeout(() => {
      setIsTransitioning(false);
    }, ZOOM_ANIMATION_DURATION);
  };

  // Handle wheel zoom
  // const handleWheel = (event: React.WheelEvent) => {
  //   event.preventDefault();
  //   // Determine zoom direction
  //   const delta = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
  //   const newScale = Math.max(MIN_ZOOM, Math.min(scale + delta, MAX_ZOOM));
  //   if (newScale !== scale) {
  //     zoomAround(newScale);
  //   }
  // };

  // Handle wheel zoom and pan
  const handleWheel = (event: React.WheelEvent) => {
    // Stop propagation to prevent parent elements from scrolling
    event.stopPropagation();

    // Prevent default browser scrolling behavior
    event.preventDefault();

    // Check if it's a pinch-to-zoom gesture (ctrl key is pressed or with multiple touch points)
    if (event.ctrlKey || event.metaKey) {
      // This is a zoom gesture
      // Determine zoom direction - negative deltaY means zoom in, positive means zoom out
      const delta = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      const newScale = Math.max(MIN_ZOOM, Math.min(scale + delta, MAX_ZOOM));

      if (newScale !== scale) {
        zoomAround(newScale);
      }
    } else {
      // This is a pan/scroll gesture
      // Calculate how much to move the image
      // Use deltaX for horizontal movement and deltaY for vertical movement
      // Adjust sensitivity as needed with the multiplier (0.5 makes it less sensitive)
      const deltaX = event.deltaX * 0.5;
      const deltaY = event.deltaY * 0.5;

      // Update position state to move the image
      setPosition({
        x: position.x - deltaX / scale,
        y: position.y - deltaY / scale,
      });
    }
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
    if (svgRef.current) {
      svgRef.current.style.cursor = 'crosshair';
    }
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
      setIsDragging(true);
      setIsDraw(false);
    } else if (
      dragStatus === 'NOT_DRAG_IMAGE' &&
      (selShapeType === SHAPE_TYPES.RECTANGLE ||
        selShapeType === SHAPE_TYPES.POLYGON)
    ) {
      setIsDragging(false);
      setIsDraw(true);
    } else {
      setIsDragging(false);
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
        x: position.x + deltaX * 1.2,
        y: position.y + deltaY * 1.2,
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
      setIsDragging(false);
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
      setIsDragging(false);
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

  // Format zoom percentage for display
  const zoomPercentage = Math.round(scale * 100);

  return (
    <div className="svg-wrapper flex flex-col items-start justify-end relative">
      {loading && (
        <div className="loading-animation">
          <Loading />
        </div>
      )}

      <div
        ref={svgContainerRef}
        className="svg-view-container relative w-full h-full overflow-hidden"
        onWheel={handleWheel}
      >
        {imageFiles[selDrawImageIndex] && (
          <svg
            className="svg-container transition-transform"
            ref={svgRef}
            viewBox={`0 0 ${imageSizes[selDrawImageIndex].width} ${imageSizes[selDrawImageIndex].height}`}
            onMouseMove={onSVGMouseMove}
            onMouseUp={onSVGMouseUp}
            onMouseDown={onSVGMouseDown}
            style={{
              cursor: 'cell',
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: '0 0',
              transition: isTransitioning
                ? `transform ${ZOOM_ANIMATION_DURATION}ms ease-out`
                : 'none',
            }}
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
                    placement="top"
                    mouseEnterDelay={0}
                    mouseLeaveDelay={0}
                    trigger="hover"
                    arrow={true}
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
      </div>

      {/* Zoom controls with percentage and reset button */}
      <div className="zoom-controls absolute right-3 top-3 flex flex-col items-center bg-white bg-opacity-80 p-2 rounded-md shadow-md">
        <div className="zoom-percentage text-sm font-medium mb-2">
          {zoomPercentage}%
        </div>

        <div className="zoom-buttons flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="zoom-button bg-gray-100 hover:bg-gray-200 p-2 rounded-md"
            title="Zoom In"
            disabled={scale >= MAX_ZOOM}
          >
            <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
          </button>

          <button
            onClick={handleReset}
            className="zoom-button bg-gray-100 hover:bg-gray-200 p-2 rounded-md"
            title="Reset Zoom"
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>

          <button
            onClick={handleZoomOut}
            className="zoom-button bg-gray-100 hover:bg-gray-200 p-2 rounded-md"
            title="Zoom Out"
            disabled={scale <= MIN_ZOOM}
          >
            <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
          </button>
        </div>
      </div>

      {/* Status indicators */}
      {isDragging || isDraw ? (
        <div className="absolute left-3 bottom-3 flex items-center gap-2 bg-white bg-opacity-80 px-3 py-1 rounded-md text-sm">
          {isDragging && <span className="text-blue-600">Moving</span>}
          {isDraw && <span className="text-green-600">Drawing</span>}
        </div>
      ) : null}
    </div>
  );
}

export default SVGWrapper;
export { pointsX, pointsY };
