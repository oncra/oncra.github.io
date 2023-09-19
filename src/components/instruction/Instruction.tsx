import './Instruction.css'

const Instruction = () => {
  return (
    <div className='instruction'>
      <div>
        Create a <strong>.kml file</strong> containing just <strong>1 polygon</strong>.

        <a id='exampleKMLFile' 
          className='smallGrayButton'
          href="example_kml_file.kml"
          download="example_kml_file.kml">
            example .kml file
        </a>
      </div>

      <div>
        Then upload the <strong>.kml file</strong> below, 
        to get the above ground carbon data within the polygon region.
      </div>
    </div>
  )
}

export default Instruction