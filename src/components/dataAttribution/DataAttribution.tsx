import './DataAttribution.css'

const DataAttribution = () => {
  return (
    <div id="dataAttribution">
      <p>
        The <a href="https://catalogue.ceda.ac.uk/uuid/95913ffb6467447ca72c4e9d8cf30501" target='_blank'>ESA AGB Dataset</a> is 
        based on Sentinel satellite data and other sources, 
        and both the data and this set are free to use for all purposes. (
        <a href="https://dap.ceda.ac.uk/neodc/esacci/biomass/data/agb/maps/v6.0/00README_catalogue_and_licence.txt?download=1" target='_blank'>Licence</a>)
      </p>
      <p>
        <a href="https://oncra.org" target='_blank'>ONCRA </a> 
        accepts this data as a reliable source for above ground biomass baseline for its natural carbon accounting and crediting.
      </p>
    </div>
  )
}

export default DataAttribution