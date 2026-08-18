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
	// zoomScale = 0
}) => {
	const imageContainerRef = useRef<HTMLDivElement>(null);
	// @ts-ignore
	const [imageTransform, setImageTransform] = useState("translate(0px, 0px) scale(1)");
	const [isZoomed, setIsZoomed] = useState(false);
	
	// @ts-ignore
	const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		// const rect = imageContainerRef.current?.getBoundingClientRect();
		// if (!rect) return;

		// const x = event.clientX - rect.left;
		// const y = event.clientY - rect.top;

		// const offsetX = ((x / rect.width) * 100).toFixed(2);
		// const offsetY = ((y / rect.height) * 100).toFixed(2);

		// setImageTransform(`translate(-${offsetX}%, -${offsetY}%) scale(${zoomScale})`);
	};

	const resetZoom = () => {
		// setIsZoomed(false);
		// setImageTransform("translate(0px, 0px) scale(1)");
	};

	return (
		<div
			ref={imageContainerRef}
			onMouseEnter={() => setIsZoomed(true)}
			onMouseLeave={resetZoom}
			onMouseMove={handleMouseMove}
			className={`relative overflow-hidden w-full h-full ${containerClassName}`}
			// style={{ cursor: "zoom-in" }}
		>
			<Image src={imageSrc || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt={imageAlt} className="transition-transform duration-200 ease-out object-cover w-full h-full" width={500} height={500} style={{ transformOrigin: "top left", transform: isZoomed ? imageTransform : "scale(1)" }} />
		</div>
	);
};

export default ProductImageZoom;
