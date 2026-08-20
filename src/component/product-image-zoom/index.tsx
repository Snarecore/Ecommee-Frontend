import Image from "next/image";
import React, { useRef, useState } from "react";

interface ProductImageZoomProps {
	imageSrc: string;
	imageAlt?: string;
	containerClassName?: string;
	zoomScale?: number;
}

const ProductImageZoom: React.FC<ProductImageZoomProps> = ({
	imageSrc,
	imageAlt = "",
	containerClassName = "",
	zoomScale = 1.8
}) => {
	const imageContainerRef = useRef<HTMLDivElement>(null);
	const [imageTransformOrigin, setImageTransformOrigin] = useState("center center");
	const [isZoomed, setIsZoomed] = useState(false);
	
	const scaleValue = zoomScale > 0 ? zoomScale : 1.8;

	const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const rect = imageContainerRef.current?.getBoundingClientRect();
		if (!rect) return;

		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		const xPercent = (x / rect.width) * 100;
		const yPercent = (y / rect.height) * 100;

		setImageTransformOrigin(`${xPercent}% ${yPercent}%`);
	};

	const resetZoom = () => {
		setIsZoomed(false);
		setImageTransformOrigin("center center");
	};

	return (
		<div
			ref={imageContainerRef}
			onMouseEnter={() => setIsZoomed(true)}
			onMouseLeave={resetZoom}
			onMouseMove={handleMouseMove}
			className={`relative overflow-hidden ${containerClassName}`}
			style={{ cursor: "zoom-in" }}
		>
			<Image 
				src={imageSrc || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} 
				alt={imageAlt} 
				className="transition-transform duration-100 ease-out object-cover w-full h-full" 
				width={800} 
				height={800} 
				style={{ 
					transformOrigin: imageTransformOrigin, 
					transform: isZoomed ? `scale(${scaleValue})` : "scale(1)" 
				}} 
			/>
		</div>
	);
};

export default ProductImageZoom;
