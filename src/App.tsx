import { useRef, useState } from 'react';
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
import Footer from './components/footer/Footer';
import DataAttribution from './components/dataAttribution/DataAttribution';

preventDefaultDragDropBehaviour();

export const availableYears = [2010, 2017, 2018, 2019, 2020];

function App() {
  const [agbData, setAgbData] = useState<(CedaData | null)[]>(availableYears.map(() => null));
  const [polygon, setPolygon] = useState<Coordinate[]>([]);
  const [XY, setXY] = useState<XY | null>(null);
  const [rowsStatus, setRowsStatus] = useState<(RowStatus)[]>(availableYears.map(() => RowStatus.Empty));
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [kmlFileName, setKmlFileName] = useState<string | null>(null);

  const chartWidth = Math.min(600, document.body.clientWidth);
  const chartHeight = Math.min(600, chartWidth);

  const dataSectionRef = useRef<HTMLDivElement>(null);
  const handleDatalinkClick = () => {
    dataSectionRef.current?.classList.add('active');

    setTimeout(function(){
      dataSectionRef.current?.classList.remove('active');
    }, 3000);
  }
  
  return (
    <>
      <div className='mainContainer'>
        <Header />
        
        <h1>Above Ground Carbon <br />Data Tool</h1>
        <div>
          <p>
            This tool fetches above ground biomass data from the 
            <a href="#dataSection" onClick={handleDatalinkClick}> ESA AGB Dataset </a> 
            based on the input of a land area in the form of a KML file. 
          </p>
        </div>
      </div>

      <Instruction />

      <div className='mainContainer'>
        <DropZone 
          setAgbData={setAgbData} 
          setPolygon={setPolygon} 
          setXY={setXY} 
          setRowsStatus={setRowsStatus} 
          setSelectedYear={setSelectedYear}
          setKmlFileName={setKmlFileName}/>

        <KMLFilePreviewer 
          width={chartWidth} 
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
          width={chartWidth} 
          height={chartHeight} 
          selectedYear={selectedYear} 
          agbData={agbData} 
          polygon={polygon}
          XY={XY}/>

        <InnerOuterMap 
          width={chartWidth} 
          height={chartHeight} 
          polygon={polygon}
          XY={XY}/>

        <div id="dataSection" ref={dataSectionRef}>
          <DataAttribution />
        </div>
        
      </div>

      <Footer />
    </>
  )
}

export default App
