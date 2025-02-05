import { useState, useRef, useCallback, useEffect } from "react";

const CANVAS_SIZE = 400; // 固定 Canvas 尺寸

export const useCanvas = (
    opacity: number, // 渐变不透明度
    position: "Below" | "Above" | "Left" | "Right", // 镜像方向
    offset: number,  // 镜像图相对于原中心的偏移量
    scaleFactor: number // 缩放因子
) => {
    const [image, setImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    // 处理图片上传，将文件转换为 DataURL
    const handleImageUpload = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    // 绘制镜像图，并添加对应方向的渐变效果
    const drawFlippedImage = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const img = imgRef.current;
        if (canvas && ctx && img) {
            const imgWidth = img.width;
            const imgHeight = img.height;
            // 计算等比例缩放，并应用 scaleFactor 参数
            const scale = Math.min(CANVAS_SIZE / imgWidth, CANVAS_SIZE / imgHeight) * scaleFactor;
            const drawWidth = imgWidth * scale;
            const drawHeight = imgHeight * scale;

            // 设置画布为正方形
            canvas.width = CANVAS_SIZE;
            canvas.height = CANVAS_SIZE;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制镜像图
            ctx.save();
            // 将坐标系原点移至画布中心
            ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
            // 根据 position 进行翻转与偏移
            switch (position) {
                case "Below":
                    // 垂直翻转：scale(1, -1)，由于翻转后 y 轴反向，为使镜像图向下偏移 offset，需要 translate(0, -offset)
                    ctx.scale(1, -1);
                    break;
                case "Above":
                    ctx.scale(1, -1);
                    // ctx.translate(0, offset);
                    break;
                case "Left":
                    ctx.scale(-1, 1);
                    // ctx.translate(-offset, 0);
                    break;
                case "Right":
                    ctx.scale(-1, 1);
                    // ctx.translate(offset, 0);
                    break;
            }
            // 绘制图片，使其中心与当前坐标原点对齐
            ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            ctx.restore();

            // 绘制渐变效果，根据镜像方向确定渐变的起止位置
            let gradient;
            ctx.save();
            switch (position) {
                case "Below":
                    // 渐变区域从镜像图下边缘向下延伸 offset 像素
                    // 镜像图下边缘的 y 坐标为：(CANVAS_SIZE/2 + drawHeight/2 - offset)（因为翻转后图像上移了 offset）
                    gradient = ctx.createLinearGradient(
                        0,
                        CANVAS_SIZE / 2 + drawHeight / 2 - offset,
                        0,
                        CANVAS_SIZE / 2 + drawHeight / 2
                    );
                    // 填充整个画布宽度对应渐变区域
                    ctx.fillStyle = gradient;
                    gradient.addColorStop(0, "rgba(255,255,255,0)");
                    gradient.addColorStop(1, `rgba(255,255,255,${opacity})`);
                    ctx.fillRect(0, CANVAS_SIZE / 2 + drawHeight / 2 - offset, CANVAS_SIZE, offset);
                    break;
                case "Above":
                    // 渐变区域从镜像图上边缘向上延伸 offset 像素
                    gradient = ctx.createLinearGradient(
                        0,
                        CANVAS_SIZE / 2 - drawHeight / 2,
                        0,
                        CANVAS_SIZE / 2 - drawHeight / 2 + offset
                    );
                    ctx.fillStyle = gradient;
                    gradient.addColorStop(0, `rgba(255,255,255,${opacity})`);
                    gradient.addColorStop(1, "rgba(255,255,255,0)");
                    ctx.fillRect(0, CANVAS_SIZE / 2 - drawHeight / 2, CANVAS_SIZE, offset);
                    break;
                case "Left":
                    // 渐变区域从镜像图左边缘向左延伸 offset 像素
                    gradient = ctx.createLinearGradient(
                        CANVAS_SIZE / 2 - drawWidth / 2,
                        0,
                        CANVAS_SIZE / 2 - drawWidth / 2 + offset,
                        0
                    );
                    ctx.fillStyle = gradient;
                    gradient.addColorStop(0, `rgba(255,255,255,${opacity})`);
                    gradient.addColorStop(1, "rgba(255,255,255,0)");
                    ctx.fillRect(CANVAS_SIZE / 2 - drawWidth / 2, 0, offset, CANVAS_SIZE);
                    break;
                case "Right":
                    // 渐变区域从镜像图右边缘向右延伸 offset 像素
                    gradient = ctx.createLinearGradient(
                        CANVAS_SIZE / 2 + drawWidth / 2 - offset,
                        0,
                        CANVAS_SIZE / 2 + drawWidth / 2,
                        0
                    );
                    ctx.fillStyle = gradient;
                    gradient.addColorStop(0, "rgba(255,255,255,0)");
                    gradient.addColorStop(1, `rgba(255,255,255,${opacity})`);
                    ctx.fillRect(CANVAS_SIZE / 2 + drawWidth / 2 - offset, 0, offset, CANVAS_SIZE);
                    break;
            }
            ctx.restore();
        }
    }, [opacity, position, offset, scaleFactor]);

    // 生成图片并下载
    const handleDownload = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "flipped-image.png";
            link.click();
        }
    }, []);

    useEffect(() => {
        if (image) {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                imgRef.current = img;
                drawFlippedImage();
            };
        }
    }, [image, drawFlippedImage]);

    return {
        canvasRef,
        drawFlippedImage,
        handleImageUpload,
        handleDownload,
    };
};
