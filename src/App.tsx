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

preventDefaultDragDropBehaviour();

export const availableYears = [2010, 2017, 2018, 2019];

function App() {
  const [agbData, setAgbData] = useState<(CedaData | null)[]>(availableYears.map(() => null));
  const [polygon, setPolygon] = useState<Coordinate[]>([]);
  const [isFetching, setIsFetching] = useState(availableYears.map(() => false));
  const [selectedYear, setSelectedYear] = useState<number | null>(2019);
  
  return (
    <div className='mainContainer'>
      <Header />
      <h1>Above Ground Carbon <br />Data Tool</h1>
      <Instruction />
      <DropZone setAgbData={setAgbData} setPolygon={setPolygon} setIsFetching={setIsFetching}/>

      <p>don't trust the values in the table below yet, still working on it 👍</p>
      <MainTable agbData={agbData} isFetching={isFetching}/>
      <ColourMap width={600} height={600} selectedYear={selectedYear} agbData={agbData} polygon={polygon}/>
    </div>
  )
}

export default App
