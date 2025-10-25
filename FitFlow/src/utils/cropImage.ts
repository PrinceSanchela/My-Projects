export const getCroppedImg = (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  outputFileName = "croppedImage.jpg",
  scale = 2 // for retina / high-res
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous"; // avoid CORS issues

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width * scale;
      canvas.height = pixelCrop.height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context not found");

      // Improve image quality for scaled canvas
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width * scale,
        pixelCrop.height * scale
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject("Canvas is empty");
          const file = new File([blob], outputFileName, { type: "image/jpeg" });
          resolve(file);
        },
        "image/jpeg",
        0.9 // quality 0.9 for jpeg
      );
    };

    image.onerror = (error) => reject(error);
  });
};
