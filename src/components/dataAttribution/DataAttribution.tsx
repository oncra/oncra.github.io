import './DataAttribution.css'

const DataAttribution = () => {
  return (
    <div id="data-attribution">
      <p>
        This tool fetches above ground biomass data from the 
        <a href="https://data.ceda.ac.uk/neodc/esacci/biomass/data/agb/maps/v4.0" target='_blank'> ESA AGB Dataset </a> 
        based on the input of a land area in the form of a KML file. 
      </p>
      <p>
        The dataset is based on Sentinel satellite data and other sources, 
        and both the data and this set are free to use for all purposes. 
      </p>
      <p>
        <a href="https://oncra.org" target='_blank'>ONCRA </a> 
        accepts this data as a reliable source for above ground biomass baseline for its natural carbon accounting and crediting.
      </p>
    </div>
  )
}

export default DataAttribution