import { useFileUrl } from '../hooks/useImageUrl';

function ImageFromServer({ filePath }: { filePath: string }) {
  const { fileUrl } = useFileUrl({ filePath });

  return fileUrl ? <img src={fileUrl} alt="Image" /> : <p>Loading...</p>;
}

export default ImageFromServer;
