import { useState, useEffect } from 'react';
import Comments from './Comments';

interface Picture {
  pictureId: string;
  mediaUrl: string;
  mediaType: string;
  shareToken: string;
  createdAt: string;
  requiredGameId: number | null;
  maxUnlocks: number;
  currentUnlocks: number;
  expiresAt: string | null;
}

export default function MyPictures() {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPicture, setExpandedPicture] = useState<string | null>(null);

  useEffect(() => {
    loadPictures();
  }, []);

  const loadPictures = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/pictures/my-pictures', {
        credentials: 'include',
      });
      const data = await response.json();
      setPictures(data.pictures || []);
    } catch (error) {
      console.error('Error loading pictures:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = (shareToken: string) => {
    const link = `${window.location.origin}/unlock/${shareToken}`;
    navigator.clipboard.writeText(link);
    alert('Share link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (pictures.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't uploaded any pictures yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pictures.map((picture) => (
        <div
          key={picture.pictureId}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Picture Header */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-500">
                  Uploaded on {new Date(picture.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Unlocks: {picture.currentUnlocks}
                  {picture.maxUnlocks > 0 && ` / ${picture.maxUnlocks}`}
                </p>
              </div>
              <button
                onClick={() => copyShareLink(picture.shareToken)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                📋 Copy Link
              </button>
            </div>

            {/* Picture Preview */}
            <div className="relative rounded overflow-hidden bg-gray-100 mb-2">
              <img
                src={picture.mediaUrl}
                alt="Uploaded picture"
                className="w-full max-h-64 object-contain"
              />
            </div>

            {/* Toggle Comments Button */}
            <button
              onClick={() =>
                setExpandedPicture(
                  expandedPicture === picture.pictureId ? null : picture.pictureId
                )
              }
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {expandedPicture === picture.pictureId ? '▼' : '▶'} View Comments
            </button>
          </div>

          {/* Comments Section */}
          {expandedPicture === picture.pictureId && (
            <div className="px-4 pb-4 border-t bg-gray-50">
              <Comments pictureId={picture.pictureId} isOwner={true} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
