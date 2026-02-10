
import React from 'react';
import { CodeState } from './types';

export const INITIAL_CODE: CodeState = {
  html: `<div class="container">
  <h1>Welcome to Devnox IT Online Console</h1>
  <p>This is a live code editor for HTML, CSS, and JavaScript.</p>
  <button id="demo-btn">Click me!</button>
  <p id="message"></p>
</div>`,
  css: `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  width: 100%;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  font-size: 2.5em;
  font-weight: 700;
}

p {
  color: #666;
  font-size: 1.2em;
  line-height: 1.6;
  margin-bottom: 30px;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
}

#message {
  margin-top: 20px;
  font-weight: 600;
  color: #4CAF50;
  opacity: 0;
  transition: opacity 0.5s ease;
}`,
  js: `document.getElementById('demo-btn').addEventListener('click', function() {
  const message = document.getElementById('message');
  message.textContent = 'Hello! Thanks for trying Devnox IT Online Console!';
  message.style.opacity = '1';

  // Log to console for demonstration
  console.log('Button clicked! Welcome to Devnox IT Online Console');
});`
};
