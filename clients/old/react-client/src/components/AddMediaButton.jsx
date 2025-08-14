import React, { useRef, useState } from 'react';
import { useAppContext } from '../AppContext';

function AddFileButton() {
  const fileInputRef = useRef(null);
  const { addSelectedFiles } = useAppContext();
  const [isDragging, setIsDragging] = useState(false);

  function onFilesSelected(e) {
    addSelectedFiles(e.target.files);
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addSelectedFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }

  function onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={onFilesSelected}
      />
      <button onClick={() => fileInputRef.current.click()}>
        Добавить медиа
      </button>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          marginTop: '10px',
          padding: '20px',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          backgroundColor: isDragging ? '#e0f7fa' : '#fafafa',
          textAlign: 'center',
          color: '#555',
        }}
      >
        {isDragging ? 'Отпустите файлы здесь' : 'Перетащите файлы сюда'}
      </div>
    </div>
  );
}

export default AddFileButton;
