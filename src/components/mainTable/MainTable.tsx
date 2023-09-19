import { availableYears } from '../../App';
import './MainTable.css'
import LoadingSpinner from '../loadingSpinner/LoadingSpinner';
import { CedaData } from '../../models/CedaData';
import { Dispatch, SetStateAction } from 'react';
import { RowStatus } from '../../models/RowStatus';

interface Props {
  agbData: (CedaData | null) [],
  rowsStatus: RowStatus[],
  selectedYear: number | null,
  setSelectedYear: Dispatch<SetStateAction<number | null>>
}

const getCarbon = (agb: number | null | undefined) => agb ? agb / 2 : null;
const getCO2 = (agb: number | null | undefined) => agb ? agb / 2 * 44 / 12 : null;

const MainTable = ({agbData, rowsStatus, selectedYear, setSelectedYear}: Props) => {
  const tableRows = availableYears.map((year, index) => {
    const agbDatum = agbData[index];

    const agbMax = agbDatum?.agbMax
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
      }
    };
    const isSelectedYear = selectedYear == year;
    const className = (agbDatum !== null && rowStatus!=RowStatus.Fetching && isSelectedYear) ? 'active' : '';

    const agb = agbMax;
    const carbon = getCarbon(agb);
    const co2 = getCO2(agb);

    return (
      <tr key={year} onClick={handleClick} className={className}>
        <td>{year} {statusIcon}</td>
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