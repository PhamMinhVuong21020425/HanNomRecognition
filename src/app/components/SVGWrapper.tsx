import '../scss/SVGWrapper.scss';
import { useEffect, useRef, useMemo, useState, MouseEvent } from 'react';
import { shallowEqual } from 'react-redux';
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
  getSVGPathD,
  drawStyleFactory,
  shapeFactory,
  imageSizeFactory,
  shapeFactoryTest,
} from '@/utils/general';

import {
  CLOSE_POINT_REGION,
  DRAW_STATUS_TYPES,
  LABEL_STATUS_TYPES,
  SHAPE_TYPES,
} from '@/constants';

import {
  selectCurrentShape,
  selectDetections,
  selectDragStatus,
  selectDrawingState,
  selectImagesInfo,
  selectIsRotate,
  selectSelLabelType,
  selectSelShapeIndex,
  selectShapes,
  setCurrentShape,
  setDrawStatus,
  setImageSizes,
  setLabelBoxStatus,
  setSelShapeIndex,
  setShapes,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';

import type { Coordinate, DrawStyle, Shape } from '@/lib/redux';

let pointsX: number[] = [];
let pointsY: number[] = [];

// Define zoom step and limits
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 9.0;
const ZOOM_ANIMATION_DURATION = 150; // ms

function SVGWrapper() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawingShape, setDrawingShape] = useState<Shape | null>(null);
  const [mouseCoordinate, setMouseCoordinate] = useState<Coordinate>({
    x: 0,
    y: 0,
  });
  const dispatch = useAppDispatch();
  const { imageFiles, selDrawImageIndex, imageSizes } = useAppSelector(
    selectImagesInfo,
    shallowEqual
  );
  const { drawStyle, drawStatus, selShapeType } = useAppSelector(
    selectDrawingState,
    shallowEqual
  );
  const shapes = useAppSelector(selectShapes);
  const currentShape = useAppSelector(selectCurrentShape);
  const selShapeIndex = useAppSelector(selectSelShapeIndex);
  const selLabelType = useAppSelector(selectSelLabelType);
  const dragStatus = useAppSelector(selectDragStatus);
  const closePointRegion = CLOSE_POINT_REGION;

  const {
    shapeStyle,
    selShapeStyle,
    drawingShapePathStyle,
    drawingShapePointStyle,
  } = drawStyle;

  const listDetections = useAppSelector(selectDetections);

  // Dragging state
  const [isDraw, setIsDraw] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });

  // Rotation state
  const isRotate = useAppSelector(selectIsRotate);
  const [rotation, setRotation] = useState(0);

  // Zoom state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Hovered shape index
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(-1);
  };

  // Track if wheel events
  const lastWheelTimestamp = useRef(0);
  const wheelEvents = useRef<
    Array<{ deltaX: number; deltaY: number; deltaMode: number }>
  >([]);

  // Setup event listeners for the container
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;

    // Prevent the default browser behavior for these events
    const preventDefaultHandler = (event: WheelEvent) => {
      event.preventDefault();
    };

    // Add passive: false to ensure preventDefault works
    container.addEventListener('wheel', preventDefaultHandler, {
      passive: false,
    });

    // Clean up event listeners on unmount
    return () => {
      container.removeEventListener('wheel', preventDefaultHandler);
    };
  }, []);

  const handleRotate = (degrees = 90) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setRotation(prev => prev + degrees);

    setTimeout(() => {
      setIsTransitioning(false);
    }, ZOOM_ANIMATION_DURATION);
  };

  const handleReset = () => {
    setIsTransitioning(true);

    const newScale = 1;
    setScale(newScale);

    // Calculate the new position to center the image
    if (svgContainerRef.current && imageSizes[selDrawImageIndex]) {
      const containerRect = svgContainerRef.current.getBoundingClientRect();
      const { width: imageWidth, height: imageHeight } =
        imageSizes[selDrawImageIndex];

      // Calculate the new position to center the image
      const centerX = (containerRect.width - imageWidth * newScale) / 2;
      const centerY = (containerRect.height - imageHeight * newScale) / 2;

      setPosition({ x: centerX, y: centerY });
    } else {
      setPosition({ x: 0, y: 0 });
    }

    setRotation(0);

    setTimeout(() => {
      setIsTransitioning(false);
    }, ZOOM_ANIMATION_DURATION);
  };

  // Get center point of container
  const getViewCenter = () => {
    if (!svgRef.current || !svgContainerRef.current) return { x: 0, y: 0 };

    const containerRect = svgContainerRef.current.getBoundingClientRect();

    return {
      x: containerRect.width / 2,
      y: containerRect.height / 2,
    };
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale + ZOOM_STEP, MAX_ZOOM);
    zoomAround(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - ZOOM_STEP, MIN_ZOOM);
    zoomAround(newScale);
  };

  // Zoom around the center point
  const zoomAround = (newScale: number, mouseX?: number, mouseY?: number) => {
    if (isTransitioning) return;

    const oldScale = scale;
    let newPosition = { ...position };

    if (svgContainerRef.current && imageSizes[selDrawImageIndex]) {
      const containerRect = svgContainerRef.current.getBoundingClientRect();
      const { width: imageWidth, height: imageHeight } =
        imageSizes[selDrawImageIndex];

      // Determine the focus point for zooming (mouse position or center)
      const focusX =
        mouseX !== undefined ? mouseX - containerRect.left : getViewCenter().x;
      const focusY =
        mouseY !== undefined ? mouseY - containerRect.top : getViewCenter().y;

      // Calculate the position of the point before scaling
      const pointBeforeX = (focusX - position.x) / oldScale;
      const pointBeforeY = (focusY - position.y) / oldScale;

      // Calculate the new position of the point after scaling
      const pointAfterX = pointBeforeX * newScale;
      const pointAfterY = pointBeforeY * newScale;

      // Calculate new position to keep focus point fixed
      newPosition = {
        x: focusX - pointAfterX,
        y: focusY - pointAfterY,
      };

      // Center the image if it's smaller than the container
      const scaledWidth = imageWidth * newScale;
      const scaledHeight = imageHeight * newScale;

      if (scaledWidth < containerRect.width) {
        newPosition.x = (containerRect.width - scaledWidth) / 2;
      }

      if (scaledHeight < containerRect.height) {
        newPosition.y = (containerRect.height - scaledHeight) / 2;
      }
    }

    setScale(newScale);
    setPosition(newPosition);
  };

  // Center the image in the container
  const centerImage = () => {
    if (!svgContainerRef.current || !imageSizes[selDrawImageIndex]) return;

    const containerRect = svgContainerRef.current.getBoundingClientRect();
    const { width: imageWidth, height: imageHeight } =
      imageSizes[selDrawImageIndex];

    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    // Only center if the image is smaller than the container
    if (
      scaledWidth < containerRect.width ||
      scaledHeight < containerRect.height
    ) {
      const centerX =
        scaledWidth < containerRect.width
          ? (containerRect.width - scaledWidth) / 2
          : position.x;

      const centerY =
        scaledHeight < containerRect.height
          ? (containerRect.height - scaledHeight) / 2
          : position.y;

      setPosition({
        x: centerX,
        y: centerY,
      });
    }
  };

  // Detect if it's a touchpad gesture by analyzing wheel events
  const detectTouchpadGesture = (event: React.WheelEvent) => {
    const now = Date.now();
    const timeDelta = now - lastWheelTimestamp.current;

    // Clear old events (older than 200ms)
    if (timeDelta > 200) {
      wheelEvents.current = [];
    }

    // Add current event
    wheelEvents.current.push({
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaMode: event.deltaMode,
    });

    // Keep only the last 5 events
    if (wheelEvents.current.length > 5) {
      wheelEvents.current.shift();
    }

    // Update timestamp
    lastWheelTimestamp.current = now;

    // Analyze events to determine if it's a touchpad gesture
    // Touchpad events typically have:
    // 1. Small delta values
    // 2. High frequency
    // 3. deltaMode of 0 (pixel-based)
    let isTouchpad = false;

    if (wheelEvents.current.length >= 3) {
      const allSmallDeltas = wheelEvents.current.every(
        e => Math.abs(e.deltaX) < 20 && Math.abs(e.deltaY) < 20
      );

      const allPixelMode = wheelEvents.current.every(e => e.deltaMode === 0);

      isTouchpad = allSmallDeltas && allPixelMode && timeDelta < 50;
    }

    // If ctrl key is pressed, it's likely a pinch zoom
    if (event.ctrlKey || event.metaKey) {
      isTouchpad = true;
    }

    return isTouchpad;
  };

  // Handle wheel event for both zoom and pan
  const handleWheel = (event: React.WheelEvent) => {
    // Immediate prevention of default and propagation
    event.stopPropagation();

    // Detect if this is a touchpad gesture
    const isTouchpad = detectTouchpadGesture(event);

    // Handle pinch-to-zoom (ctrl key or meta key pressed)
    if (event.ctrlKey || event.metaKey) {
      // This is a zoom gesture
      // Determine zoom direction - negative deltaY means zoom in, positive means zoom out
      const delta = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      const newScale = Math.max(MIN_ZOOM, Math.min(scale + delta, MAX_ZOOM));

      if (newScale !== scale) {
        zoomAround(newScale, event.clientX, event.clientY);
        if (newScale < 1) {
          setTimeout(centerImage, 10);
        }
      }
    }
    // Handle two-finger scroll/pan on touchpad
    else if (isTouchpad) {
      // Adjust sensitivity for touchpad (less movement than scroll wheel)
      const sensitivity = 1.2;
      setPosition({
        x: position.x - (event.deltaX * sensitivity) / scale,
        y: position.y - (event.deltaY * sensitivity) / scale,
      });
    }
    // Handle regular mouse wheel
    else {
      // Higher sensitivity for mouse wheel
      const sensitivity = 1.5;
      setPosition({
        x: position.x - (event.deltaX ? event.deltaX : 0) / scale,
        y: position.y - (event.deltaY * sensitivity) / scale,
      });
    }
  };

  useEffect(() => {
    centerImage();
  }, [imageSizes]);

  useEffect(() => {
    if (selDrawImageIndex === -1 || imageFiles.length === 0) return;
    const objURL = imageFiles[selDrawImageIndex]?.obj_url;
    try {
      setLoading(true);
      getImageSizeFromUrl(objURL).then(size => {
        const { width, height } = size;
        handleClickPath(imageFiles[selDrawImageIndex].name);
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
        handleReset();
        setLoading(false);
      });
    } catch (error) {
      console.error(error);
    }
  }, [selDrawImageIndex, listDetections, imageFiles]);

  useEffect(() => {
    if (imageFiles.length === 0 || !svgRef.current) return;
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
        if (drawingShape && drawingShape.paths.length > 0) {
          // change cursor when the current point is equal to the first point
          if (
            selShapeType === SHAPE_TYPES.POLYGON &&
            Math.abs(drawingShape.paths[0].x - mouseCoordinate.x) <=
              closePointRegion &&
            Math.abs(drawingShape.paths[0].y - mouseCoordinate.y) <=
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
  }, [imageFiles, drawingShape, selShapeType]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && drawingShape !== null) {
        setDrawingShape(null);
        resetDrawStatus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawingShape]);

  useEffect(() => {
    if (drawStatus === DRAW_STATUS_TYPES.IDLE) {
      setDrawingShape(null);
    }
    if (currentShape) {
      setDrawingShape(currentShape);
    }
  }, [drawStatus, currentShape]);

  useEffect(() => {
    handleRotate(90);
  }, [isRotate]);

  const imageProps = useMemo(() => {
    if (selDrawImageIndex === -1) {
      return { href: '', width: 0, height: 0 };
    }
    return {
      href: imageFiles[selDrawImageIndex]?.obj_url,
      width: imageSizes[selDrawImageIndex]?.width,
      height: imageSizes[selDrawImageIndex]?.height,
    };
  }, [imageFiles, selDrawImageIndex, imageSizes]);

  const getMouseCoordinate = (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => {
    if (!event || !svgRef.current) return { x: 0, y: 0 };

    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };

    const point = svgRef.current.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const transformedPoint = point.matrixTransform(CTM.inverse());

    const adjustedCoord = {
      x: transformedPoint.x,
      y: transformedPoint.y,
    };

    return adjustedCoord;
  };

  // reset draw status
  const resetDrawStatus = () => {
    dispatch(setDrawStatus({ drawStatus: DRAW_STATUS_TYPES.IDLE }));
    if (svgRef.current) {
      svgRef.current.style.cursor = 'crosshair';
    }
  };

  const movingRectangle = (coordinate: Coordinate) => {
    const currentShapeCopy = cloneDeep(drawingShape);
    if (!currentShapeCopy) return;
    const point1 = currentShapeCopy.paths[0];
    const point3 = coordinate;
    const point2 = { x: point1.x, y: point3.y };
    const point4 = { x: point3.x, y: point1.y };

    currentShapeCopy.paths = [point1, point2, point3, point4, point1];
    currentShapeCopy.exactPathCount = currentShapeCopy.paths.length - 1;
    currentShapeCopy.d = getSVGPathD(currentShapeCopy.paths, false);
    setDrawingShape(currentShapeCopy);
  };

  const movingPolygon = (coordinate: Coordinate) => {
    const currentShapeCopy = cloneDeep(drawingShape);
    if (!currentShapeCopy) return;
    if (currentShapeCopy.exactPathCount === currentShapeCopy.paths.length) {
      currentShapeCopy.paths.push(coordinate);
    } else {
      currentShapeCopy.paths[currentShapeCopy.paths.length - 1] = coordinate;
    }
    currentShapeCopy.d = getSVGPathD(currentShapeCopy.paths, false);
    setDrawingShape(currentShapeCopy);
  };

  const drawRectanglePoint = () => {
    // finish drawing
    if (!drawingShape || drawingShape.exactPathCount === 1) return;
    dispatch(setCurrentShape({ currentShape: drawingShape }));
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
    if (!drawingShape) return;
    if (
      drawingShape.paths.length > 0 &&
      Math.abs(drawingShape.paths[0].x - mouseCoordinate.x) <=
        closePointRegion &&
      Math.abs(drawingShape.paths[0].y - mouseCoordinate.y) <= closePointRegion
    ) {
      // finish drawing
      if (drawingShape.exactPathCount === 1) return;
      dispatch(setCurrentShape({ currentShape: drawingShape }));
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
      for (let i = 0; i < drawingShape.paths.length; i++) {
        pointsX.push(drawingShape.paths[i].x);
        pointsY.push(drawingShape.paths[i].y);
      }

      if (drawingShape.exactPathCount === drawingShape.paths.length) return;
      const currentShapeCopy = cloneDeep(drawingShape);
      currentShapeCopy.paths[currentShapeCopy.paths.length - 1] = {
        ...mouseCoordinate,
      };
      currentShapeCopy.exactPathCount += 1;
      currentShapeCopy.d = getSVGPathD(currentShapeCopy.paths, false);

      setDrawingShape(currentShapeCopy);
    }
  };

  const isLeftMouseClick = (
    event: MouseEvent<HTMLDivElement | SVGPathElement, globalThis.MouseEvent>
  ) => event.button === 0;

  const isCoordinateInside = (cordinate: Coordinate, svgRect: DOMRect) => {
    const x = cordinate.x;
    const y = cordinate.y;

    const left = Math.max(90, svgRect.left);
    const right = Math.min(svgRect.right, 1360);
    const top = Math.max(150, svgRect.top);
    const bottom = Math.min(svgRect.bottom, 760);

    const isMouseInside = x >= left && x <= right && y >= top && y <= bottom;

    return isMouseInside;
  };

  const onSVGMouseDown = (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => {
    if (!svgRef.current) return;
    if (dragStatus === 'DRAG_IMAGE' && selShapeType === SHAPE_TYPES.MOVE) {
      const CTM = svgRef.current.getScreenCTM();
      if (!CTM) return;
      const svgRect = svgRef.current.getBoundingClientRect();

      const x = event.clientX;
      const y = event.clientY;

      if (!isCoordinateInside({ x, y }, svgRect)) {
        setIsDragging(false);
        return;
      }

      const point = svgRef.current.createSVGPoint();
      point.x = x;
      point.y = y;
      const transformedPoint = point.matrixTransform(CTM.inverse());

      setPrevPosition({
        x: transformedPoint.x,
        y: transformedPoint.y,
      });

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
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => {
    if (!svgRef.current) return;

    const coordinate = getMouseCoordinate(event);
    setMouseCoordinate(coordinate);

    switch (selShapeType) {
      case SHAPE_TYPES.MOVE:
        if (!isDraw && isDragging) {
          const svgRect = svgRef.current.getBoundingClientRect();

          const x = event.clientX;
          const y = event.clientY;

          if (!isCoordinateInside({ x, y }, svgRect)) {
            setIsDragging(false);
            return;
          }

          const CTM = svgRef.current.getScreenCTM();
          if (!CTM) return;

          const point = svgRef.current.createSVGPoint();
          point.x = x;
          point.y = y;
          const transformedPoint = point.matrixTransform(CTM.inverse());

          const deltaX = transformedPoint.x - prevPosition.x;
          const deltaY = transformedPoint.y - prevPosition.y;

          const angleInRadians = ((rotation % 360) * Math.PI) / 180;
          const cosTheta = Math.cos(angleInRadians);
          const sinTheta = Math.sin(angleInRadians);

          const rotatedDeltaX = deltaX * cosTheta - deltaY * sinTheta;
          const rotatedDeltaY = deltaX * sinTheta + deltaY * cosTheta;

          setPosition(position => ({
            x: position.x + rotatedDeltaX * scale,
            y: position.y + rotatedDeltaY * scale,
          }));
        }
        break;
      case SHAPE_TYPES.RECTANGLE:
        if (
          (drawStatus !== DRAW_STATUS_TYPES.DRAWING && !drawingShape) ||
          !isDraw
        )
          return;
        movingRectangle(coordinate);
        break;
      case SHAPE_TYPES.POLYGON:
        if (
          (drawStatus !== DRAW_STATUS_TYPES.DRAWING && !drawingShape) ||
          !isDraw
        )
          return;
        movingPolygon(coordinate);
        break;
      default:
        break;
    }
  };

  const onSVGMouseUp = (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => {
    setIsDragging(false);

    if (!isLeftMouseClick(event)) return;

    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    if (!isCoordinateInside({ x: event.clientX, y: event.clientY }, svgRect))
      return;

    // check dragging
    if (drawStatus === DRAW_STATUS_TYPES.SELECT) {
      dispatch(setSelShapeIndex({ selShapeIndex: -1 }));
      return;
    }

    if (drawStatus === DRAW_STATUS_TYPES.IDLE && isDraw) {
      // start drawing
      const newShape = shapeFactory(mouseCoordinate);

      setDrawingShape(newShape);
      dispatch(setDrawStatus({ drawStatus: DRAW_STATUS_TYPES.DRAWING }));
    } else if (drawStatus === DRAW_STATUS_TYPES.DRAWING && drawingShape) {
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
      setSelShapeIndex({ selShapeIndex: index === selShapeIndex ? -1 : index })
    );
  };

  const handleClickPath = (imageName: string) => {
    if (shapes[selDrawImageIndex] && shapes[selDrawImageIndex]?.length > 0)
      return;

    // danh sách tất cả các shapes đang có, phải kiểu dữ liệu mảng
    //const listShape = [shapeFactoryTest(coordinates[0]), shapeFactoryTest(coordinates[1])];
    const result = listDetections.find(item => {
      const imageWithoutEx = item.image_name.split('.')[0];
      const imageNameNew = imageName.split('.')[0];
      return imageWithoutEx === imageNameNew;
    });

    const listBoxes = result ? result.objects_detection : [];

    // let listShape = listObject
    //     .filter((obj) => obj.image_name === imageName)
    //     .map((obj) => shapeFactoryTest(obj.coordinate));
    // let listLabel = listObject.filter((obj) => obj.imageName === imageName);
    // for (var i = 0; i < listShape.length; i++) {
    //     const newShape = listShape[i];
    //     dispatch(setCurrentShape({ currentShape: newShape }));
    // }

    // for (var i = 0; i < listBoxes.length; i++) {
    //   const newShape = shapeFactoryTest(listBoxes[i].coordinates);
    //   dispatch(setCurrentShape({ currentShape: newShape }));
    // }

    const shapesCopy = cloneDeep(shapes);

    shapesCopy[selDrawImageIndex] = [];
    for (let i = 0; i < listBoxes.length; i++) {
      const currentShapeCopy = cloneDeep(
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
        onMouseMove={onSVGMouseMove}
        onMouseUp={onSVGMouseUp}
        onMouseDown={onSVGMouseDown}
        style={{ touchAction: 'none' }} // Disable default touch actions
      >
        {imageFiles[selDrawImageIndex] && (
          <svg
            className="svg-container transition-transform"
            ref={svgRef}
            viewBox={`0 0 ${imageSizes[selDrawImageIndex].width} ${imageSizes[selDrawImageIndex].height}`}
            style={{
              cursor: 'default',
              position: 'absolute',
              left: position.x,
              top: position.y - 60,
              width: `${imageSizes[selDrawImageIndex].width * scale}px`,
              height: `${imageSizes[selDrawImageIndex].height * scale}px`,
              transform: `rotate(${rotation}deg)`,
              transformOrigin: '50% 50%',
              transition: isTransitioning
                ? `transform ${ZOOM_ANIMATION_DURATION}ms ease-out, width ${ZOOM_ANIMATION_DURATION}ms ease-out, height ${ZOOM_ANIMATION_DURATION}ms ease-out`
                : 'none',
              willChange: 'transform, width, height',
            }}
          >
            <image
              href={imageProps.href}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
            />

            {drawingShape && (
              <g>
                <path
                  d={drawingShape.d}
                  style={{ ...drawingShapePathStyle } as React.CSSProperties}
                />
                {drawingShape.paths.map(point => (
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
                  <g
                    key={shape.d}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {hoveredIndex === index ? (
                      <Tooltip
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
                            fontSize: '22px',
                            padding: '8px 16px',
                          },
                        }}
                      >
                        <path
                          d={shape.d}
                          style={
                            shape.isSelect
                              ? { ...selShapeStyle }
                              : { ...shapeStyle }
                          }
                          onMouseUp={event => onShapeMouseUp(event, index)}
                        />
                      </Tooltip>
                    ) : (
                      <path
                        d={shape.d}
                        style={
                          shape.isSelect
                            ? { ...selShapeStyle }
                            : { ...shapeStyle }
                        }
                        onMouseUp={event => onShapeMouseUp(event, index)}
                      />
                    )}
                  </g>
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
