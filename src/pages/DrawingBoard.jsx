import React, { useState } from 'react'

import Toolkit from '../components/Toolkit';
import CanavasStage from '../components/CanavasStage';

const DrawingBoard = () => {

    const [tools, setTools] = useState("pen");
    const [strokeSize, setStrokeSize] = useState(5);
    const [strokeColor, setStrokeColor] = useState("#000");


    return (
        <div className='w-screen h-screen overflow-hidden relative'>
            <Toolkit tools={tools} setTools={setTools} setStrokeSize={setStrokeSize} setStrokeColor={setStrokeColor} strokeColor={strokeColor} strokeSize={strokeSize} />
            <CanavasStage tools={tools} strokeSize={strokeSize} strokeColor={strokeColor} />
        </div>
    )
}

export default DrawingBoard
