import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './engine/store'
import './index.css'
import App from './App.jsx'
import DosVgaFontWoff from './assets/fonts/PxPlus_IBM_VGA_9x16.woff'

// Inject Font
const fontStyle = document.createElement('style');
fontStyle.textContent = `
  @font-face {
    font-family: 'DosVga';
    src: url('${DosVgaFontWoff}') format('woff');
    font-weight: normal;
    font-style: normal;
  }
`;
document.head.appendChild(fontStyle);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
