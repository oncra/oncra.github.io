import './DataAttribution.css'

const DataAttribution = () => {
  return (
    <div id="dataAttribution">
      <p>
        The <a href="https://catalogue.ceda.ac.uk/uuid/af60720c1e404a9e9d2c145d2b2ead4e" target='_blank'>ESA AGB Dataset</a> is 
        based on Sentinel satellite data and other sources, 
        and both the data and this set are free to use for all purposes. (
        <a href="https://dap.ceda.ac.uk/neodc/esacci/biomass/data/agb/maps/v4.0/00README_catalogue_and_licence.txt?download=1" target='_blank'>Licence</a>)
      </p>
      <p>
        <a href="https://oncra.org" target='_blank'>ONCRA </a> 
        accepts this data as a reliable source for above ground biomass baseline for its natural carbon accounting and crediting.
      </p>
    </div>
  )
}

export default DataAttribution