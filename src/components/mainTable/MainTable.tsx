import { availableYears } from '../../App';
import './MainTable.css'
import LoadingSpinner from '../loadingSpinner/LoadingSpinner';
import { CedaData } from '../../models/CedaData';

interface Props {
  agbData: (CedaData | null) [],
  isFetching: boolean[]
}

const MainTable = ({agbData, isFetching}: Props) => {
  const tableRows = availableYears.map((year, index) => {
    const agbMax = agbData[index]?.agbMax

    const loadingSpinner = isFetching[index] && (<LoadingSpinner />);
    const completionTick = (!isFetching[index] && agbData[index] !== null) && (<>✅</>);
    
    return (
      <tr key={year}>
        <td>{year} {loadingSpinner} {completionTick}</td>
        <td>{agbMax}</td>
        <td></td>
        <td></td>
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