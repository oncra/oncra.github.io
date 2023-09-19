import { availableYears } from '../../App';
import './MainTable.css'
import LoadingSpinner from '../loadingSpinner/LoadingSpinner';
import { CedaData } from '../../models/CedaData';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  agbData: (CedaData | null) [],
  isFetching: boolean[],
  selectedYear: number | null,
  setSelectedYear: Dispatch<SetStateAction<number | null>>
}

const getCarbon = (agb: number | null | undefined) => agb ? agb / 2 : null;
const getCO2 = (agb: number | null | undefined) => agb ? agb / 2 * 44 / 12 : null;

const MainTable = ({agbData, isFetching, selectedYear, setSelectedYear}: Props) => {
  const tableRows = availableYears.map((year, index) => {
    const agbDatum = agbData[index];

    const agbMax = agbDatum?.agbMax
    const isFetchingRow = isFetching[index];

    const loadingSpinner = isFetchingRow && (<LoadingSpinner />);
    const completionTick = (!isFetchingRow && agbDatum !== null) && (<>✅</>);
    
    const handleClick = () => {setSelectedYear(year)};
    const isSelectedYear = selectedYear == year;
    const className = (agbDatum !== null && !isFetchingRow && isSelectedYear) ? 'active' : '';

    const agb = agbMax;
    const carbon = getCarbon(agb);
    const co2 = getCO2(agb);

    return (
      <tr key={year} onClick={handleClick} className={className}>
        <td>{year} {loadingSpinner} {completionTick}</td>
        <td>{agb?.toFixed(2)}</td>
        <td>{carbon?.toFixed(2)}</td>
        <td>{co2?.toFixed(2)}</td>
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