import { useState } from 'react';
import './App.css'
import ColourMap from './components/colourMap/ColourMap';
import DropZone from './components/dropZone/DropZone'
import Header from './components/header/Header'
import Instruction from './components/instruction/Instruction'
import MainTable from './components/mainTable/MainTable';
import { preventDefaultDragDropBehaviour } from './scripts/CommonUtils';
import { CedaData } from './models/CedaData';
import { Coordinate } from './models/Coordinate';
import { XY } from './models/XY';
import KMLFilePreviewer from './components/kmlFilePreviewer/KMLFilePreviewer';
import { RowStatus } from './models/RowStatus';
import InnerOuterMap from './components/innerOuterMap/InnerOuterMap';
import AreaCanvas from './components/areaCanvas/AreaCanvas';

preventDefaultDragDropBehaviour();

export const availableYears = [2010, 2017, 2018, 2019, 2020];

function App() {
  const [agbData, setAgbData] = useState<(CedaData | null)[]>(availableYears.map(() => null));
  const [polygon, setPolygon] = useState<Coordinate[]>([]);
  const [XY, setXY] = useState<XY | null>(null);
  const [rowsStatus, setRowsStatus] = useState<(RowStatus)[]>(availableYears.map(() => RowStatus.Empty));
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [kmlFileName, setKmlFileName] = useState<string | null>(null);
  
  return (
    <div className='mainContainer'>
      <Header />

      <AreaCanvas />
      
      <h1>Above Ground Carbon <br />Data Tool</h1>
      <Instruction />

      <DropZone 
        setAgbData={setAgbData} 
        setPolygon={setPolygon} 
        setXY={setXY} 
        setRowsStatus={setRowsStatus} 
        setSelectedYear={setSelectedYear}
        setKmlFileName={setKmlFileName}/>

      <KMLFilePreviewer 
        width={600} 
        height={100} 
        kmlFileName={kmlFileName}
        XY={XY}/>
      
      <MainTable 
        agbData={agbData} 
        polygon={polygon}
        rowsStatus={rowsStatus} 
        selectedYear={selectedYear} 
        setSelectedYear={setSelectedYear}/>

      <ColourMap 
        width={600} 
        height={600} 
        selectedYear={selectedYear} 
        agbData={agbData} 
        polygon={polygon}
        XY={XY}/>

      <InnerOuterMap 
        width={600} 
        height={600} 
        polygon={polygon}
        XY={XY}/>
    </div>
  )
}

export default App
