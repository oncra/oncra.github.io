import { Dispatch, DragEvent, SetStateAction, useRef, useState } from 'react';
import './DropZone.css'
import FileSelector from '../fileSelector/FileSelector';
import { parseKMLFile } from '../../scripts/KMLReader';
import ReactDOM from 'react-dom';
import { polygon2LatLonRange, polygon2XY } from '../../scripts/math/PolygonUtils';
import { availableYears } from '../../App';
import { CedaData } from '../../models/CedaData';
import { Coordinate } from '../../models/Coordinate';
import { XY } from '../../models/XY';
import { RowStatus } from '../../models/RowStatus';
import { range } from '../../scripts/math/MathUtils';
import { getCedaData } from '../../scripts/CEDA/CedaService';

interface Props {
  setAgbData: Dispatch<SetStateAction<(CedaData | null)[]>>,
  setPolygon: Dispatch<SetStateAction<Coordinate[]>>,
  setXY: Dispatch<SetStateAction<XY | null>>,
  setRowsStatus: Dispatch<SetStateAction<RowStatus[]>>,
  setSelectedYear: Dispatch<SetStateAction<number | null>>,
  setKmlFileName: Dispatch<SetStateAction<string | null>>
}

const DropZone = ({setAgbData, setPolygon, setXY, setRowsStatus, setSelectedYear, setKmlFileName}: Props) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [fileError, setFileError] = useState<string>('');
  
  const handleDrop = async (event: DragEvent<HTMLDivElement>): Promise<void> => {
    restoreDropZone();
    const items = event.dataTransfer.items;
    if (items.length > 1) {
      setFileError('Can only upload one file');
      return;
    }

    const item = items[0];
    if (item.kind !== "file") {
      setFileError('Please drop a file');
      return;
    }

    const file = item.getAsFile();
    if (file == null) {
      setFileError('Unexpected error occurred while loading file');
      return;
    }

    // Check if the file is a KML file by extension
    if (!file.name.toLowerCase().endsWith('.kml')) {
      setFileError('File format must be .kml');
      return;
    }

    await loadFileAndCallEndpoint(file);
  }
  const handleDragEnter = () => dropZoneRef.current?.classList.add('active');
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    const relatedTarget = e.relatedTarget as HTMLDivElement;
    const isEnteringChildElement = dropZoneRef.current?.contains(ReactDOM.findDOMNode(relatedTarget));
    if (!isEnteringChildElement) {
      restoreDropZone();
    }
  }

  const restoreDropZone = () => dropZoneRef.current?.classList.remove('active');

  const loadFileAndCallEndpoint = async (file: File) => {
    setFileError('');
    if (file == undefined) return;
    setKmlFileName(file.name);

    const polygon = await parseKMLFile(file);
    const XY = polygon2XY(polygon);
    
    const maxRectangleMetres = 10000;
    const xRange = range(XY.x);
    const yRange = range(XY.y);
    if (xRange > maxRectangleMetres || yRange > maxRectangleMetres) {
      setFileError(`.kml file polygon region (${(xRange/1000).toFixed(2)}km x ${(yRange/1000).toFixed(2)}km) exceeds threshold (10km x 10km)`);
      return;
    }

    setPolygon(polygon);
    setXY(XY);

    const latLonRange = polygon2LatLonRange(polygon);
    setRowsStatus((rowsStatus) => rowsStatus.map(() => RowStatus.Fetching));
    setAgbData((agbData) => agbData.map(() => null));
    setSelectedYear(null);

    availableYears.forEach(async (year, index) => {
      const cedaData = await getCedaData(year, latLonRange);
      if (cedaData == null) {
        setRowsStatus((rowsStatus) => {
          const rowsStatusClone = [...rowsStatus];
          rowsStatusClone[index] = RowStatus.Failed;
          return rowsStatusClone;
        });
        return;
      }
      
      setAgbData((agbData) => {
        const agbDataClone = [...agbData];
        agbDataClone[index] = cedaData;
        return agbDataClone;
      });

      setRowsStatus((rowsStatus) => {
        const rowsStatusClone = [...rowsStatus];
        rowsStatusClone[index] = RowStatus.Done;
        return rowsStatusClone;
      });

      setSelectedYear((selectedYear) => {
        if (selectedYear == null || year > selectedYear) {
          return year;
        }
        return selectedYear;
      })
    });
  }

  return (
    <>
      <div ref={dropZoneRef}
        className='dropZone'
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        >
        <div className='alignVertical'>
          <div className='dropFileHere'>Drop .kml file here</div>
          <div className='or'>or</div>

          <FileSelector 
            acceptedFormat={'.kml'} 
            fileLoadedCallback={loadFileAndCallEndpoint}
          />
        </div>
      </div>
      <div className='fileError'>{fileError}</div>
    </>
  )
}

export default DropZone