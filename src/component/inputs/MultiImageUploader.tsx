import Image from "next/image";
import React, { useState } from "react";
import { FiTrash } from "react-icons/fi";

interface ImageInterface {
  path: string | File;
}

interface ImageUploaderProps {
  images?: ImageInterface[];
  updateList: (updatedImages: ImageInterface[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images = [{ path: "/images/products/expire-product-01.2a163a06.png" }],
  updateList,
}) => {
  const [imageList, setImageList] = useState<ImageInterface[]>(images);

  const handleRemove = (index: number) => {
    const updatedList = [...imageList];
    updatedList.splice(index, 1);
    setImageList(updatedList);
    updateList(updatedList);
  };

  const handleAddNewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/svg+xml",
        "image/gif",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(
          "Unsupported file type. Please upload an image (PNG, JPEG, GIF) or SVG file."
        );
        return;
      }

      const updatedList = [...imageList, { path: file }];
      setImageList(updatedList);
      updateList(updatedList);
    }
  };

  const getPreviewUrl = (path: string | File) => {
    if (path instanceof File) {
      return URL.createObjectURL(path);
    }
    return path;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Upload Box */}
      <div className="w-[120px] h-[120px] rounded-md border border-gray-200 flex justify-center items-center cursor-pointer">
        <label
          htmlFor="upload"
          className="w-full h-full flex justify-center items-center cursor-pointer"
        >
          <input
            id="upload"
            type="file"
            hidden
            onChange={handleAddNewImage}
            accept="image/*,image/svg+xml"
          />
          <p>Upload</p>
        </label>
      </div>

      {/* Image Previews */}
      {imageList.map((item, index) => (
        <div
          key={index}
          className="w-[120px] h-[120px] rounded-md border border-gray-200 overflow-hidden relative"
        >
          <Image src={getPreviewUrl(item.path) || null} alt="Uploaded" className="w-full h-full object-cover rounded-md" width={500} height={500} />
          <button
            onClick={() => handleRemove(index)}
            className="absolute top-1 right-1 text-red-500 cursor-pointer bg-white rounded-full p-1"
          >
            <FiTrash />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImageUploader;
