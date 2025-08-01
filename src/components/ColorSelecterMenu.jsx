import React from 'react'
import { HexColorPicker, HexColorInput } from 'react-colorful';

const ColorSelecterMenu = ({ colorPickerRef, color, setColor }) => {
    const presetColors = [
        '#000000', '#FFFFFF', '#1971c2', '#e03131', '#2f9e44', '#f59f00',
        '#9c36b5', '#fd7e14', '#495057', '#20c997', '#e64980', '#74c0fc'
    ];

    return (
        <div
            ref={colorPickerRef}
            className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 min-w-[240px] backdrop-blur-sm bg-opacity-95"
        >
            <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                Color Picker
            </div>

            <div className="mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                    <HexColorPicker
                        color={color}
                        onChange={setColor}
                        style={{ width: '200px', height: '120px' }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
                <HexColorInput
                    color={color}
                    onChange={setColor}
                    prefixed
                    className="px-3 py-2 text-sm font-mono w-full border border-gray-200 rounded-lg text-center focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                />

                <div className="grid grid-cols-6 gap-2">
                    {presetColors.map((presetColor) => (
                        <button
                            key={presetColor}
                            onClick={() => setColor(presetColor)}
                            className={`w-8 h-8 rounded-lg border-2 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer ${color.toLowerCase() === presetColor.toLowerCase()
                                    ? 'border-gray-800 ring-2 ring-gray-300'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            style={{ backgroundColor: presetColor }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ColorSelecterMenu;
