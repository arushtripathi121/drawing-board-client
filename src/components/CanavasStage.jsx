import React, { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Line, Text } from 'react-konva';

const CanavasStage = ({ tools, strokeSize, strokeColor }) => {

    const [lines, setLines] = useState([]);
    const isDrawing = useRef(false);
    const [showCursor, setShowCursor] = useState(false);

    const handleMouseDown = (e) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        setLines((prevLines) => [
            ...prevLines,
            {
                tools,
                strokeColor,
                strokeSize,
                points: [pos.x, pos.y],
            },
        ]);
    }

    const handleMouseMove = (e) => {
        if (!isDrawing.current) {
            return;
        }
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        let lastLines = lines[lines.length - 1];
        lastLines.points = lastLines.points.concat([point.x, point.y]);
        lines.splice(lines.length - 1, 1, lastLines);
        setLines((prevLines) => {
            const lastLine = prevLines[prevLines.length - 1];
            const updatedLine = {
                ...lastLine,
                points: [...lastLine.points, point.x, point.y],
            };
            return [...prevLines.slice(0, -1), updatedLine];
        });

    }

    const handleMouseUp = (e) => {
        isDrawing.current = false;
    }

    const cursorRef = useRef(null);
    const getCursorClass = () => {
        return 'pointer-events-none fixed z-50 rounded-full border shadow-sm';
    };

    const getCursorStyle = () => {
        const size = tools === 'pen' ? strokeSize : (strokeSize || 10);
        return {
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: tools === 'pen' ? strokeColor : '#fff',
            borderColor: tools === 'pen' ? strokeColor : '#999',
            borderWidth: tools === 'pen' ? '1px' : '2px',
            transform: 'translate(-50%, -50%)',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 9999,
        };
    };


    useEffect(() => {
        const moveCursor = (e) => {
            const cursor = cursorRef.current;
            if (cursor) {
                cursor.style.left = `${e.clientX}px`;
                cursor.style.top = `${e.clientY}px`;
            }
        }

        window.addEventListener('mousemove', moveCursor);
        return () => {
            window.removeEventListener('mousemove', moveCursor);
        }
    }, []);

    return (
        <div className="relative w-full h-full">
            {showCursor && (
                <div
                    ref={cursorRef}
                    className={getCursorClass()}
                    style={getCursorStyle()}
                />
            )}
            <Stage
                className='cursor-none'
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}

                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
                onMouseEnter={() => setShowCursor(true)}
                onMouseLeave={() => setShowCursor(false)}>
                <Layer>
                    {lines.map((line, i) => (
                        <Line
                            key={i}
                            points={line.points}
                            stroke={line.strokeColor}
                            strokeWidth={line.strokeSize}
                            tension={0.5}
                            lineCap="round"
                            lineJoin="round"
                            globalCompositeOperation={
                                line.tools === 'eraser' ? 'destination-out' : 'source-over'
                            }
                        />
                    ))}
                </Layer>
            </Stage>
        </div >
    )
}

export default CanavasStage;
