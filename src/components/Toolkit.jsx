import React, { useEffect, useState, useRef } from 'react';
import { HiPencil } from "react-icons/hi2";
import { BsEraser } from "react-icons/bs"; // Better eraser icon
import { IoColorPaletteOutline, IoAdd, IoRemove } from "react-icons/io5";
import { HexColorPicker, HexColorInput } from 'react-colorful';

const Toolkit = ({ tools, setTools, setStrokeSize, setStrokeColor, strokeColor, strokeSize }) => {
    const [showColorInputWindow, setShowColorInputWindow] = useState(false);
    const [color, setColor] = useState("#3B82F6");
    const colorPickerRef = useRef(null);

    const commonClasses = 'w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95';

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
    };

    const handleStrokeSizeChange = (newSize) => {
        const size = Math.max(1, Math.min(99, parseInt(newSize) || 1));
        setStrokeSize(size);
    };

    return (
        <div className="fixed left-1/2 -translate-x-1/2 z-10 top-6 flex flex-col items-center">
            <div className="shadow-2xl bg-gradient-to-br from-white via-gray-50 to-slate-100 p-5 rounded-3xl border border-white/80 backdrop-blur-xl">
                <div className='flex flex-row items-center gap-3 text-xl'>
                    <div
                        onClick={() => handleToolSelect("pen")}
                        className={`${commonClasses} ${tools === "pen"
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-200'
                            : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-100'
                            }`}
                    >
                        <HiPencil className="w-5 h-5" />
                    </div>

                    <div
                        onClick={() => handleToolSelect("eraser")}
                        className={`${commonClasses} ${tools === "eraser"
                            ? 'bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-lg shadow-red-500/40 ring-2 ring-red-200'
                            : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-100'
                            }`}
                    >
                        <BsEraser className="w-5 h-5" />
                    </div>

                    <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-1" />

                    <div className="relative">
                        <div
                            className={`${commonClasses} ${showColorInputWindow
                                ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/40 ring-2 ring-purple-200'
                                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-100'
                                } relative overflow-hidden`}
                            onClick={() => setShowColorInputWindow(!showColorInputWindow)}
                        >
                            <IoColorPaletteOutline className="w-5 h-5" />
                            <div
                                className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full border border-white shadow-sm ring-1 ring-black/10"
                                style={{ backgroundColor: strokeColor }}
                            />
                        </div>
                    </div>

                    <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-1" />

                    <div className='flex flex-row items-center gap-2 bg-white/80 rounded-2xl p-2 shadow-inner border border-gray-100'>
                        <button
                            onClick={() => handleStrokeSizeChange(strokeSize - 1)}
                            disabled={strokeSize <= 1}
                            className='w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-100'
                        >
                            <IoRemove className="w-3 h-3" />
                        </button>

                        <div className="relative">
                            <input
                                value={strokeSize}
                                onChange={(e) => handleStrokeSizeChange(e.target.value)}
                                className="w-14 h-8 text-sm font-semibold rounded-xl text-center border border-gray-200 bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100/50 transition-all shadow-sm"
                                min="1"
                                max="99"
                            />
                        </div>

                        <button
                            onClick={() => handleStrokeSizeChange(strokeSize + 1)}
                            disabled={strokeSize >= 99}
                            className='w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-100'
                        >
                            <IoAdd className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {showColorInputWindow && (
                <div
                    ref={colorPickerRef}
                    className="absolute top-20 flex flex-col items-center gap-4 p-6 bg-white/95 rounded-3xl shadow-2xl border border-white/50 backdrop-blur-xl z-30 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                    <div className="relative">
                        <div className="p-2 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-inner">
                            <HexColorPicker
                                color={color}
                                onChange={setColor}
                                style={{ width: '180px', height: '180px' }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 w-full">
                        <HexColorInput
                            color={color}
                            onChange={setColor}
                            prefixed
                            className="px-4 py-2.5 text-sm font-mono w-28 border border-gray-200 rounded-xl text-center focus:border-blue-400 focus:ring-2 focus:ring-blue-100/50 outline-none transition-all bg-white shadow-sm"
                        />

                        <div className="flex gap-2 p-2 bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-inner">
                            {[
                                { color: '#000000', name: 'Black' },
                                { color: '#3B82F6', name: 'Blue' },
                                { color: '#EF4444', name: 'Red' },
                                { color: '#10B981', name: 'Green' },
                                { color: '#F59E0B', name: 'Yellow' },
                                { color: '#8B5CF6', name: 'Purple' }
                            ].map(({ color: presetColor, name }) => (
                                <button
                                    key={presetColor}
                                    onClick={() => setColor(presetColor)}
                                    title={name}
                                    className={`w-7 h-7 rounded-xl border-2 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm ${color.toLowerCase() === presetColor.toLowerCase()
                                        ? 'border-gray-800 ring-2 ring-gray-300'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    style={{ backgroundColor: presetColor }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Toolkit;
