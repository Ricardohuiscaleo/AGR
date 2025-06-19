import React, { useRef, useEffect } from 'react';
import './Noise.css';

const Noise = ({ width, height, patternOpacity }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    const generateNoise = () => {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternOpacity;
      }

      ctx.putImageData(imageData, 0, 0);
    };

    generateNoise();
  }, [width, height, patternOpacity]);

  return <canvas className="noise" ref={canvasRef} width={width} height={height} />;
};

export default Noise;
