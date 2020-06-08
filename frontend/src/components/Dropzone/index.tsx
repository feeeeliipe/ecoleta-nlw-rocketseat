import React, { useCallback, useState } from 'react'
import {useDropzone} from 'react-dropzone'
import './styles.css';
import { FiUpload } from 'react-icons/fi'

interface Props {
    onFileUploaded: (file: File) => void; 
}

const  Dropzone: React.FC<Props> = ({ onFileUploaded }) => {
  
  const [selectedFileUrl, setSelectedFileUrl] = useState(''); 
  
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    const fileURL = URL.createObjectURL(file);
    setSelectedFileUrl(fileURL);
    onFileUploaded(file);
  }, [onFileUploaded]);
  
  const {getRootProps, getInputProps} = useDropzone({
      onDrop,
      accept: 'image/*'
    })

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />
      
      { selectedFileUrl 
        ? <img src={selectedFileUrl} alt="PointImage" /> 
        : (
                <p>
                    <FiUpload />
                    Arraste uma imagem aqui ou clique para selecionar
                </p>
            )
        }
    </div>
  )
}

export default Dropzone;