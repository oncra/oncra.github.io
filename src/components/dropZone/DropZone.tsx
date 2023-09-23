import { Dispatch, DragEvent, SetStateAction, useRef } from 'react';
import './DropZone.css'
import FileSelector from '../fileSelector/FileSelector';
import { parseKMLFile } from '../../scripts/KMLReader';
import ReactDOM from 'react-dom';
import { polygon2LatLonRange, polygon2XY } from '../../scripts/math/PolygonUtils';
import { callCedaEndpoint } from '../../scripts/CEDA/CedaHttpClient';
import { parseCedaResponse } from '../../scripts/CEDA/CedaResponseParser';
import { availableYears } from '../../App';
import { CedaData } from '../../models/CedaData';
import { Coordinate } from '../../models/Coordinate';
import { XY } from '../../models/XY';
import { RowStatus } from '../../models/RowStatus';
import { range } from '../../scripts/math/MathUtils';

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
  const fileErrorRef = useRef<HTMLDivElement>(null);

  const handleDrop = async (event: DragEvent<HTMLDivElement>): Promise<void> => {
    restoreDropZone();
    const fileError = fileErrorRef.current;
    if (fileError == null) return;
    
    const items = event.dataTransfer.items;
    if (items.length > 1) {
      fileError.innerText = 'Can only upload one file';
      return;
    }

    const item = items[0];
    if (item.kind !== "file" || !item.type.includes('kml')) {
      fileError.innerText = 'File format must be .kml';
      return;
    }

    const file = item.getAsFile();
    if (file == null) {
      fileError.innerText = 'Unexpected error occurred while loading file';
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
    const fileError = fileErrorRef.current;
    if (fileError == null) return;

    fileError.innerText = '';
    if (file == undefined) return;
    setKmlFileName(file.name);

    const polygon = await parseKMLFile(file);
    const XY = polygon2XY(polygon);
    
    const maxRectangleMetres = 10000;
    const xRange = range(XY.x);
    const yRange = range(XY.y);
    if (xRange > maxRectangleMetres || yRange > maxRectangleMetres) {
      fileError.innerText = `.kml file polygon region (${(xRange/1000).toFixed(2)}km x ${(yRange/1000).toFixed(2)}km) exceeds threshold (10km x 10km)`;
      return;
    }

    setPolygon(polygon);
    setXY(XY);

    const latLonRange = polygon2LatLonRange(polygon);
    setRowsStatus((rowsStatus) => rowsStatus.map(() => RowStatus.Fetching));
    setAgbData((agbData) => agbData.map(() => null));
    setSelectedYear(null);

    availableYears.forEach(async (year, index) => {
      const cedaResponse = await callCedaEndpoint(year, latLonRange);
      if (cedaResponse == null) {
        setRowsStatus((rowsStatus) => {
          const rowsStatusClone = [...rowsStatus];
          rowsStatusClone[index] = RowStatus.Failed;
          return rowsStatusClone;
        });
        return;
      }

      const cedaData = parseCedaResponse(cedaResponse, year);
      
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
      <div ref={fileErrorRef} className='fileError'></div>
    </>
  )
}

export default DropZone