import oncraLogo from '/cropped-oncra-logo.png'
import './Header.css'

const header = () => {
  return (
    <header>
      <a href='https://oncra.org/' target='_blank'>
        <img src={oncraLogo} alt="ONCRA Logo" />
      </a>
    </header>
  )
}

export default header