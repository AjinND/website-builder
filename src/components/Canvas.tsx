"use client";

import React, { useState, useRef } from "react";
import { useDrop } from "react-dnd";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import DroppedElement from "./DroppedElement";
import StyleEditor from "./StyleEditor";
import { getDefaultProperties } from "@/utils/defaultProperties";
import {
  generateAppJs,
  generateAppRouterJs,
  generatePageJs,
  generateIndexJs,
  generateIndexHtml,
  generateReactPackageJson,
  generateTailwindConfig,
  generatePostCssConfig,
  generateIndexCss,
  generateHeaderJs,
  generateNavbarJs,
  generateJumbotronJs,
  generateTextBlockJs,
  generateButtonElementJs,
  generateImageElementJs,
} from "@/utils/codeGenerators";
import { CanvasProps, DroppedElementType } from "@/types/types";

export default function Canvas({
  framework,
  device,
  elements = [],
  updateElements,
  allPages,
}: CanvasProps) {
  const [selectedElementId, setSelectedElementId] = useState<number | null>(
    null
  );
  // State for additional vertical space
  const [extraHeight, setExtraHeight] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const safeUpdateElements = (newElements: DroppedElementType[]) => {
    if (typeof updateElements === "function") {
      updateElements(
        newElements.map((el) => ({
          ...el,
          x: Math.max(0, Math.min(device.width - el.width, el.x)),
          y: Math.max(
            0,
            Math.min(device.height + extraHeight - el.height, el.y)
          ),
        }))
      );
    }
  };

  // New function to delete an element by its id
  const deleteElement = (id: number) => {
    const updatedElements = elements.filter((el) => el.id !== id);
    safeUpdateElements(updatedElements);
    setSelectedElementId(null);
  };

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "element",
      drop: (item: { id?: number; type: string }, monitor) => {
        const offset =
          monitor.getSourceClientOffset() || monitor.getClientOffset();
        if (!offset || !canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = offset.x - canvasRect.left;
        const y = offset.y - canvasRect.top;

        if (item.id !== undefined) {
          const updatedElements = elements.map((el) =>
            el.id === item.id ? { ...el, x, y } : el
          );
          safeUpdateElements(updatedElements);
        } else {
          const newId =
            elements.length > 0
              ? Math.max(...elements.map((el) => el.id)) + 1
              : 1;
          const width = ["header", "navbar", "jumbotron"].includes(item.type)
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
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [elements, device, extraHeight, updateElements]
  );

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
      zip.file("src/App.js", generateAppJs(allPages));
      zip.file("src/index.js", generateIndexJs());
      zip.file("src/index.css", generateIndexCss());

      // Only generate component code for components that are actually used
      const compFolder = zip.folder("src/components");
      const usedComponents = new Set<string>();
      allPages.forEach((page) => {
        page.elements.forEach((el: any) => {
          usedComponents.add(el.type);
        });
      });

      if (usedComponents.has("header")) {
        compFolder?.file("Header.js", generateHeaderJs());
      }
      if (usedComponents.has("navbar")) {
        compFolder?.file("Navbar.js", generateNavbarJs());
      }
      if (usedComponents.has("jumbotron")) {
        compFolder?.file("Jumbotron.js", generateJumbotronJs());
      }
      if (usedComponents.has("text")) {
        compFolder?.file("TextBlock.js", generateTextBlockJs());
      }
      if (usedComponents.has("button")) {
        compFolder?.file("ButtonElement.js", generateButtonElementJs());
      }
      if (usedComponents.has("image")) {
        compFolder?.file("ImageElement.js", generateImageElementJs());
      }

      const pagesFolder = zip.folder("src/pages");
      allPages.forEach((page) => {
        pagesFolder?.file(
          `${page.name.replace(/\s+/g, "")}.js`,
          generatePageJs(page)
        );
      });
      zip.file("src/AppRouter.js", generateAppRouterJs(allPages));
      zip.file("public/index.html", generateIndexHtml());
      zip.file("tailwind.config.js", generateTailwindConfig());
      zip.file("postcss.config.js", generatePostCssConfig());
      zip.file("package.json", generateReactPackageJson());
    } else if (framework === "Angular") {
      zip.file("README.txt", "Angular multi-page generation to be implemented");
    } else {
      zip.file("README.txt", "Vue project generation is not implemented yet.");
    }
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `my-${framework.toLowerCase()}-app.zip`);
  };

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
          // The canvas height is defined by the device height plus any extra space added.
          minWidth: device.width,
          minHeight: device.height + extraHeight,
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
      {/* "Add More Space" button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setExtraHeight(extraHeight + 300)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Add More Space
        </button>
      </div>
      {selectedElement && (
        <div className="mt-4">
          <h3 className="text-white">
            Style Editor for Element {selectedElement.id}
          </h3>
          <StyleEditor
            properties={selectedElement.properties}
            onChange={(newStyles) =>
              updateElementProperties(selectedElement.id, newStyles)
            }
            elementType={selectedElement.type}
            availablePages={allPages}
          />
          {/* Delete Button */}
          <div className="mt-2">
            <button
              onClick={() => deleteElement(selectedElement.id)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete Element
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
