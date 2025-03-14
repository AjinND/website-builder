"use client";

import React, { useState, useRef } from "react";
import { useDrop } from "react-dnd";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import DroppedElement from "./DroppedElement";
import StyleEditor from "./StyleEditor";

// Extend default properties for new elements to include styling.
const getDefaultProperties = (type: string) => {
  switch (type) {
    case "header":
      return {
        logoUrl: "https://example.com/logo.png",
        navLinks: [
          { text: "Home", url: "/" },
          { text: "About", url: "/about" },
          { text: "Contact", url: "/contact" },
        ],
        backgroundColor: "#333333",
        textColor: "#ffffff",
        fontSize: "16px",
        fontWeight: "normal",
      };
    case "navbar":
      return {
        menuItems: [
          { text: "Home", url: "/" },
          { text: "About", url: "/about" },
          { text: "Contact", url: "/contact" },
        ],
        backgroundColor: "#333333",
        textColor: "#ffffff",
        fontSize: "16px",
        fontWeight: "normal",
      };
    case "jumbotron":
      return {
        heading: "Welcome to My Website",
        subtext: "This is a sample jumbotron.",
        buttonText: "Learn More",
        buttonUrl: "/learn-more",
        backgroundColor: "#444444",
        textColor: "#ffffff",
        fontSize: "18px",
        fontWeight: "bold",
      };
    case "text":
      return {
        content: "Sample Text",
        textColor: "#000000",
        fontSize: "16px",
        fontWeight: "normal",
      };
    case "button":
      return {
        text: "Click Me",
        linkTo: "", // Page to link to
        backgroundColor: "#007bff",
        textColor: "#ffffff",
        fontSize: "16px",
        fontWeight: "bold",
      };
    case "image":
      return {
        imageUrl: "https://example.com/image.jpg",
        linkTo: "", // Page to link to
      };
    default:
      return {};
  }
};

export interface DroppedElementType {
  id: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: { [key: string]: any };
}

interface Device {
  name: string;
  width: number;
  height: number;
}

interface Page {
  id: string;
  name: string;
  elements: DroppedElementType[];
}

interface CanvasProps {
  framework: string;
  device: Device;
  elements: DroppedElementType[];
  updateElements: (elements: DroppedElementType[]) => void;
  allPages: Page[];
}

export default function Canvas({ framework, device, elements = [], updateElements, allPages }: CanvasProps) {
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(Math.max(0, ...elements.map(el => el.id)) + 1);

  const safeUpdateElements = (newElements: DroppedElementType[]) => {
    if (typeof updateElements === 'function') {
      updateElements(newElements.map(el => ({
        ...el,
        x: Math.max(0, Math.min(device.width - el.width, el.x)), // Ensures it's within canvas
        y: Math.max(0, Math.min(device.height - el.height, el.y))
      })));
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "element",
    drop: (item: { id?: number; type: string }, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = offset.x - canvasRect.left;
        const y = offset.y - canvasRect.top;
        if (item.id !== undefined) {
          const updatedElements = elements.map((el) => 
            el.id === item.id ? { ...el, x, y } : el
          );
          safeUpdateElements(updatedElements);
        } else {
          const newId = nextId.current;
          nextId.current += 1;
          const width =
            item.type === "header" ||
            item.type === "navbar" ||
            item.type === "jumbotron"
              ? 300
              : 100;
          const height = item.type === "jumbotron" ? 200 : 50;
          const defaultProperties = getDefaultProperties(item.type);
          const newElements = [
            ...elements,
            {
              id: newId,
              type: item.type,
              x: x - width / 2,
              y: y - height / 2,
              width,
              height,
              properties: defaultProperties,
            },
          ];
          safeUpdateElements(newElements);
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const updateElementSize = (id: number, width: number, height: number) => {
    const updatedElements = elements.map((el) => 
      el.id === id ? { ...el, width, height } : el
    );
    safeUpdateElements(updatedElements);
  };

  const updateElementProperties = (
    id: number,
    newProperties: { [key: string]: any }
  ) => {
    const updatedElements = elements.map((el) =>
      el.id === id
        ? { ...el, properties: { ...el.properties, ...newProperties } }
        : el
    );
    safeUpdateElements(updatedElements);
  };

  const generateZip = async () => {
    const zip = new JSZip();

    if (framework === "React") {
      // Generate files for React
      zip.file("src/App.js", generateAppJs(allPages));
      zip.file("src/index.js", generateIndexJs());
      zip.file("src/index.css", generateIndexCss());
      
      // Generate component files
      const compFolder = zip.folder("src/components");
      compFolder?.file("Header.js", generateHeaderJs());
      compFolder?.file("Navbar.js", generateNavbarJs());
      compFolder?.file("Jumbotron.js", generateJumbotronJs());
      compFolder?.file("TextBlock.js", generateTextBlockJs());
      compFolder?.file("ButtonElement.js", generateButtonElementJs());
      compFolder?.file("ImageElement.js", generateImageElementJs());
      
      // Generate page components
      const pagesFolder = zip.folder("src/pages");
      allPages.forEach(page => {
        pagesFolder?.file(`${page.name.replace(/\s+/g, '')}.js`, generatePageJs(page));
      });
      
      // Generate routing
      zip.file("src/AppRouter.js", generateAppRouterJs(allPages));
      
      // Generate config files
      zip.file("public/index.html", generateIndexHtml());
      zip.file("tailwind.config.js", generateTailwindConfig());
      zip.file("postcss.config.js", generatePostCssConfig());
      zip.file("package.json", generateReactPackageJson());
    } else if (framework === "Angular") {
      // Angular generation code...
      zip.file("README.txt", "Angular multi-page generation to be implemented");
    } else {
      zip.file("README.txt", "Vue project generation is not implemented yet.");
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `my-${framework.toLowerCase()}-app.zip`);
  };

  // Find the currently selected element
  const selectedElement = elements.find((el) => el.id === selectedElementId);

  return (
    <div>
      <div
        ref={(node) => {
          drop(node);
          canvasRef.current = node;
        }}
        className={`relative mx-auto border border-gray-600 ${
          isOver ? "bg-gray-700" : "bg-gray-900"
        }`}
        style={{
          width: device.width,
          height: device.height,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.05) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.05) 20px)",
        }}
      >
        {elements.map((el) => (
          <DroppedElement
            key={el.id}
            element={el}
            onResize={updateElementSize}
            onPropertiesChange={updateElementProperties}
            onSelect={() => setSelectedElementId(el.id)}
            isSelected={el.id === selectedElementId}
            availablePages={allPages}
          />
        ))}
        <button
          onClick={generateZip}
          className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Code
        </button>
      </div>
      {selectedElement && (
        <div className="mt-4">
          <h3 className="text-white">Style Editor for Element {selectedElement.id}</h3>
          <StyleEditor
            properties={selectedElement.properties}
            onChange={(newStyles) =>
              updateElementProperties(selectedElement.id, newStyles)
            }
            elementType={selectedElement.type}
            availablePages={allPages}
          />
        </div>
      )}
    </div>
  );
}

// --------------------------
// React Code Generation Helpers
// --------------------------
// ...existing code...
function generateAppJs(pages: Page[]): string {
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

function generateAppRouterJs(pages: Page[]): string {
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

function generatePageJs(page: Page): string {
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

function generateIndexJs(): string {
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

function generateIndexHtml(): string {
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

function generateReactPackageJson(): string {
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

function generateTailwindConfig(): string {
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

function generatePostCssConfig(): string {
  return `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
  `.trim();
}

function generateIndexCss(): string {
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

// --------------------------
// Component Generators (React)
// --------------------------
function generateHeaderJs(): string {
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

function generateNavbarJs(): string {
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

function generateJumbotronJs(): string {
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

function generateTextBlockJs(): string {
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

function generateButtonElementJs(): string {
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

function generateImageElementJs(): string {
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