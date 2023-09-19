import { Dispatch, DragEvent, SetStateAction, useRef } from 'react';
import './DropZone.css'
import FileSelector from '../fileSelector/FileSelector';
import { parseKMLFile } from '../../scripts/KMLReader';
import ReactDOM from 'react-dom';
import { polygon2LatLonRange, polygon2XY } from '../../scripts/PolygonUtils';
import { callCedaEndpoint } from '../../scripts/CEDA/CedaHttpClient';
import { parseCedaResponse } from '../../scripts/CEDA/CedaResponseParser';
import { availableYears } from '../../App';
import { CedaData } from '../../models/CedaData';
import { Coordinate } from '../../models/Coordinate';
import { XY } from '../../models/XY';
import { RowStatus } from '../../models/RowStatus';

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

  const handleDrop = async (event: DragEvent<HTMLDivElement>): Promise<void> => {
    restoreDropZone();
    
    const items = event.dataTransfer.items;
    if (items.length > 1) return;

    const item = items[0];
    if (item.kind !== "file" || !item.type.includes('kml')) return;

    const file = item.getAsFile();
    if (file == null) return;

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
    if (file == undefined) return;
    setKmlFileName(file.name);

    const polygon = await parseKMLFile(file);
    setPolygon(polygon);
    
    const XY = polygon2XY(polygon);
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
  )
}

export default DropZone