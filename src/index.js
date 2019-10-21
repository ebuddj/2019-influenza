import React from 'react'
import ReactDOM from 'react-dom'
import App from './jsx/App.jsx';

//http://flunewseurope.org/

document.addEventListener('DOMContentLoaded', (event) => {
  const wrapper = document.getElementById('app-root');
  wrapper ? ReactDOM.render(<App />, wrapper) : false;
});