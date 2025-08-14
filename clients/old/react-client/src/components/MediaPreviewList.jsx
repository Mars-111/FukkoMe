import React from 'react';
import { useAppContext } from '../AppContext';

function FilePreviewList() {
  const { getSelectedFiles, removeSelectedFile } = useAppContext();
  const files = getSelectedFiles();

  function isImage(file) {
    return file.type.startsWith('image/');
  }

  return (
    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {files.map((file, index) => (
        <div
          key={index}
          style={{
            width: '100px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {isImage(file) ? (
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '6px',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '80px',
                backgroundColor: '#ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            >
              {file.name}
            </div>
          )}
          <button
            onClick={() => removeSelectedFile(index)}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              width: '20px',
              height: '20px',
            }}
            title="Удалить"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default FilePreviewList;
