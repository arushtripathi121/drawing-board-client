import React, { useEffect, useState, useRef } from 'react';
import { HiPencil } from "react-icons/hi2";
import { BsEraser, BsCursor } from "react-icons/bs";
import { IoColorPaletteOutline, IoAdd, IoRemove } from "react-icons/io5";
import { RiDeleteBin6Line, RiRectangleLine } from "react-icons/ri";
import { FaRegHand } from "react-icons/fa6";
import { TbCircle, TbStar, TbArrowRight, TbOval, TbMinus, TbDiamond, TbZoomIn, TbZoomOut, TbZoomReset } from "react-icons/tb";
import { CiUndo, CiRedo } from "react-icons/ci";
import { BiTrash } from "react-icons/bi";
import ShapeMenu from './ShapeMenu';
import ColorSelecterMenu from './ColorSelecterMenu';

const Toolkit = ({ tools, setTools, setStrokeSize, setStrokeColor, strokeColor, strokeSize }) => {
    const [showColorInputWindow, setShowColorInputWindow] = useState(false);
    const [color, setColor] = useState("#1971c2");
    const colorPickerRef = useRef(null);
    const [showShapeMenu, setShowShapeMenu] = useState(false);

    const commonClasses = 'w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md';

    useEffect(() => {
        setStrokeColor(color);
    }, [color, setStrokeColor]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
                setShowColorInputWindow(false);
            }
        };

        if (showColorInputWindow) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showColorInputWindow]);

    const handleToolSelect = (tool) => {
        setTools(tool);
        setShowColorInputWindow(false);
        setShowShapeMenu(false);
    };

    const handleStrokeSizeChange = (newSize) => {
        const size = Math.max(1, Math.min(50, parseInt(newSize) || 1));
        setStrokeSize(size);
    };

    const getButtonClass = (toolName, colors) => {
        return `${commonClasses} ${tools === toolName
            ? `${colors.active} text-white shadow-lg ring-2 ring-opacity-40`
            : `${colors.inactive} text-gray-700 hover:bg-gray-100 border border-gray-200`
        }`;
    };

    return (
        <>
            {/* Main Toolbar */}
            <div className="fixed left-6 top-6 z-50 flex flex-col gap-3">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 backdrop-blur-sm bg-opacity-95">
                    <div className='flex flex-col gap-1 text-lg'>
                        {/* Selection Tool */}
                        <div
                            onClick={() => handleToolSelect("cursor")}
                            className={getButtonClass("cursor", {
                                active: 'bg-blue-500 ring-blue-200',
                                inactive: 'bg-white'
                            })}
                            title="Select (V)"
                        >
                            <BsCursor className="w-4 h-4" />
                        </div>

                        {/* Hand Tool */}
                        <div
                            onClick={() => handleToolSelect("hand")}
                            className={getButtonClass("hand", {
                                active: 'bg-cyan-500 ring-cyan-200',
                                inactive: 'bg-white'
                            })}
                            title="Hand (H)"
                        >
                            <FaRegHand className="w-4 h-4" />
                        </div>

                        {/* Drawing Tools */}
                        <div
                            onClick={() => handleToolSelect("pen")}
                            className={getButtonClass("pen", {
                                active: 'bg-indigo-500 ring-indigo-200',
                                inactive: 'bg-white'
                            })}
                            title="Pen (P)"
                        >
                            <HiPencil className="w-4 h-4" />
                        </div>

                        <div
                            onClick={() => handleToolSelect("eraser")}
                            className={getButtonClass("eraser", {
                                active: 'bg-red-500 ring-red-200',
                                inactive: 'bg-white'
                            })}
                            title="Eraser (E)"
                        >
                            <BsEraser className="w-4 h-4" />
                        </div>

                        <div className="w-full h-px bg-gray-200 my-1" />

                        {/* Shape Tools */}
                        <div
                            onClick={() => handleToolSelect("Rect")}
                            className={getButtonClass("Rect", {
                                active: 'bg-green-500 ring-green-200',
                                inactive: 'bg-white'
                            })}
                            title="Rectangle (R)"
                        >
                            <RiRectangleLine className="w-4 h-4" />
                        </div>

                        <div
                            onClick={() => handleToolSelect("Circle")}
                            className={getButtonClass("Circle", {
                                active: 'bg-purple-500 ring-purple-200',
                                inactive: 'bg-white'
                            })}
                            title="Circle (C)"
                        >
                            <TbCircle className="w-4 h-4" />
                        </div>

                        <div
                            onClick={() => handleToolSelect("Arrow")}
                            className={getButtonClass("Arrow", {
                                active: 'bg-orange-500 ring-orange-200',
                                inactive: 'bg-white'
                            })}
                            title="Arrow (A)"
                        >
                            <TbArrowRight className="w-4 h-4" />
                        </div>

                        <div
                            onClick={() => handleToolSelect("Line")}
                            className={getButtonClass("Line", {
                                active: 'bg-gray-600 ring-gray-300',
                                inactive: 'bg-white'
                            })}
                            title="Line (L)"
                        >
                            <TbMinus className="w-4 h-4" />
                        </div>

                        <div className="relative">
                            <div
                                onClick={() => setShowShapeMenu(!showShapeMenu)}
                                className={getButtonClass("shapes", {
                                    active: 'bg-yellow-500 ring-yellow-200',
                                    inactive: 'bg-white'
                                })}
                                title="More Shapes"
                            >
                                <TbDiamond className="w-4 h-4" />
                            </div>

                            {showShapeMenu && (
                                <div className="absolute left-full top-0 ml-2 z-50">
                                    <ShapeMenu onSelect={handleToolSelect} currentTool={tools} />
                                </div>
                            )}
                        </div>

                        <div className="w-full h-px bg-gray-200 my-1" />

                        {/* Delete Tool */}
                        <div
                            onClick={() => handleToolSelect("delete")}
                            className={getButtonClass("delete", {
                                active: 'bg-red-600 ring-red-200',
                                inactive: 'bg-white'
                            })}
                            title="Delete (X)"
                        >
                            <RiDeleteBin6Line className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* History Controls */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 backdrop-blur-sm bg-opacity-95">
                    <div className='flex flex-col gap-1 text-lg'>
                        <button
                            onClick={() => window.undoCanvas && window.undoCanvas()}
                            className="w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                            title="Undo (Ctrl+Z)"
                        >
                            <CiUndo className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => window.redoCanvas && window.redoCanvas()}
                            className="w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                            title="Redo (Ctrl+Y)"
                        >
                            <CiRedo className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => window.clearCanvas && window.clearCanvas()}
                            className="w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                            title="Clear All"
                        >
                            <BiTrash className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 backdrop-blur-sm bg-opacity-95">
                    <div className='flex flex-col gap-1 text-lg'>
                        <button
                            onClick={() => window.zoomIn && window.zoomIn()}
                            className="w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                            title="Zoom In (Ctrl++)"
                        >
                            <TbZoomIn className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => window.zoomOut && window.zoomOut()}
                            className="w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                            title="Zoom Out (Ctrl+-)"
                        >
                            <TbZoomOut className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => window.resetZoom && window.resetZoom()}
                            className="w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                            title="Reset Zoom (Ctrl+0)"
                        >
                            <TbZoomReset className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Properties Panel */}
            <div className="fixed right-6 top-6 z-50 flex flex-col gap-3">
                {/* Color Panel */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 backdrop-blur-sm bg-opacity-95">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Color
                    </div>
                    <div className="relative">
                        <div
                            className={`w-10 h-10 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md border-2 ${showColorInputWindow
                                ? 'border-blue-400 ring-2 ring-blue-100'
                                : 'border-gray-200'
                            }`}
                            onClick={() => setShowColorInputWindow(!showColorInputWindow)}
                            style={{ backgroundColor: strokeColor }}
                        />

                        {showColorInputWindow && (
                            <div className="absolute top-full right-0 mt-2 z-50">
                                <ColorSelecterMenu colorPickerRef={colorPickerRef} color={color} setColor={setColor} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Stroke Size Panel */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 backdrop-blur-sm bg-opacity-95">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Stroke Width
                    </div>
                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            <button
                                onClick={() => handleStrokeSizeChange(strokeSize - 1)}
                                disabled={strokeSize <= 1}
                                className='w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 cursor-pointer text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                <IoRemove className="w-3 h-3" />
                            </button>

                            <input
                                value={strokeSize}
                                onChange={(e) => handleStrokeSizeChange(e.target.value)}
                                className="w-12 h-7 text-xs font-semibold rounded-lg text-center border border-gray-200 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                                min="1"
                                max="50"
                            />

                            <button
                                onClick={() => handleStrokeSizeChange(strokeSize + 1)}
                                disabled={strokeSize >= 50}
                                className='w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 cursor-pointer text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                <IoAdd className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Stroke preview */}
                        <div className="flex justify-center py-2">
                            <div 
                                className="rounded-full"
                                style={{ 
                                    width: `${Math.max(strokeSize, 2)}px`, 
                                    height: `${Math.max(strokeSize, 2)}px`, 
                                    backgroundColor: strokeColor 
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Toolkit;
