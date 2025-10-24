import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import './CanvasEditor.css';

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  rotation?: number;
  color?: string;
  fontSize?: number;
}

export interface CanvasData {
  elements: CanvasElement[];
  background?: string;
}

export interface CanvasEditorHandle {
  getData: () => CanvasData;
  loadData: (data: CanvasData) => void;
  exportImage: () => void;
}

export const CanvasEditor = forwardRef<CanvasEditorHandle>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  useEffect(() => {
    drawCanvas();
  }, [elements]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw elements
    elements.forEach((element) => {
      ctx.save();
      ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
      if (element.rotation) {
        ctx.rotate((element.rotation * Math.PI) / 180);
      }
      ctx.translate(-(element.x + element.width / 2), -(element.y + element.height / 2));

      switch (element.type) {
        case 'text':
          drawText(ctx, element);
          break;
        case 'shape':
          drawShape(ctx, element);
          break;
        case 'image':
          // Image drawing would be implemented here
          break;
      }

      // Draw selection border
      if (selectedElement === element.id) {
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = 2;
        ctx.strokeRect(element.x, element.y, element.width, element.height);
      }

      ctx.restore();
    });
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    const gridSize = 20;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawText = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.fillStyle = element.color || '#000000';
    ctx.font = `${element.fontSize || 24}px Arial`;
    ctx.fillText(element.content || '', element.x, element.y + (element.fontSize || 24));
  };

  const drawShape = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.fillStyle = element.color || '#000000';
    ctx.fillRect(element.x, element.y, element.width, element.height);
  };

  useImperativeHandle(ref, () => ({
    getData: () => ({
      elements,
    }),
    loadData: (data: CanvasData) => {
      setElements(data.elements || []);
    },
    exportImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'kanva-design.png';
      link.href = dataUrl;
      link.click();
    },
  }));

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked element
    const clicked = elements.find(
      (el) => x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height
    );

    setSelectedElement(clicked?.id || null);
  };

  return (
    <div className="canvas-editor">
      <div className="canvas-toolbar">
        <button
          className="toolbar-btn"
          onClick={() => {
            const newElement: CanvasElement = {
              id: Date.now().toString(),
              type: 'text',
              x: 100,
              y: 100,
              width: 200,
              height: 50,
              content: 'Double click to edit',
              fontSize: 24,
              color: '#000000',
            };
            setElements([...elements, newElement]);
          }}
        >
          Add Text
        </button>
        <button
          className="toolbar-btn"
          onClick={() => {
            const newElement: CanvasElement = {
              id: Date.now().toString(),
              type: 'shape',
              x: 150,
              y: 150,
              width: 100,
              height: 100,
              color: '#4285f4',
            };
            setElements([...elements, newElement]);
          }}
        >
          Add Shape
        </button>
        {selectedElement && (
          <button
            className="toolbar-btn delete-btn"
            onClick={() => {
              setElements(elements.filter((el) => el.id !== selectedElement));
              setSelectedElement(null);
            }}
          >
            Delete
          </button>
        )}
      </div>
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onClick={handleCanvasClick}
          className="canvas"
        />
      </div>
    </div>
  );
});

CanvasEditor.displayName = 'CanvasEditor';
