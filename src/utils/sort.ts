import type { Coordinate, Shape } from '@/lib/redux';

export const getShapeCenter = (shape: Shape): Coordinate => {
  if (!shape.paths || shape.paths.length === 0) {
    return { x: 0, y: 0 };
  }

  // Paths represent a bounding box with format [top-left, top-right, bottom-right, bottom-left, top-left]
  const x_min = shape.paths[0].x;
  const y_min = shape.paths[0].y;
  const x_max = shape.paths[2].x;
  const y_max = shape.paths[2].y;

  // Calculate the center by averaging the corner points
  return {
    x: (x_min + x_max) / 2,
    y: (y_min + y_max) / 2,
  };
};

export const sortShapesByColumn = (shapesByImageIndex: Shape[]): Shape[][] => {
  const visibleShapes = shapesByImageIndex
    .filter(shape => shape.visible)
    .map(shape => ({
      ...shape,
      center: getShapeCenter(shape),
    }));

  const columnTolerance = 20; // Adjust based on your character width
  const columns: Array<typeof visibleShapes> = [];

  // Group characters into columns
  visibleShapes.forEach(shape => {
    // Find a column that this shape belongs to based on x position
    let columnIndex = columns.findIndex(column => {
      if (column.length === 0) return false;
      const columnX = column[0].center.x;
      return Math.abs(shape.center.x - columnX) < columnTolerance;
    });

    // If no matching column, create a new one
    if (columnIndex === -1) {
      columns.push([shape]);
    } else {
      columns[columnIndex].push(shape);
    }
  });

  // Sort each column by y coordinate (top to bottom)
  columns.forEach(column => {
    column.sort((a, b) => a.center.y - b.center.y);
  });

  // Sort columns by x coordinate (right to left)
  columns.sort((columnA, columnB) => {
    if (columnA.length === 0) return 1;
    if (columnB.length === 0) return -1;
    return columnB[0].center.x - columnA[0].center.x; // Right to left
  });

  return columns;
};

export const sortShapesByRow = (shapesByImageIndex: Shape[]): Shape[][] => {
  const visibleShapes = shapesByImageIndex
    .filter(shape => shape.visible)
    .map(shape => ({
      ...shape,
      center: getShapeCenter(shape),
    }));

  const rowTolerance = 20; // Adjust based on your character height
  const rows: Array<typeof visibleShapes> = [];

  // Group characters into rows
  visibleShapes.forEach(shape => {
    // Find a row that this shape belongs to based on y position
    let rowIndex = rows.findIndex(row => {
      if (row.length === 0) return false;
      const rowY = row[0].center.y;
      return Math.abs(shape.center.y - rowY) < rowTolerance;
    });

    // If no matching row, create a new one
    if (rowIndex === -1) {
      rows.push([shape]);
    } else {
      rows[rowIndex].push(shape);
    }
  });

  // Sort each row by x coordinate (left to right)
  rows.forEach(row => {
    row.sort((a, b) => a.center.x - b.center.x);
  });

  // Sort rows by y coordinate (top to bottom)
  rows.sort((rowA, rowB) => {
    if (rowA.length === 0) return 1;
    if (rowB.length === 0) return -1;
    return rowA[0].center.y - rowB[0].center.y;
  });

  return rows;
};
