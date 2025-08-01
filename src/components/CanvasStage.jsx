import React, { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Line, Rect, Circle, Star, Arrow, Ellipse, Transformer } from 'react-konva';

const CanvasStage = ({ tools, strokeSize, strokeColor }) => {
    const [lines, setLines] = useState([]);
    const [shapes, setShapes] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionRect, setSelectionRect] = useState(null);
    const [history, setHistory] = useState([{ lines: [], shapes: [] }]);
    const [historyStep, setHistoryStep] = useState(0);

    // Camera/viewport state
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

    const isDrawing = useRef(false);
    const isDragging = useRef(false);
    const isSelecting = useRef(false);
    const [showCursor, setShowCursor] = useState(false);
    const transformerRef = useRef();
    const layerRef = useRef();
    const stageRef = useRef();
    const selectionRectRef = useRef();

    // Generate unique ID for shapes
    const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save state to history
    const saveHistory = (newLines = lines, newShapes = shapes) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({ lines: [...newLines], shapes: [...newShapes] });
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    // Undo functionality
    const undo = () => {
        if (historyStep > 0) {
            const prevState = history[historyStep - 1];
            setLines(prevState.lines);
            setShapes(prevState.shapes);
            setHistoryStep(historyStep - 1);
            setSelectedIds([]);
        }
    };

    // Redo functionality
    const redo = () => {
        if (historyStep < history.length - 1) {
            const nextState = history[historyStep + 1];
            setLines(nextState.lines);
            setShapes(nextState.shapes);
            setHistoryStep(historyStep + 1);
        }
    };

    // Clear canvas
    const clearCanvas = () => {
        setLines([]);
        setShapes([]);
        setSelectedIds([]);
        setSelectionRect(null);
        saveHistory([], []);
    };

    // Zoom functions
    const handleZoom = (newScale, pointer = null) => {
        const stage = stageRef.current;
        if (!stage) return;

        const oldScale = stage.scaleX();
        const mousePointTo = pointer || {
            x: stage.width() / 2,
            y: stage.height() / 2
        };

        const newPos = {
            x: -(mousePointTo.x - stage.x()) * newScale / oldScale + mousePointTo.x,
            y: -(mousePointTo.y - stage.y()) * newScale / oldScale + mousePointTo.y,
        };

        setScale(newScale);
        setPosition(newPos);
    };

    const zoomIn = () => {
        const newScale = Math.min(scale * 1.2, 5);
        handleZoom(newScale);
    };

    const zoomOut = () => {
        const newScale = Math.max(scale * 0.8, 0.1);
        handleZoom(newScale);
    };

    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // Convert screen coordinates to canvas coordinates
    const getRelativePointerPosition = (stage) => {
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const pos = stage.getPointerPosition();
        return transform.point(pos);
    };

    // Validate shape dimensions to prevent infinite loops
    const validateShapeDimensions = (shape) => {
        const minSize = 5;

        if (shape.width !== undefined) {
            shape.width = Math.max(minSize, Math.abs(shape.width) || minSize);
        }
        if (shape.height !== undefined) {
            shape.height = Math.max(minSize, Math.abs(shape.height) || minSize);
        }
        if (shape.radius !== undefined) {
            shape.radius = Math.max(minSize, Math.abs(shape.radius) || minSize);
        }
        if (shape.radiusX !== undefined) {
            shape.radiusX = Math.max(minSize, Math.abs(shape.radiusX) || minSize);
        }
        if (shape.radiusY !== undefined) {
            shape.radiusY = Math.max(minSize, Math.abs(shape.radiusY) || minSize);
        }
        if (shape.innerRadius !== undefined) {
            shape.innerRadius = Math.max(2, Math.abs(shape.innerRadius) || 2);
        }
        if (shape.outerRadius !== undefined) {
            shape.outerRadius = Math.max(minSize, Math.abs(shape.outerRadius) || minSize);
        }

        // Validate coordinates
        if (isNaN(shape.x) || !isFinite(shape.x)) shape.x = 0;
        if (isNaN(shape.y) || !isFinite(shape.y)) shape.y = 0;

        return shape;
    };

    const handleMouseDown = (e) => {
        const stage = stageRef.current;
        if (!stage) return;

        const clickedOnEmpty = e.target === stage;
        const pos = getRelativePointerPosition(stage);

        // Validate position
        if (!pos || isNaN(pos.x) || isNaN(pos.y)) return;

        // Handle hand tool for panning
        if (tools === 'hand') {
            const pointerPos = stage.getPointerPosition();
            setIsPanning(true);
            setLastPanPoint(pointerPos);
            return;
        }

        // Handle delete tool
        if (tools === 'delete') {
            const clickedShape = e.target;
            if (clickedShape !== stage) {
                const shapeId = clickedShape.id();
                if (shapeId && (shapeId.startsWith('shape_') || shapeId.includes('_'))) {
                    const newShapes = shapes.filter(shape => shape.id !== shapeId);
                    setShapes(newShapes);
                    setSelectedIds([]);
                    saveHistory(lines, newShapes);
                }
            }
            return;
        }

        // Handle shape creation with drag and drop
        if (['Rect', 'Circle', 'Star', 'Arrow', 'Ellipse', 'Line', 'Diamond'].includes(tools)) {
            isDragging.current = true;

            let newShape = {
                id: `shape_${generateId()}`,
                type: tools,
                x: pos.x,
                y: pos.y,
                fill: 'transparent',
                stroke: strokeColor,
                strokeWidth: strokeSize,
                draggable: true,
                rotation: 0,
                opacity: 1,
                startX: pos.x,
                startY: pos.y,
            };

            // Set initial dimensions based on shape type
            if (tools === 'Rect') {
                newShape.width = 20;
                newShape.height = 20;
            } else if (tools === 'Circle') {
                newShape.radius = 10;
            } else if (tools === 'Ellipse') {
                newShape.radiusX = 15;
                newShape.radiusY = 10;
            } else if (tools === 'Star') {
                newShape.numPoints = 5;
                newShape.innerRadius = 8;
                newShape.outerRadius = 15;
            } else if (tools === 'Arrow') {
                newShape.points = [0, 0, 20, 0];
                newShape.pointerLength = 10;
                newShape.pointerWidth = 8;
            } else if (tools === 'Line') {
                newShape.points = [0, 0, 20, 20];
                newShape.fill = undefined;
            } else if (tools === 'Diamond') {
                newShape.points = [10, 0, 20, 10, 10, 20, 0, 10];
                newShape.fill = 'transparent';
                newShape.closed = true;
            }

            newShape = validateShapeDimensions(newShape);
            const newShapes = [...shapes, newShape];
            setShapes(newShapes);
            setSelectedIds([newShape.id]);
            return;
        }

        // Handle cursor tool for selection
        if (tools === 'cursor') {
            if (clickedOnEmpty) {
                isSelecting.current = true;
                setSelectionRect({
                    x: pos.x,
                    y: pos.y,
                    width: 0,
                    height: 0,
                });
                setSelectedIds([]);
            } else {
                const clickedShapeId = e.target.id();
                if (clickedShapeId) {
                    if (e.evt.ctrlKey || e.evt.metaKey) {
                        if (selectedIds.includes(clickedShapeId)) {
                            setSelectedIds(selectedIds.filter(id => id !== clickedShapeId));
                        } else {
                            setSelectedIds([...selectedIds, clickedShapeId]);
                        }
                    } else {
                        if (!selectedIds.includes(clickedShapeId)) {
                            setSelectedIds([clickedShapeId]);
                        }
                    }
                }
            }
            return;
        }

        // Handle drawing (pen/eraser)
        if (tools === 'pen' || tools === 'eraser') {
            isDrawing.current = true;
            const newLine = {
                id: `line_${generateId()}`,
                tool: tools,
                strokeColor: strokeColor,
                strokeWidth: tools === 'pen' ? strokeSize : strokeSize * 1.5,
                points: [pos.x, pos.y],
            };

            setLines(prevLines => [...prevLines, newLine]);
        }
    };

    const handleMouseMove = (e) => {
        const stage = stageRef.current;
        if (!stage) return;

        const pointerPos = stage.getPointerPosition();
        const pos = getRelativePointerPosition(stage);

        if (!pos || isNaN(pos.x) || isNaN(pos.y)) return;

        // Handle panning with hand tool
        if (isPanning && tools === 'hand') {
            const dx = pointerPos.x - lastPanPoint.x;
            const dy = pointerPos.y - lastPanPoint.y;
            const newPos = {
                x: position.x + dx,
                y: position.y + dy
            };
            setPosition(newPos);
            setLastPanPoint(pointerPos);
            return;
        }

        // Handle shape creation drag
        if (isDragging.current && ['Rect', 'Circle', 'Star', 'Arrow', 'Ellipse', 'Line', 'Diamond'].includes(tools)) {
            const newShapes = [...shapes];
            const currentShape = newShapes[newShapes.length - 1];

            if (currentShape && currentShape.startX !== undefined && currentShape.startY !== undefined) {
                const width = Math.abs(pos.x - currentShape.startX);
                const height = Math.abs(pos.y - currentShape.startY);
                const x = Math.min(pos.x, currentShape.startX);
                const y = Math.min(pos.y, currentShape.startY);

                if (currentShape.type === 'Rect') {
                    currentShape.x = x;
                    currentShape.y = y;
                    currentShape.width = Math.max(width, 10);
                    currentShape.height = Math.max(height, 10);
                } else if (currentShape.type === 'Circle') {
                    const radius = Math.max(Math.min(width, height) / 2, 5);
                    currentShape.x = currentShape.startX;
                    currentShape.y = currentShape.startY;
                    currentShape.radius = radius;
                } else if (currentShape.type === 'Ellipse') {
                    currentShape.x = x + width / 2;
                    currentShape.y = y + height / 2;
                    currentShape.radiusX = Math.max(width / 2, 5);
                    currentShape.radiusY = Math.max(height / 2, 5);
                } else if (currentShape.type === 'Star') {
                    const radius = Math.max(Math.min(width, height) / 2, 10);
                    currentShape.x = currentShape.startX;
                    currentShape.y = currentShape.startY;
                    currentShape.innerRadius = Math.max(radius * 0.5, 3);
                    currentShape.outerRadius = radius;
                } else if (currentShape.type === 'Arrow' || currentShape.type === 'Line') {
                    currentShape.x = currentShape.startX;
                    currentShape.y = currentShape.startY;
                    currentShape.points = [0, 0, pos.x - currentShape.startX, pos.y - currentShape.startY];
                } else if (currentShape.type === 'Diamond') {
                    const centerX = width / 2;
                    const centerY = height / 2;
                    currentShape.x = x;
                    currentShape.y = y;
                    currentShape.points = [centerX, 0, width, centerY, centerX, height, 0, centerY];
                }

                validateShapeDimensions(currentShape);
                setShapes(newShapes);
            }
            return;
        }

        // Handle selection rectangle
        if (isSelecting.current && tools === 'cursor' && selectionRect) {
            const rect = { ...selectionRect };
            rect.width = pos.x - rect.x;
            rect.height = pos.y - rect.y;
            setSelectionRect(rect);
            return;
        }

        // Handle drawing
        if (!isDrawing.current || !['pen', 'eraser'].includes(tools)) {
            return;
        }

        setLines(prevLines => {
            const newLines = [...prevLines];
            const lastLine = newLines[newLines.length - 1];
            if (lastLine) {
                lastLine.points = [...lastLine.points, pos.x, pos.y];
            }
            return newLines;
        });
    };

    const handleMouseUp = () => {
        // Handle panning end
        if (isPanning) {
            setIsPanning(false);
            return;
        }

        // Handle shape creation completion
        if (isDragging.current) {
            isDragging.current = false;
            const newShapes = [...shapes];
            const lastShape = newShapes[newShapes.length - 1];
            if (lastShape) {
                delete lastShape.startX;
                delete lastShape.startY;
                validateShapeDimensions(lastShape);
            }
            setShapes(newShapes);
            saveHistory(lines, newShapes);
            return;
        }

        // Handle selection rectangle completion
        if (isSelecting.current && selectionRect) {
            isSelecting.current = false;

            const selectedShapeIds = shapes.filter(shape => {
                const rect = selectionRect;
                const rectLeft = Math.min(rect.x, rect.x + rect.width);
                const rectRight = Math.max(rect.x, rect.x + rect.width);
                const rectTop = Math.min(rect.y, rect.y + rect.height);
                const rectBottom = Math.max(rect.y, rect.y + rect.height);

                return shape.x >= rectLeft && shape.x <= rectRight &&
                    shape.y >= rectTop && shape.y <= rectBottom;
            }).map(shape => shape.id);

            setSelectedIds(selectedShapeIds);
            setSelectionRect(null);
            return;
        }

        // Handle drawing completion
        if (isDrawing.current && ['pen', 'eraser'].includes(tools)) {
            saveHistory();
        }

        isDrawing.current = false;
    };

    // Handle zoom with wheel
    const handleWheel = (e) => {
        e.evt.preventDefault();

        const stage = stageRef.current;
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const scaleBy = 1.05;
        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        const boundedScale = Math.max(0.1, Math.min(5, newScale));

        handleZoom(boundedScale, pointer);
    };

    // Handle shape selection
    const handleShapeClick = (e, shapeId) => {
        if (tools !== 'cursor') return;

        e.cancelBubble = true;

        if (e.evt.ctrlKey || e.evt.metaKey) {
            if (selectedIds.includes(shapeId)) {
                setSelectedIds(selectedIds.filter(id => id !== shapeId));
            } else {
                setSelectedIds([...selectedIds, shapeId]);
            }
        } else {
            setSelectedIds([shapeId]);
        }
    };

    // Update transformer when selection changes
    useEffect(() => {
        if (!transformerRef.current || !layerRef.current) return;

        try {
            if (selectedIds.length > 0) {
                const selectedNodes = selectedIds
                    .map(id => layerRef.current.findOne(`#${id}`))
                    .filter(node => {
                        if (!node) return false;
                        try {
                            const rect = node.getClientRect();
                            return rect &&
                                isFinite(rect.x) && isFinite(rect.y) &&
                                isFinite(rect.width) && isFinite(rect.height) &&
                                rect.width > 0 && rect.height > 0;
                        } catch (err) {
                            return false;
                        }
                    });

                if (selectedNodes.length > 0) {
                    transformerRef.current.nodes(selectedNodes);
                    transformerRef.current.getLayer()?.batchDraw();
                } else {
                    transformerRef.current.nodes([]);
                }
            } else {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer()?.batchDraw();
            }
        } catch (error) {
            console.error('Transformer error:', error);
            transformerRef.current.nodes([]);
            setSelectedIds([]);
        }
    }, [selectedIds]);

    // Handle shape updates with validation
    const handleShapeChange = (shapeId, newAttrs) => {
        const newShapes = shapes.map(shape => {
            if (shape.id === shapeId) {
                const updatedShape = { ...shape, ...newAttrs };
                return validateShapeDimensions(updatedShape);
            }
            return shape;
        });
        setShapes(newShapes);
    };

    // Shape render function with error handling
    const renderShape = (shape) => {
        try {
            const validatedShape = validateShapeDimensions({ ...shape });
            const isSelected = selectedIds.includes(shape.id);

            const shapeProps = {
                id: validatedShape.id,
                x: validatedShape.x || 0,
                y: validatedShape.y || 0,
                fill: validatedShape.fill,
                stroke: validatedShape.stroke,
                strokeWidth: validatedShape.strokeWidth,
                draggable: tools === 'cursor',
                rotation: validatedShape.rotation || 0,
                opacity: validatedShape.opacity || 1,
                shadowBlur: isSelected ? 8 : 0,
                shadowColor: isSelected ? '#1971c2' : 'transparent',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                onClick: (e) => handleShapeClick(e, validatedShape.id),
                onDragEnd: (e) => {
                    const target = e.target;
                    const newAttrs = {
                        x: target.x(),
                        y: target.y()
                    };
                    handleShapeChange(validatedShape.id, newAttrs);
                    saveHistory();
                },
                onTransformEnd: (e) => {
                    try {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();

                        // Important: Reset scale before getting dimensions
                        node.scaleX(1);
                        node.scaleY(1);

                        const newAttrs = {
                            x: node.x(),
                            y: node.y(),
                            rotation: node.rotation()
                        };

                        if (validatedShape.type === 'Rect') {
                            // Get the actual width/height after scaling
                            const actualWidth = node.width() * Math.abs(scaleX);
                            const actualHeight = node.height() * Math.abs(scaleY);
                            newAttrs.width = Math.max(10, actualWidth);
                            newAttrs.height = Math.max(10, actualHeight);
                        } else if (validatedShape.type === 'Circle') {
                            const actualRadius = validatedShape.radius * Math.abs(Math.min(scaleX, scaleY));
                            newAttrs.radius = Math.max(5, actualRadius);
                        } else if (validatedShape.type === 'Ellipse') {
                            const actualRadiusX = validatedShape.radiusX * Math.abs(scaleX);
                            const actualRadiusY = validatedShape.radiusY * Math.abs(scaleY);
                            newAttrs.radiusX = Math.max(5, actualRadiusX);
                            newAttrs.radiusY = Math.max(5, actualRadiusY);
                        } else if (validatedShape.type === 'Star') {
                            const scale = Math.abs(Math.min(scaleX, scaleY));
                            const actualInner = validatedShape.innerRadius * scale;
                            const actualOuter = validatedShape.outerRadius * scale;
                            newAttrs.innerRadius = Math.max(3, actualInner);
                            newAttrs.outerRadius = Math.max(8, actualOuter);
                        }

                        handleShapeChange(validatedShape.id, newAttrs);
                        saveHistory();
                    } catch (transformError) {
                        console.error('Transform error:', transformError);
                    }
                }
            };

            switch (validatedShape.type) {
                case 'Rect':
                    return (
                        <Rect
                            key={validatedShape.id}
                            {...shapeProps}
                            width={validatedShape.width}
                            height={validatedShape.height}
                            cornerRadius={3}
                        />
                    );
                case 'Circle':
                    return (
                        <Circle
                            key={validatedShape.id}
                            {...shapeProps}
                            radius={validatedShape.radius}
                        />
                    );
                case 'Ellipse':
                    return (
                        <Ellipse
                            key={validatedShape.id}
                            {...shapeProps}
                            radiusX={validatedShape.radiusX}
                            radiusY={validatedShape.radiusY}
                        />
                    );
                case 'Star':
                    return (
                        <Star
                            key={validatedShape.id}
                            {...shapeProps}
                            numPoints={validatedShape.numPoints}
                            innerRadius={validatedShape.innerRadius}
                            outerRadius={validatedShape.outerRadius}
                        />
                    );
                case 'Arrow':
                    return (
                        <Arrow
                            key={validatedShape.id}
                            {...shapeProps}
                            points={validatedShape.points || [0, 0, 20, 0]}
                            pointerLength={validatedShape.pointerLength}
                            pointerWidth={validatedShape.pointerWidth}
                        />
                    );
                case 'Line':
                    return (
                        <Line
                            key={validatedShape.id}
                            {...shapeProps}
                            points={validatedShape.points || [0, 0, 20, 20]}
                            lineCap="round"
                            lineJoin="round"
                        />
                    );
                case 'Diamond':
                    return (
                        <Line
                            key={validatedShape.id}
                            {...shapeProps}
                            points={validatedShape.points || [10, 0, 20, 10, 10, 20, 0, 10]}
                            closed={validatedShape.closed}
                            lineCap="round"
                            lineJoin="round"
                        />
                    );
                default:
                    return null;
            }
        } catch (renderError) {
            console.error('Shape render error:', renderError);
            return null;
        }
    };

    // Custom cursor styles
    const cursorRef = useRef(null);

    const getCursorStyle = () => {
        if (['cursor', 'delete', 'hand'].includes(tools)) {
            return { display: 'none' };
        }

        const size = ['pen', 'eraser'].includes(tools) ? Math.max(strokeSize * 2, 12) : 16;
        return {
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: tools === 'pen' ? strokeColor : tools === 'eraser' ? '#ff6b6b' : 'transparent',
            borderColor: tools === 'pen' ? strokeColor : '#999',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            opacity: 0.7,
        };
    };

    const getStageClass = () => {
        if (tools === 'cursor') return 'cursor-default';
        if (tools === 'delete') return 'cursor-pointer';
        if (tools === 'hand') return isPanning ? 'cursor-grabbing' : 'cursor-grab';
        if (['Rect', 'Circle', 'Star', 'Arrow', 'Ellipse', 'Line', 'Diamond'].includes(tools)) return 'cursor-crosshair';
        return 'cursor-none';
    };

    // Mouse cursor management
    useEffect(() => {
        const moveCursor = (e) => {
            const cursor = cursorRef.current;
            if (cursor && !['cursor', 'delete', 'hand'].includes(tools)) {
                cursor.style.left = `${e.clientX}px`;
                cursor.style.top = `${e.clientY}px`;
            }
        };

        window.addEventListener('mousemove', moveCursor);
        return () => {
            window.removeEventListener('mousemove', moveCursor);
        };
    }, [tools, strokeSize, strokeColor]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            try {
                if (e.ctrlKey || e.metaKey) {
                    if (e.key === 'z' && !e.shiftKey) {
                        e.preventDefault();
                        undo();
                    } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
                        e.preventDefault();
                        redo();
                    } else if (e.key === 'a') {
                        e.preventDefault();
                        setSelectedIds(shapes.map(shape => shape.id));
                    } else if (e.key === '0') {
                        e.preventDefault();
                        resetZoom();
                    } else if (e.key === '=') {
                        e.preventDefault();
                        zoomIn();
                    } else if (e.key === '-') {
                        e.preventDefault();
                        zoomOut();
                    }
                } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
                    e.preventDefault();
                    const newShapes = shapes.filter(shape => !selectedIds.includes(shape.id));
                    setShapes(newShapes);
                    setSelectedIds([]);
                    saveHistory(lines, newShapes);
                } else if (e.key === 'Escape') {
                    setSelectedIds([]);
                    setSelectionRect(null);
                }
            } catch (keyError) {
                console.error('Keyboard shortcut error:', keyError);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedIds, history, historyStep, lines, shapes, scale, position]);

    // Expose functions for toolbar
    useEffect(() => {
        window.undoCanvas = undo;
        window.redoCanvas = redo;
        window.clearCanvas = clearCanvas;
        window.zoomIn = zoomIn;
        window.zoomOut = zoomOut;
        window.resetZoom = resetZoom;
    }, [history, historyStep, lines, shapes, scale, position]);

    return (
        <div className="relative w-full h-full bg-white overflow-hidden">
            {/* Grid Background */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(6, 182, 212, 0.15) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
                    `,
                    backgroundSize: `${20 * scale}px ${20 * scale}px`,
                    backgroundPosition: `${position.x}px ${position.y}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: '0 0'
                }}
            />

            {/* Custom Cursor */}
            {showCursor && !['cursor', 'delete', 'hand'].includes(tools) && (
                <div
                    ref={cursorRef}
                    className="pointer-events-none fixed z-50"
                    style={getCursorStyle()}
                />
            )}

            {/* Main Canvas */}
            <Stage
                ref={stageRef}
                className={getStageClass()}
                width={window.innerWidth}
                height={window.innerHeight}
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
                onMouseEnter={() => setShowCursor(true)}
                onMouseLeave={() => setShowCursor(false)}
                draggable={false}
            >
                <Layer ref={layerRef}>
                    {/* Render drawing lines */}
                    {lines.map((line) => (
                        <Line
                            key={line.id}
                            points={line.points}
                            stroke={line.strokeColor}
                            strokeWidth={line.strokeWidth / scale}
                            tension={0.3}
                            lineCap="round"
                            lineJoin="round"
                            globalCompositeOperation={
                                line.tool === 'eraser' ? 'destination-out' : 'source-over'
                            }
                        />
                    ))}

                    {/* Render shapes */}
                    {shapes.map(renderShape)}

                    {/* Selection Rectangle */}
                    {selectionRect && (
                        <Rect
                            ref={selectionRectRef}
                            x={Math.min(selectionRect.x, selectionRect.x + selectionRect.width)}
                            y={Math.min(selectionRect.y, selectionRect.y + selectionRect.height)}
                            width={Math.abs(selectionRect.width)}
                            height={Math.abs(selectionRect.height)}
                            fill="rgba(25, 113, 194, 0.1)"
                            stroke="#1971c2"
                            strokeWidth={1 / scale}
                            dash={[4 / scale, 4 / scale]}
                        />
                    )}

                    {/* Transformer for selected shapes */}
                    {tools === 'cursor' && selectedIds.length > 0 && (
                        <Transformer
                            ref={transformerRef}
                            rotateEnabled={true}
                            resizeEnabled={true}
                            anchorSize={8 / scale}
                            anchorStroke="#1971c2"
                            anchorFill="#ffffff"
                            anchorCornerRadius={2}
                            borderStroke="#1971c2"
                            borderDash={[4 / scale, 4 / scale]}
                            borderStrokeWidth={1 / scale}
                            keepRatio={false}
                            centeredScaling={false}
                            enabledAnchors={selectedIds.length === 1 ? undefined : ['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (newBox.width < 5 || newBox.height < 5 ||
                                    !isFinite(newBox.width) || !isFinite(newBox.height) ||
                                    !isFinite(newBox.x) || !isFinite(newBox.y)) {
                                    return oldBox;
                                }
                                return newBox;
                            }}
                        />
                    )}
                </Layer>
            </Stage>

            {/* Zoom Info */}
            <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 z-50">
                <span className="text-sm font-medium text-gray-700">
                    {Math.round(scale * 100)}%
                </span>
            </div>

            {/* Selection Info */}
            {selectedIds.length > 1 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 z-50">
                    <span className="text-sm font-medium text-gray-700">
                        {selectedIds.length} objects selected
                    </span>
                </div>
            )}
        </div>
    );
};

export default CanvasStage;
