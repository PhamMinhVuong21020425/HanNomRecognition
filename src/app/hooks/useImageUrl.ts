import axios from '@/lib/axios';
import { useState, useEffect } from 'react';

interface UseFileUrlProps {
  filePath: string;
  download?: boolean;
}

export const useFileUrl = ({ filePath, download = false }: UseFileUrlProps) => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const endpoint = download ? '/be/files/download' : '/be/files/view';

        const response = await axios.post(
          endpoint,
          {
            filePath,
          },
          {
            responseType: 'blob',
          }
        );

        const objectUrl = URL.createObjectURL(response.data);
        setFileUrl(objectUrl);
        setError('');

        if (download) {
          const filename = filePath.split('/').pop() || 'download';
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.error('Error fetching image:', err);
        setError(err instanceof Error ? err.message : 'Failed to load image');
      }
    };

    if (filePath) {
      fetchFile();
    }

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, []);

  return { fileUrl, error };
};
