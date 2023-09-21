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

const getCarbon = (agb: number | null | undefined) => agb !== null && agb !== undefined ? agb / 2 : null;
const getCO2 = (agb: number | null | undefined) => agb !== null && agb !== undefined ? agb / 2 * 44 / 12 : null;

const MainTable = ({agbData, polygon, rowsStatus, selectedYear, setSelectedYear}: Props) => {
  const {gridCrossDataMatrix, xGrids, yGrids} = getGridCrossDataMatrixFromAGBPolygon(polygon);

  let { polygonXY, gridMultiplier } = GetGridMultiplier(gridCrossDataMatrix, xGrids, yGrids, polygon);

  let polygonXYArea: number | undefined;
  if (polygonXY !== undefined) {
    polygonXYArea = calculateArea(polygonXY);
    const hasAtLeastOneFullGridInside = Math.max(...gridMultiplier.flat(2)) >= 1;
    if (hasAtLeastOneFullGridInside) {
      gridMultiplier = gridMultiplier.map(line => line.map(v => Math.floor(v)));
      polygonXYArea = sum(gridMultiplier.flat(2));
    }
    polygonXYArea = Math.abs(polygonXYArea);
  }

  const tableRows = availableYears.map((year, index) => {
    const agbDatum = agbData[index];
    const rowStatus = rowsStatus[index];

    let statusIcon = <></>;
    if (rowStatus==RowStatus.Fetching) {
      statusIcon = (<LoadingSpinner />);
    }
    if (rowStatus==RowStatus.Done) {
      statusIcon = (<>✅</>);
    }
    if (rowStatus==RowStatus.Failed) {
      statusIcon = (<>❌</>)
    }
    
    const handleClick = () => {
      if (rowStatus==RowStatus.Done) {
        setSelectedYear(year)

        console.log('-------------------');
        console.log(`Year Selected: ${year}`);
        console.log("AGB Data:");
        console.log(agbData[availableYears.indexOf(year)]?.agb);
        console.log('Multiplication Factors:');
        console.log(gridMultiplier);
        console.log(`Over Area: ${polygonXYArea}`);
      }
    };
    const isSelectedYear = selectedYear == year;
    const className = (agbDatum !== null && rowStatus!=RowStatus.Fetching && isSelectedYear) ? 'active' : '';

    let agb: number | null = null;
    let carbon: number | null = null;
    let co2: number | null = null;
    if (agbDatum !== null && polygonXYArea !== undefined) {
      agb = 0;
      for (let i=0; i<agbDatum.agb.length; i++) {
        for (let j=0; j<agbDatum.agb[0].length; j++) {
          agb += (agbDatum.agb[i][j] ?? 0) * gridMultiplier[i][j];
        }
      }
      agb = agb / polygonXYArea;

      carbon = getCarbon(agb);
      co2 = getCO2(agb);
    }

    return (
      <tr key={year} onClick={handleClick} className={className}>
        <td>{year} {statusIcon}</td>
        <td>{agb?.toFixed(3)}</td>
        <td>{carbon?.toFixed(3)}</td>
        <td>{co2?.toFixed(3)}</td>
      </tr>
    );
  })
  
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