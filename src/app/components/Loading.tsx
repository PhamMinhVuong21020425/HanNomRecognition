import { useState } from 'react';
import PacmanLoader from 'react-spinners/PacmanLoader';

function Loading() {
  const [color, setColor] = useState('#ffff00');

  return (
    <div className="loading">
      <PacmanLoader color={color} size={20} />
    </div>
  );
}

export default Loading;
