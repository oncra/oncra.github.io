import { ChangeEvent, useRef } from 'react';
import './FileSelector.css'

interface Props {
  acceptedFormat: string,
  fileLoadedCallback: (file: File) => Promise<void>
}

const FileSelector = ({acceptedFormat, fileLoadedCallback} : Props) => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    const inputFile = inputFileRef.current;
    if (inputFile == null) return;
    inputFile.click();
  }

  const handleChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files;
    if (files == null) return;

    const file = files[0];
    await fileLoadedCallback(file);

    const inputFile = inputFileRef.current;
    if (inputFile == null) return;
    inputFile.value = '';
  }

  return (
    <>
      <input className="hiddenFileSelector" 
        type="file" 
        ref={inputFileRef}
        accept={acceptedFormat} 
        onChange={handleChange}/>

      <div className='bigYellowButton'
        onClick={handleClick}>Browse file</div>
    </>
  )
}

export default FileSelector