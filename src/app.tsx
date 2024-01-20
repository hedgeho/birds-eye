import * as React from 'react';
import {createRoot} from 'react-dom/client';

import '../src/assets/style.css';
import {addSticky} from "./logic";


const App: React.FC = () => {
  React.useEffect(() => {
    addSticky();


  }, []);

  return (
    <div className="grid wrapper">
      <div className="cs1 ce12">
        <img src="/src/assets/congratulations.png" alt="" />
      </div>
      <div className="cs1 ce12">
        <h1>Congratulations!</h1>
        <p>You've just created your first Miro app!</p>
        <p>
          To explore more and build your own app, see the Miro Developer
          Platform documentation.
        </p>
      </div>
      <div className="cs1 ce12">
        <a
          className="button button-primary"
          target="_blank"
          href="https://developers.miro.com"
        >
          Read the documentation
        </a>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
// @ts-ignore
const root = createRoot(container);
root.render(<App />);
