import { CedaData } from "../../models/CedaData";

const fillValue = -32768;

export const parseCedaResponse = (text: string, year: number) : CedaData => {
  const agb = extractAGB(text);
  const lat = extractLatLon(text, "agb\\.lat");
  const lon = extractLatLon(text, "agb\\.lon");

  let agbMax = agb[0][0];
  for (let i=0; i<agb.length; i++) {
    for (let j=0; j<agb[0].length; j++) {
      const currentAgb = agb[i][j];
      if (agbMax == null || (agbMax < (currentAgb ?? 0))) {
        agbMax = currentAgb;
      }
    }
  }

  return {
    agb: agb,
    lat: lat,
    lon: lon,
    agbMax: agbMax,
    year: year
  }
}

const extractAGB = (text: string) => {
  const agbSection = extractSectionString(text, "agb\\.agb");
  const agbLines = agbSection.split("\n");

  const agb = agbLines.map((line) => {
    const lineStartString = "],";
    const lineStartPosition = line.search(lineStartString) + lineStartString.length;
    const stringMatrix = line.slice(lineStartPosition).split(", ");
    return stringMatrix.map(value => {
      const val = parseInt(value);
      return val == fillValue ? null : val;
    });
  });
  return agb;
}

const extractLatLon = (text: string, sectionStartString: string) => {
  const section = extractSectionString(text, sectionStartString);
  const values = section.split(", ").map(value => parseFloat(value));
  return values;
}

const extractSectionString = (text: string, sectionStartString: string) => {
  const sectionStartPosition = text.search(sectionStartString);
  const sectionEndPosition = text.slice(sectionStartPosition).search("\\n\\n") + sectionStartPosition;
  const sectionWithHeader = text.slice(sectionStartPosition, sectionEndPosition);
  
  const sectionContentStartPosition = sectionWithHeader.search("\\n") + 1;
  const section = sectionWithHeader.slice(sectionContentStartPosition);

  return section;
}