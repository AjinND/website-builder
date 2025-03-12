"use client";

import React, { useState, useRef } from "react";
import { useDrop } from "react-dnd";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import DroppedElement from "./DroppedElement";

// Define the interface for dropped elements
export interface DroppedElementType {
  id: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
}

interface CanvasProps {
  framework: string;
}

export default function Canvas({ framework }: CanvasProps) {
  const [elements, setElements] = useState<DroppedElementType[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  // Set up the drop zone for drag-and-drop
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "element",
    drop: (item: { id?: number; type: string }, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = offset.x - canvasRect.left;
        const y = offset.y - canvasRect.top;
        // If dragging an existing element, update its position; for new ones, center it on drop.
        if (item.id !== undefined) {
          setElements((prev) =>
            prev.map((el) => (el.id === item.id ? { ...el, x, y } : el))
          );
        } else {
          const newId = nextId.current;
          nextId.current += 1;
          const width = 100;
          const height = 50;
          setElements((prev) => [
            ...prev,
            {
              id: newId,
              type: item.type,
              x: x - width / 2,
              y: y - height / 2,
              width,
              height,
              content: item.type === "button" ? "Click Me" : "Sample Text",
            },
          ]);
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Callback to update an element's size
  const updateElementSize = (id: number, width: number, height: number) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, width, height } : el))
    );
  };

  // Callback to update an element's content
  const updateElementContent = (id: number, content: string) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content } : el))
    );
  };

  // Function to generate and download the ZIP file
  const generateZip = async () => {
    const zip = new JSZip();

    if (framework === "React") {
      const appJsContent = generateAppJs(elements);
      zip.file("src/App.js", appJsContent);

      const indexJsContent = generateIndexJs();
      zip.file("src/index.js", indexJsContent);

      const indexHtmlContent = generateIndexHtml();
      zip.file("public/index.html", indexHtmlContent);

      const packageJsonContent = generateReactPackageJson();
      zip.file("package.json", packageJsonContent);
    } else if (framework === "Angular") {
      // Generate simplified Angular project files
      const appComponentHtml = generateAngularAppComponentHtml(elements);
      zip.file("src/app/app.component.html", appComponentHtml);

      const appComponentTs = generateAngularAppComponentTs();
      zip.file("src/app/app.component.ts", appComponentTs);

      const appModuleTs = generateAngularAppModuleTs();
      zip.file("src/app/app.module.ts", appModuleTs);

      const angularIndexHtml = generateAngularIndexHtml();
      zip.file("src/index.html", angularIndexHtml);

      const packageJsonContent = generateAngularPackageJson();
      zip.file("package.json", packageJsonContent);
    } else {
      // For Vue or others, add a placeholder
      zip.file("README.txt", "Vue project generation is not implemented yet.");
    }

    // Create the ZIP file and trigger the download
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `my-${framework.toLowerCase()}-app.zip`);
  };

  return (
    <div
      ref={(node) => {
        drop(node);
        canvasRef.current = node;
      }}
      className={`flex-1 relative w-full ${
        isOver ? "bg-gray-700" : "bg-gray-900"
      }`}
      style={{
        minHeight: "calc(100vh - 100px)",
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.05) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.05) 20px)",
      }}
    >
      {elements.map((el) => (
        <DroppedElement
          key={el.id}
          element={el}
          onResize={updateElementSize}
          onContentChange={updateElementContent}
        />
      ))}
      <button
        onClick={generateZip}
        className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </div>
  );
}

// Helper functions for React project generation
function generateAppJs(elements: DroppedElementType[]): string {
  const components = elements
    .map((el) => {
      const style = `position: 'absolute', left: '${el.x}px', top: '${el.y}px', width: '${el.width}px', height: '${el.height}px'`;
      if (el.type === "button") {
        return `<button style={{ ${style} }}>${el.content}</button>`;
      } else {
        return `<div style={{ ${style} }}>${el.content}</div>`;
      }
    })
    .join("\n      ");

  return `
import React from 'react';

function App() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      ${components}
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
    },
    null,
    2
  );
}

// Helper functions for Angular project generation
function generateAngularAppComponentHtml(
  elements: DroppedElementType[]
): string {
  const components = elements
    .map((el) => {
      const style = `position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px;`;
      if (el.type === "button") {
        return `<button style="${style}">${el.content}</button>`;
      } else {
        return `<div style="${style}">${el.content}</div>`;
      }
    })
    .join("\n");
  return `<div style="position: relative; width: 100vw; height: 100vh;">
${components}
</div>`;
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
