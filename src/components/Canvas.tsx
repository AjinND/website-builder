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
        textColor: "#ffffff",
        fontSize: "16px",
        fontWeight: "normal",
      };
    case "button":
      return {
        text: "Click Me",
        backgroundColor: "#007bff",
        textColor: "#ffffff",
        fontSize: "16px",
        fontWeight: "bold",
      };
    case "image":
      return {
        imageUrl: "https://example.com/image.jpg",
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

interface CanvasProps {
  framework: string;
  device: Device;
}

export default function Canvas({ framework, device }: CanvasProps) {
  const [elements, setElements] = useState<DroppedElementType[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "element",
    drop: (item: { id?: number; type: string }, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = offset.x - canvasRect.left;
        const y = offset.y - canvasRect.top;
        if (item.id !== undefined) {
          setElements((prev) =>
            prev.map((el) => (el.id === item.id ? { ...el, x, y } : el))
          );
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
          setElements((prev) => [
            ...prev,
            {
              id: newId,
              type: item.type,
              x: x - width / 2,
              y: y - height / 2,
              width,
              height,
              properties: defaultProperties,
            },
          ]);
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const updateElementSize = (id: number, width: number, height: number) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, width, height } : el))
    );
  };

  const updateElementProperties = (
    id: number,
    newProperties: { [key: string]: any }
  ) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? { ...el, properties: { ...el.properties, ...newProperties } }
          : el
      )
    );
  };

  const generateZip = async () => {
    const zip = new JSZip();

    if (framework === "React") {
      // Generated code uses a full-screen responsive container.
      zip.file("src/App.js", generateAppJs(elements));
      const compFolder = zip.folder("src/components");
      compFolder?.file("Header.js", generateHeaderJs());
      compFolder?.file("Navbar.js", generateNavbarJs());
      compFolder?.file("Jumbotron.js", generateJumbotronJs());
      compFolder?.file("TextBlock.js", generateTextBlockJs());
      compFolder?.file("ButtonElement.js", generateButtonElementJs());
      compFolder?.file("ImageElement.js", generateImageElementJs());
      zip.file("src/index.js", generateIndexJs());
      zip.file("public/index.html", generateIndexHtml());
      zip.file("tailwind.config.js", generateTailwindConfig());
      zip.file("postcss.config.js", generatePostCssConfig());
      zip.file("package.json", generateReactPackageJson());
      zip.file("src/index.css", generateIndexCss());
    } else if (framework === "Angular") {
      // Angular generation remains similar.
      const appComponentHtml = generateAngularAppComponentHtml(elements);
      zip.file("src/app/app.component.html", appComponentHtml);
      zip.file("src/app/app.component.ts", generateAngularAppComponentTs());
      zip.file("src/app/app.module.ts", generateAngularAppModuleTs());
      zip.file("src/index.html", generateAngularIndexHtml());
      zip.file("package.json", generateAngularPackageJson());
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
            onSelect={() => setSelectedElementId(el.id)} // Pass selection callback
            isSelected={el.id === selectedElementId}
          />
        ))}
        <button
          onClick={generateZip}
          className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
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
          />
        </div>
      )}
    </div>
  );
}

// --------------------------
// React Code Generation Helpers (simplified for brevity)
// --------------------------
function generateAppJs(elements: DroppedElementType[]): string {
  const elementsMapping = elements
    .map((el) => JSON.stringify(el))
    .join(",\n  ");
  return `
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Jumbotron from './components/Jumbotron';
import TextBlock from './components/TextBlock';
import ButtonElement from './components/ButtonElement';
import ImageElement from './components/ImageElement';

const elements = [
  ${elementsMapping}
];

function App() {
  const designWidth = 1920; // Assume a default design width (can be dynamic)
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const newScale = window.innerWidth / designWidth;
      setScale(newScale);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [designWidth]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div style={{ transform: \`scale(\${scale})\`, transformOrigin: 'top left', width: designWidth }}>
        {elements.map(el => {
          const style = { left: el.x, top: el.y, width: el.width, height: el.height, position: 'absolute' };
          switch(el.type) {
            case 'header':
              return <Header key={el.id} style={style} {...el.properties} />;
            case 'navbar':
              return <Navbar key={el.id} style={style} {...el.properties} />;
            case 'jumbotron':
              return <Jumbotron key={el.id} style={style} {...el.properties} />;
            case 'text':
              return <TextBlock key={el.id} style={style} content={el.properties.content} />;
            case 'button':
              return <ButtonElement key={el.id} style={style} text={el.properties.text} />;
            case 'image':
              return <ImageElement key={el.id} style={style} imageUrl={el.properties.imageUrl} />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

export default App;
  `.trim();
}

function generateIndexJs(): string {
  return `
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
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
  `.trim();
}

// --------------------------
// Component Generators (React)
// --------------------------
function generateHeaderJs(): string {
  return `
import React from 'react';

function Header({ style, logoUrl, navLinks, backgroundColor, textColor, fontSize, fontWeight }) {
  return (
    <div style={{ ...style, backgroundColor }} className="flex items-center justify-between p-4">
      <img src={logoUrl} alt="Logo" className="h-8" />
      <nav>
        {navLinks.map((link, index) => (
          <a key={index} href={link.url} style={{ color: textColor, fontSize, fontWeight }} className="mx-2">
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

function Navbar({ style, menuItems, backgroundColor, textColor, fontSize, fontWeight }) {
  return (
    <nav style={{ ...style, backgroundColor }} className="p-4">
      {menuItems.map((item, index) => (
        <a key={index} href={item.url} style={{ color: textColor, fontSize, fontWeight }} className="mx-4">
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

function Jumbotron({ style, heading, subtext, buttonText, buttonUrl, backgroundColor, textColor, fontSize, fontWeight }) {
  return (
    <div style={{ ...style, backgroundColor }} className="text-center p-6">
      <h1 style={{ color: textColor, fontSize, fontWeight }} className="text-3xl font-bold">{heading}</h1>
      <p style={{ color: textColor }} className="mt-2">{subtext}</p>
      <a href={buttonUrl} className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
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

function ButtonElement({ style, text, backgroundColor, textColor, fontSize, fontWeight }) {
  return (
    <button style={{ ...style, backgroundColor, color: textColor, fontSize, fontWeight }} className="px-4 py-2 rounded">
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

function ImageElement({ style, imageUrl }) {
  return (
    <img src={imageUrl} alt="Element" style={style} className="object-cover" />
  );
}

export default ImageElement;
  `.trim();
}

// --------------------------
// (Angular generation functions remain unchanged)
// --------------------------
function generateAngularAppComponentHtml(
  elements: DroppedElementType[]
): string {
  return "<!-- Angular app component template -->";
}

function generateAngularAppComponentTs(): string {
  return `
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-angular-app';
}
  `.trim();
}

function generateAngularAppModuleTs(): string {
  return `
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
  `.trim();
}

function generateAngularIndexHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My Angular App</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
  `.trim();
}

function generateAngularPackageJson(): string {
  return JSON.stringify(
    {
      name: "my-angular-app",
      version: "1.0.0",
      private: true,
      scripts: {
        start: "ng serve",
        build: "ng build",
      },
      dependencies: {
        "@angular/animations": "~15.0.0",
        "@angular/common": "~15.0.0",
        "@angular/compiler": "~15.0.0",
        "@angular/core": "~15.0.0",
        "@angular/forms": "~15.0.0",
        "@angular/platform-browser": "~15.0.0",
        "@angular/platform-browser-dynamic": "~15.0.0",
        "@angular/router": "~15.0.0",
        rxjs: "~7.5.0",
        tslib: "^2.3.0",
        "zone.js": "~0.12.0",
      },
      devDependencies: {
        "@angular-devkit/build-angular": "~15.0.0",
        "@angular/cli": "~15.0.0",
        "@angular/compiler-cli": "~15.0.0",
        typescript: "~4.8.0",
      },
    },
    null,
    2
  );
}
