import { availableYears } from '../../App';
import './MainTable.css'
import LoadingSpinner from '../loadingSpinner/LoadingSpinner';
import { CedaData } from '../../models/CedaData';
import { Dispatch, SetStateAction } from 'react';
import { RowStatus } from '../../models/RowStatus';
import { Coordinate } from '../../models/Coordinate';
import { getGridCrossDataMatrixFromAGBPolygon } from '../../scripts/math/RayCastingUtils';
import { calculateArea } from '../../scripts/math/AreaUtils';
import { sum } from '../../scripts/math/MathUtils';
import { GetGridMultiplier } from './scripts/AGBCalculationUtils';

interface Props {
  agbData: (CedaData | null) [],
  polygon: Coordinate[]
  rowsStatus: RowStatus[],
  selectedYear: number | null,
  setSelectedYear: Dispatch<SetStateAction<number | null>>,
}

export const getCarbon = (agb: number | null | undefined) => agb !== null && agb !== undefined ? agb / 2 : null;
export const getCO2 = (agb: number | null | undefined) => agb !== null && agb !== undefined ? agb / 2 * 44 / 12 : null;

const MainTable = ({agbData, polygon, rowsStatus, selectedYear, setSelectedYear}: Props) => {
  const {gridCrossDataMatrix, xGrids, yGrids} = getGridCrossDataMatrixFromAGBPolygon(polygon);

  let { polygonXY, gridMultiplier } = GetGridMultiplier(gridCrossDataMatrix, xGrids, yGrids, polygon);

  let polygonXYArea: number;
  if (polygonXY !== undefined) {
    polygonXYArea = calculateArea(polygonXY);
    ({ gridMultiplier, polygonXYArea } = OnlyCountFullGridIfHasAtLeastOneFullGridInside(gridMultiplier, polygonXYArea));
    polygonXYArea = Math.abs(polygonXYArea);
  }

  let agbSum: number | null = null;
  let agbCount = 0;
  let tableRows = availableYears.map((year, index) => {
    const agbDatum = agbData[index];
    const rowStatus = rowsStatus[index];
    let statusIcon = getStatusIcon(rowStatus);
    
    const handleClick = () => {
      if (rowStatus==RowStatus.Done) {
        setSelectedYear(year);
        logSelectedYearData(year, agbData, gridMultiplier, polygonXYArea);
      }
    };
    const isSelectedYear = selectedYear == year;
    const className = (agbDatum !== null && rowStatus!=RowStatus.Fetching && isSelectedYear) ? 'active' : '';

    let agb: number | null = null;
    let carbon: number | null = null;
    let co2: number | null = null;
    if (agbDatum !== null && polygonXYArea !== undefined) {
      agb = getAGB(agb, agbDatum, gridMultiplier, polygonXYArea);
      carbon = getCarbon(agb);
      co2 = getCO2(agb);

      agbSum = agbSum == null ? agb : agbSum + agb;
      agbCount++;
    }

    return (
      <tr key={year} onClick={handleClick} className={className}>
        <td>{year} {statusIcon}</td>
        <td>{agb?.toFixed(3)}</td>
        <td>{carbon?.toFixed(3)}</td>
        <td>{co2?.toFixed(3)}</td>
      </tr>
    );
  });

  let agbAvg: number | null = null;
  let carbonAvg: number | null = null;
  let co2Avg: number | null = null;

  if (agbSum !== null) {
    agbAvg = agbSum/agbCount;
    carbonAvg = getCarbon(agbAvg);
    co2Avg = getCO2(agbAvg);
  }
  tableRows.push((
    <tr key="average" id="no-hover">
      <td>Average</td>
      <td>{agbAvg?.toFixed(3)}</td>
      <td>{carbonAvg?.toFixed(3)}</td>
      <td>{co2Avg?.toFixed(3)}</td>
    </tr>
  ));
  
  return (
    <div className='tableContainer'>
      <table>
        <tbody>
          <tr key='tableHeader'>
            <th>Year</th>
            <th>Above Ground Biomass <br /> (Mg/ha)</th>
            <th>Carbon <br /> (Mg/ha)</th>
            <th>CO2 Equivalent <br /> (Mg/ha)</th>
          </tr>
          {tableRows}
        </tbody>
      </table>
    </div>
  )
}

export default MainTable

function logSelectedYearData(year: number, agbData: (CedaData | null)[], gridMultiplier: number[][], polygonXYArea: number) {
  console.log('-------------------');
  console.log(`Year Selected: ${year}`);
  console.log("AGB Data:");
  console.log(agbData[availableYears.indexOf(year)]?.agb);
  console.log('Multiplication Factors:');
  console.log(gridMultiplier);
  console.log(`Over Area: ${polygonXYArea}`);
}

function getAGB(agb: number | null, agbDatum: CedaData, gridMultiplier: number[][], polygonXYArea: number) {
  agb = 0;
  for (let i = 0; i < agbDatum.agb.length; i++) {
    for (let j = 0; j < agbDatum.agb[0].length; j++) {
      agb += (agbDatum.agb[i][j] ?? 0) * gridMultiplier[i][j];
    }
  }
  agb = agb / polygonXYArea;
  return agb;
}

function OnlyCountFullGridIfHasAtLeastOneFullGridInside(gridMultiplier: number[][], polygonXYArea: number) {
  const hasAtLeastOneFullGridInside = Math.max(...gridMultiplier.flat(2)) >= 1;
  if (hasAtLeastOneFullGridInside) {
    gridMultiplier = gridMultiplier.map(line => line.map(v => Math.floor(v)));
    polygonXYArea = sum(gridMultiplier.flat(2));
  }
  return { gridMultiplier, polygonXYArea };
}

function getStatusIcon(rowStatus: RowStatus) {
  let statusIcon = <></>;
  if (rowStatus == RowStatus.Fetching) {
    statusIcon = (<LoadingSpinner />);
  }
  if (rowStatus == RowStatus.Done) {
    statusIcon = (<>✅</>);
  }
  if (rowStatus == RowStatus.Failed) {
    statusIcon = (<>❌</>);
  }
  return statusIcon;
}
