import React, { useState, useEffect } from "react";
import { Upload, Tabs, Slider, Button, Typography } from "antd";
import { UploadOutlined, DownloadOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { useCanvas } from "./hooks/useCanvas";
import "./App.css";

const { Title } = Typography;

const App: React.FC = () => {
    const [opacity, setOpacity] = useState<number>(0.47);
    const [position, setPosition] = useState<"Below" | "Above" | "Left" | "Right">("Below");
    const [offset, setOffset] = useState<number>(61);
    const [scaleFactor, setScaleFactor] = useState<number>(1); // 图片缩放比例

    const { canvasRef, drawFlippedImage, handleImageUpload, handleDownload } =
        useCanvas(opacity, position, offset, scaleFactor);

    // 监听 `position`，点击 `Tab` 立刻更新镜像
    useEffect(() => {
        drawFlippedImage();
    }, [position, scaleFactor, opacity, offset]);

    const handlePositionChange = (key: string) => {
        setPosition(key as "Below" | "Above" | "Left" | "Right");
    };

    const zoomIn = () => {
        if (scaleFactor < 3) setScaleFactor((prev) => prev + 0.2);
    };

    const zoomOut = () => {
        if (scaleFactor > 0.5) setScaleFactor((prev) => prev - 0.2);
    };

    return (
        <div className="App">
            <Title level={2}>Mirror Flip Tool</Title>
            <Upload  beforeUpload={(file) => { handleImageUpload(file); return false; }} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>

            <div className="canvas-container">
                <Button icon={<MinusOutlined />} onClick={zoomOut} />
                <canvas ref={canvasRef} className="canvas" width={400} height={400} />
                <Button icon={<PlusOutlined />} onClick={zoomIn} />
            </div>

            <div className="controls">
                <Title level={5}>Select Position</Title>
                <Tabs defaultActiveKey="Below" onChange={handlePositionChange}>
                    <Tabs.TabPane tab="Below" key="Below" />
                    <Tabs.TabPane tab="Above" key="Above" />
                    <Tabs.TabPane tab="Left" key="Left" />
                    <Tabs.TabPane tab="Right" key="Right" />
                </Tabs>

                <Title level={5}>Offset Adjustment</Title>
                <Slider min={0} max={100} value={offset} onChange={setOffset} tooltip={{ open: true }} />

                <Title level={5}>Opacity Adjustment</Title>
                <Slider min={0} max={1} step={0.05} value={opacity} onChange={setOpacity} tooltip={{ open: true }} />

                <Button type="primary" onClick={drawFlippedImage}>Generate Mirror</Button>
                <Button type="default" icon={<DownloadOutlined />} onClick={handleDownload}>Download Image</Button>
            </div>
        </div>
    );
};

export default App;