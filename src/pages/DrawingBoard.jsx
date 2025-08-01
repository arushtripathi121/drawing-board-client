import React, { useState } from 'react'
import Toolkit from '../components/Toolkit';
import CanvasStage from '../components/CanvasStage';

const DrawingBoard = () => {
    const [tools, setTools] = useState("cursor");
    const [strokeSize, setStrokeSize] = useState(2);
    const [strokeColor, setStrokeColor] = useState("#1971c2");

    return (
        <div className='w-screen h-screen overflow-hidden relative bg-gray-50'>
            <Toolkit
                tools={tools}
                setTools={setTools}
                setStrokeSize={setStrokeSize}
                setStrokeColor={setStrokeColor}
                strokeColor={strokeColor}
                strokeSize={strokeSize}
            />
            <CanvasStage
                tools={tools}
                strokeSize={strokeSize}
                strokeColor={strokeColor}
            />
        </div>
    )
}

export default DrawingBoard;
