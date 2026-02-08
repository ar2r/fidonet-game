import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './engine/store'
import './index.css'
import App from './App.jsx'
import DosVgaFont from './assets/fonts/IBM_VGA_9x16.ttf'

// Inject Font
const fontStyle = document.createElement('style');
fontStyle.textContent = `
  @font-face {
    font-family: 'DosVga';
    src: url('${DosVgaFont}') format('truetype');
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
