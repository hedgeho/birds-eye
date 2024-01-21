import * as React from 'react';
import {createRoot} from 'react-dom/client';

import '../src/assets/style.css';


const App: React.FC = () => {
    return (
        <div className="grid wrapper">
            <div className="app-card">
                <p className="app-card--description p-medium">
                    Miro Birdseye is an extension that helps you declutter your workspace and make professional presentations by hiding information not currently necessary.
                </p>
            </div>


            <div className="cs1 ce12">
                <img src="/src/assets/tutorialGIf.gif" alt="Tutorial gif" />
            </div>

            <div className="cs1 ce12">
                <h1>HowTOs:</h1>
                <p>1: Create a frame and highlight it.</p>
                <p>2: Press the "Create a curtain" button.</p>
                <p>3: You just created your first Birdseye curtain!</p>
                <p>4: Go and create visual and intuitive presentations or declutter you board.</p>

            </div>


        </div>

    );
};

const container = document.getElementById('root');
// @ts-ignore
const root = createRoot(container);
root.render(<App/>);
