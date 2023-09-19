import { ChangeEvent, useRef } from 'react';
import './FileSelector.css'

interface Props {
  acceptedFormat: string,
  fileLoadedCallback: (file: File) => Promise<void>
}

const FileSelector = ({acceptedFormat, fileLoadedCallback} : Props) => {
  const inputFile = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (inputFile.current == null) return;
    inputFile.current.click();
  }

  const handleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files;
    if (files == null) return;

    const file = files[0];
    await fileLoadedCallback(file);
  }

  return (
    <>
      <input className="hiddenFileSelector" 
        type="file" 
        ref={inputFile}
        accept={acceptedFormat} 
        onChange={handleChange}/>

      <div className='bigYellowButton'
        onClick={handleClick}>Browse file</div>
    </>
  )
}

export default FileSelector