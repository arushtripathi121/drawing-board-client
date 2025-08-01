import React from 'react';
import { FaCircle, FaSquare, FaStar, FaArrowRight, FaEllipsisH, FaMinus } from 'react-icons/fa';
import { TbDiamond } from "react-icons/tb";

const shapeIcons = {
    Rect: <FaSquare className="text-green-500" />,
    Circle: <FaCircle className="text-blue-500" />,
    Arrow: <FaArrowRight className="text-orange-500" />,
    Star: <FaStar className="text-yellow-500" />,
    Ellipse: <FaEllipsisH className="text-purple-500" />,
    Line: <FaMinus className="text-gray-600" />,
    Diamond: <TbDiamond className="text-pink-500" />
};

const ShapeMenu = ({ onSelect, currentTool }) => {
    const options = Object.keys(shapeIcons);

    return (
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[140px]">
            <div className="text-xs font-semibold text-gray-500 px-2 py-1 uppercase tracking-wide">
                Shapes
            </div>
            {options.map((shape) => (
                <div
                    key={shape}
                    onClick={() => onSelect(shape)}
                    className={`flex items-center gap-3 px-2 py-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-all duration-200 group ${currentTool === shape ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                >
                    <div className="w-4 h-4 flex items-center justify-center">
                        {shapeIcons[shape]}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {shape}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default ShapeMenu;
