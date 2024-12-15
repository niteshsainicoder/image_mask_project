import { useEffect, useRef, useState } from 'react';
import './App.css';
import * as fabric from 'fabric';

function App() {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  const [brushSize, setBrushSize] = useState(5);
  const [imageFile, setImageFile] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  let clear = () => {
    fabricCanvas.current.clear();
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric.js Canvas
    fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: 500,
      height: 500,
    });

    fabricCanvas.current.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas.current);
    fabricCanvas.current.freeDrawingBrush.color = '#ffffff';
    fabricCanvas.current.freeDrawingBrush.width = brushSize;

    return () => {
      fabricCanvas.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (fabricCanvas.current) {
      fabricCanvas.current.freeDrawingBrush.width = brushSize;
    }
  }, [brushSize]);

  const exportMask = () => {
    const maskCanvas = fabricCanvas.current.getElement();
    const ctx = maskCanvas.getContext('2d');

    // Clear canvas before rendering mask
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 500, maskCanvas.height);

    fabricCanvas.current.getObjects().forEach((obj) => {
      if (obj.type === 'path') {
        ctx.globalCompositeOperation = 'source-over';
        obj.render(ctx);
      }
    });

    setMaskImage(maskCanvas.toDataURL('image/png'));
  };

  return (
    <div id="Main">
      <div id="UpperSection">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h1>Brush Size Control</h1>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <button onClick={() => { clear(); }}>Clear Canvas</button>
          <label htmlFor="brushsize">Brush Size: {brushSize}</label>
          <input
            type="range"
            id="brushsize"
            max={20}
            min={1}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
          <button onClick={exportMask}>Export Mask</button>
        </div>

        <div id="Middle">
          {imageFile && (
            <div className="Image">
              <h2>Uploaded Image Preview:</h2>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Uploaded"
                style={{
                  width: '300px',
                  height: 'auto',
                  border: '1px solid black',
                }}
              />
            </div>
          )}

          {maskImage && (
            <div className="Image">
              <h2>Generated Mask:</h2>
              <img
                src={maskImage}
                alt="Generated Mask"
                style={{
                  width: '300px',
                  height: 'auto',
                  border: '1px solid black',
                  backgroundColor: 'black',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Parent div with background image */}
      <div
        id="canvasbox"
        style={{
          width: '500px',
          height: '500px',
          border: '1px solid #000',
          backgroundImage: imageFile
            ? `url(${URL.createObjectURL(imageFile)})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          borderRadius: '8px',
        }}
      >
        <canvas
          id="canvas"
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </div>
    </div>
  );
}

export default App;
