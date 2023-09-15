class CedaDataParser {
  #fillValue = -32768;

  parse(data) {
    let agb = this.extractAGB(data);
    let lat = this.extractLatLon(data, "agb\\.lat");
    let lon = this.extractLatLon(data, "agb\\.lon");

    return {
      agb: agb,
      lat: lat,
      lon: lon
    };
  }

  extractAGB(data) {
    const agbSection = this.extractSectionString(data, "agb\\.agb");
    let agb = agbSection.split("\n");

    agb = agb.map((line) => {
      const lineStartString = "],";
      const lineStartPosition = line.search(lineStartString) + lineStartString.length;
      const stringMatrix = line.slice(lineStartPosition).split(", ");
      return stringMatrix.map(value => {
        const val = parseInt(value);
        return val == this.#fillValue ? null : val;
      });
    });
    return agb;
  }

  extractLatLon(data, sectionStartString) {
    const section = this.extractSectionString(data, sectionStartString);
    let values = section.split(", ").map(value => parseFloat(value));
    return values;
  }

  extractSectionString(data, sectionStartString) {
    const sectionStartPosition = data.search(sectionStartString);
    const sectionEndPosition = data.slice(sectionStartPosition).search("\\n\\n") + sectionStartPosition;
    const sectionWithHeader = data.slice(sectionStartPosition, sectionEndPosition);
    
    const sectionContentStartPosition = sectionWithHeader.search("\\n") + 1;
    const section = sectionWithHeader.slice(sectionContentStartPosition);

    return section;
  }
}