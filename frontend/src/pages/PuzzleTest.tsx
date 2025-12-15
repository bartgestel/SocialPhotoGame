import { useState } from 'react';

interface Tile {
  index: number;
  row: number;
  col: number;
  data: string;
}

interface PuzzleData {
  pictureId: string;
  gridSize: number;
  totalPieces: number;
  imageWidth: number;
  imageHeight: number;
  tileWidth: number;
  tileHeight: number;
  tiles: Tile[];
}

export default function PuzzleTest() {
  const [pictureId, setPictureId] = useState('');
  const [gridSize, setGridSize] = useState(3);
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPuzzle = async () => {
    if (!pictureId.trim()) {
      setError('Please enter a picture ID');
      return;
    }

    setLoading(true);
    setError('');
    setPuzzleData(null);

    try {
      const response = await fetch(
        `http://localhost:3000/api/pictures/${pictureId}/pieces?gridSize=${gridSize}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load puzzle');
      }

      const data = await response.json();
      setPuzzleData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load puzzle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#333', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      padding: '20px',
      fontFamily: 'sans-serif',
      color: '#fff'
    }}>
      <h1>Puzzle Slice Test</h1>
      
      <div style={{ 
        backgroundColor: '#444', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minWidth: '400px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Picture ID:
          </label>
          <input
            type="text"
            value={pictureId}
            onChange={(e) => setPictureId(e.target.value)}
            placeholder="Enter picture ID"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #666',
              backgroundColor: '#555',
              color: '#fff'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Grid Size: {gridSize}x{gridSize}
          </label>
          <input
            type="range"
            min="2"
            max="10"
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <button
          onClick={loadPuzzle}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#666' : '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Loading...' : 'Load Puzzle'}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#d32f2f',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      {puzzleData && (
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <div style={{ 
            backgroundColor: '#444', 
            padding: '10px', 
            borderRadius: '8px',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            <p>Image: {puzzleData.imageWidth}x{puzzleData.imageHeight}px</p>
            <p>Tiles: {puzzleData.gridSize}x{puzzleData.gridSize} ({puzzleData.totalPieces} pieces)</p>
            <p>Tile Size: {puzzleData.tileWidth}x{puzzleData.tileHeight}px</p>
          </div>

          <div
            id="puzzle-board"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${puzzleData.gridSize}, 1fr)`,
              gap: '2px',
              background: '#000',
              padding: '2px',
              border: '2px solid #fff',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            {puzzleData.tiles.map((tile) => (
              <img
                key={tile.index}
                src={`data:image/jpeg;base64,${tile.data}`}
                alt={`Tile ${tile.index}`}
                title={`Tile Index: ${tile.index} (Row: ${tile.row}, Col: ${tile.col})`}
                style={{
                  width: '100%',
                  display: 'block',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = '1';
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
