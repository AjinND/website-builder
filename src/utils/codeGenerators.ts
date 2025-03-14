import { Page } from "@/types/types";

export function generateAppJs(pages: Page[]): string {
  return `
import React from 'react';
import AppRouter from './AppRouter';
import './index.css';

function App() {
  return <AppRouter />;
}

export default App;
  `.trim();
}

export function generateAppRouterJs(pages: Page[]): string {
  const imports = pages.map(page => 
    `import ${page.name.replace(/\s+/g, '')} from './pages/${page.name.replace(/\s+/g, '')}';`
  ).join('\n');
  
  const routes = pages.map(page => 
    `        <Route path="${page.id === 'page-1' ? '/' : '/' + page.name.toLowerCase()}" element={<${page.name.replace(/\s+/g, '')} />} />`
  ).join('\n');

  return `
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
${imports}

function AppRouter() {
  return (
    <Router>
      <Routes>
${routes}
      </Routes>
    </Router>
  );
}

export default AppRouter;
  `.trim();
}

export function generatePageJs(page: Page): string {
  const elementsMapping = page.elements
    .map((el) => JSON.stringify(el))
    .join(",\n  ");
    
  return `
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Jumbotron from '../components/Jumbotron';
import TextBlock from '../components/TextBlock';
import ButtonElement from '../components/ButtonElement';
import ImageElement from '../components/ImageElement';

// Page elements data
const elements = [
  ${elementsMapping}
];

function ${page.name.replace(/\s+/g, '')}() {
  const navigate = useNavigate();
  
  // Function to handle navigation between pages
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="relative w-full min-h-screen">
      {elements.map(el => {
        const style = { 
          position: 'absolute',
          left: el.x, 
          top: el.y, 
          width: el.width, 
          height: el.height 
        };
        
        switch(el.type) {
          case 'header':
            return <Header 
              key={el.id} 
              style={style} 
              {...el.properties} 
              onNavigate={handleNavigation}
            />;
          case 'navbar':
            return <Navbar 
              key={el.id} 
              style={style} 
              {...el.properties} 
              onNavigate={handleNavigation}
            />;
          case 'jumbotron':
            return <Jumbotron 
              key={el.id} 
              style={style} 
              {...el.properties} 
              onNavigate={handleNavigation}
            />;
          case 'text':
            return <TextBlock 
              key={el.id} 
              style={style} 
              {...el.properties}
            />;
          case 'button':
            return <ButtonElement 
              key={el.id} 
              style={style} 
              {...el.properties} 
              onNavigate={handleNavigation}
            />;
          case 'image':
            return <ImageElement 
              key={el.id} 
              style={style} 
              {...el.properties} 
              onNavigate={handleNavigation}
            />;
          default:
            return null;
        }
      })}
    </div>
  );
}

export default ${page.name.replace(/\s+/g, '')};
  `.trim();
}

export function generateIndexJs(): string {
  return `
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
  `.trim();
}

export function generateIndexHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
  `.trim();
}

export function generateReactPackageJson(): string {
  return JSON.stringify(
    {
      name: "my-react-app",
      version: "1.0.0",
      private: true,
      scripts: {
        start: "react-scripts start",
        build: "react-scripts build",
      },
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1",
        "react-router-dom": "^6.14.0",
      },
      devDependencies: {
        autoprefixer: "^10.4.12",
        postcss: "^8.4.16",
        tailwindcss: "^3.1.8",
      },
    },
    null,
    2
  );
}

export function generateTailwindConfig(): string {
  return `
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
  `.trim();
}

export function generatePostCssConfig(): string {
  return `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
  `.trim();
}

export function generateIndexCss(): string {
  return `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
  `.trim();
}

export function generateHeaderJs(): string {
  return `
import React from 'react';

function Header({ style, logoUrl, navLinks, backgroundColor, textColor, fontSize, fontWeight, onNavigate }) {
  const handleLinkClick = (url, e) => {
    e.preventDefault();
    if (url.startsWith('/')) {
      onNavigate(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div style={{ ...style, backgroundColor }} className="flex items-center justify-between p-4">
      <img src={logoUrl} alt="Logo" className="h-8" />
      <nav>
        {navLinks.map((link, index) => (
          <a 
            key={index} 
            href={link.url} 
            onClick={(e) => handleLinkClick(link.url, e)}
            style={{ color: textColor, fontSize, fontWeight }} 
            className="mx-2 cursor-pointer"
          >
            {link.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

export default Header;
  `.trim();
}

export function generateNavbarJs(): string {
  return `
import React from 'react';

function Navbar({ style, menuItems, backgroundColor, textColor, fontSize, fontWeight, onNavigate }) {
  const handleLinkClick = (url, e) => {
    e.preventDefault();
    if (url.startsWith('/')) {
      onNavigate(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <nav style={{ ...style, backgroundColor }} className="p-4">
      {menuItems.map((item, index) => (
        <a 
          key={index} 
          href={item.url} 
          onClick={(e) => handleLinkClick(item.url, e)}
          style={{ color: textColor, fontSize, fontWeight }} 
          className="mx-4 cursor-pointer"
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}

export default Navbar;
  `.trim();
}

export function generateJumbotronJs(): string {
  return `
import React from 'react';

function Jumbotron({ style, heading, subtext, buttonText, buttonUrl, backgroundColor, textColor, fontSize, fontWeight, onNavigate }) {
  const handleButtonClick = (e) => {
    e.preventDefault();
    if (buttonUrl.startsWith('/')) {
      onNavigate(buttonUrl);
    } else {
      window.open(buttonUrl, '_blank');
    }
  };

  return (
    <div style={{ ...style, backgroundColor }} className="text-center p-6">
      <h1 style={{ color: textColor, fontSize, fontWeight }} className="text-3xl font-bold">{heading}</h1>
      <p style={{ color: textColor }} className="mt-2">{subtext}</p>
      <a 
        href={buttonUrl} 
        onClick={handleButtonClick}
        className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
      >
        {buttonText}
      </a>
    </div>
  );
}

export default Jumbotron;
  `.trim();
}

export function generateTextBlockJs(): string {
  return `
import React from 'react';

function TextBlock({ style, content, textColor, fontSize, fontWeight }) {
  return (
    <div style={{ ...style, color: textColor, fontSize, fontWeight }} className="p-4">
      {content}
    </div>
  );
}

export default TextBlock;
  `.trim();
}

export function generateButtonElementJs(): string {
  return `
import React from 'react';

function ButtonElement({ style, text, linkTo, backgroundColor, textColor, fontSize, fontWeight, onNavigate }) {
  const handleClick = () => {
    if (linkTo && linkTo.startsWith('/')) {
      onNavigate(linkTo);
    } else if (linkTo) {
      window.open(linkTo, '_blank');
    }
  };

  return (
    <button 
      onClick={handleClick}
      style={{ ...style, backgroundColor, color: textColor, fontSize, fontWeight }} 
      className="px-4 py-2 rounded cursor-pointer"
    >
      {text}
    </button>
  );
}

export default ButtonElement;
  `.trim();
}

export function generateImageElementJs(): string {
  return `
import React from 'react';

function ImageElement({ style, imageUrl, linkTo, onNavigate }) {
  const handleClick = () => {
    if (linkTo && linkTo.startsWith('/')) {
      onNavigate(linkTo);
    } else if (linkTo) {
      window.open(linkTo, '_blank');
    }
  };

  return (
    <img 
      src={imageUrl} 
      alt="Element" 
      style={style} 
      className={linkTo ? "object-cover cursor-pointer" : "object-cover"}
      onClick={linkTo ? handleClick : undefined}
    />
  );
}

export default ImageElement;
  `.trim();
}
