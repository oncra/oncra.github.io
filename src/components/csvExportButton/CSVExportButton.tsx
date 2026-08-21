import { availableYears } from '../../App';
import './CSVExportButton.css';
import { CedaData } from '../../models/CedaData';
import { Coordinate } from '../../models/Coordinate';
import { getGridCrossDataMatrixFromAGBPolygon } from '../../scripts/math/RayCastingUtils';
import { calculateArea } from '../../scripts/math/AreaUtils';
import { sum } from '../../scripts/math/MathUtils';
import { GetGridMultiplier } from '../mainTable/scripts/AGBCalculationUtils';

interface Props {
  agbData: (CedaData | null)[],
  polygon: Coordinate[]
  kmlFileName: string | null,
}

const getCarbon = (agb: number | null | undefined) => agb !== null && agb !== undefined ? agb / 2 : null;
const getCO2 = (agb: number | null | undefined) => agb !== null && agb !== undefined ? agb / 2 * 44 / 12 : null;

const CSVExportButton = ({ agbData, polygon, kmlFileName }: Props) => {
  const { gridCrossDataMatrix } = getGridCrossDataMatrixFromAGBPolygon(polygon);

  let { polygonXY, gridMultiplier } = GetGridMultiplier(gridCrossDataMatrix, [], [], polygon);

  let polygonXYArea: number;
  if (polygonXY !== undefined) {
    polygonXYArea = calculateArea(polygonXY);
    ({ gridMultiplier, polygonXYArea } = OnlyCountFullGridIfHasAtLeastOneFullGridInside(gridMultiplier, polygonXYArea));
    polygonXYArea = Math.abs(polygonXYArea);
  }

  let agbSum: number | null = null;
  let agbCount = 0;

  // Calculate AGB sum to determine if we have data to export
  availableYears.forEach((_, index) => {
    const agbDatum = agbData[index];
    if (agbDatum !== null && polygonXYArea !== undefined) {
      const agb = getAGB(agbDatum, gridMultiplier, polygonXYArea);
      agbSum = agbSum == null ? agb : agbSum + agb;
      agbCount++;
    }
  });

  const exportToCSV = () => {
    // Generate CSV filename based on KML filename
    let csvFilename = 'above_ground_carbon_data.csv';
    if (kmlFileName) {
      // Remove .kml extension and add .csv
      csvFilename = kmlFileName.replace(/\.kml$/i, '.csv');
    }

    // Create CSV content
    const headers = ['Year', 'Above Ground Biomass (Mg/ha)', 'Carbon (Mg/ha)', 'CO2 Equivalent (Mg/ha)'];
    
    // Get data rows (excluding the average row for now, we'll add it separately)
    const dataRows = availableYears.map((year, index) => {
      const agbDatum = agbData[index];
      
      let agb: number | null = null;
      let carbon: number | null = null;
      let co2: number | null = null;
      
      if (agbDatum !== null && polygonXYArea !== undefined) {
        agb = getAGB(agbDatum, gridMultiplier, polygonXYArea);
        carbon = getCarbon(agb);
        co2 = getCO2(agb);
      }
      
      return [
        year.toString(),
        agb?.toFixed(3) || '',
        carbon?.toFixed(3) || '',
        co2?.toFixed(3) || ''
      ];
    });
    
    // Add average row
    let agbAvg: number | null = null;
    let carbonAvg: number | null = null;
    let co2Avg: number | null = null;

    if (agbSum !== null) {
      agbAvg = agbSum / agbCount;
      carbonAvg = getCarbon(agbAvg);
      co2Avg = getCO2(agbAvg);
      
      dataRows.push([
        'Average',
        agbAvg.toFixed(3),
        carbonAvg?.toFixed(3) || '',
        co2Avg?.toFixed(3) || ''
      ]);
    }
    
    // Combine headers and data
    const csvContent = [headers, ...dataRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', csvFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      className='exportButton' 
      onClick={exportToCSV}
      disabled={agbSum === null}
    >
      Export to CSV
    </button>
  );
};

export default CSVExportButton;

// Helper functions
function getAGB(agbDatum: CedaData, gridMultiplier: number[][], polygonXYArea: number) {
  let agb = 0;
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
