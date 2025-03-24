import { StyleEditorProps } from "@/types/types";
import React from "react";

export default function StyleEditor({
  properties,
  onChange,
  elementType,
  availablePages,
  isDarkTheme = true
}: StyleEditorProps) {

  // Helper function to get theme-appropriate class names for inputs
  const getInputClassName = (baseClasses: string) => {
    return `${baseClasses} ${isDarkTheme ? 'bg-gray-700 text-white' : 'bg-white text-gray-800 border border-gray-300'}`;
  };
  const renderCommonStyles = () => (
    <>
      <label className="block mb-2">
        Text Color:
        <input
          type="color"
          value={properties.textColor || "#ffffff"}
          onChange={(e) => onChange({ textColor: e.target.value })}
          className="ml-2"
        />
      </label>
      <label className="block mb-2">
        Font Size:
        <input
          type="number"
          value={parseInt(properties.fontSize) || 16}
          onChange={(e) => onChange({ fontSize: `${e.target.value}px` })}
          className={getInputClassName('ml-2 w-16')}
        />
      </label>
      <label className="block mb-2">
        Font Weight:
        <select
          value={properties.fontWeight || "normal"}
          onChange={(e) => onChange({ fontWeight: e.target.value })}
          className={getInputClassName('ml-2')}
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="lighter">Lighter</option>
        </select>
      </label>
      {(elementType === "header" || elementType === "navbar" || elementType === "jumbotron" || elementType === "button") && (
        <label className="block mb-2">
          Background Color:
          <input
            type="color"
            value={properties.backgroundColor || "#333333"}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            className="ml-2"
          />
        </label>
      )}
    </>
  );

  const renderLinkSelector = (linkProperty: string, label: string = "Link To Page") => (
    <label className="block mb-2">
      {label}:
      <select
        value={properties[linkProperty] || ""}
        onChange={(e) => onChange({ [linkProperty]: e.target.value })}
        className="ml-2 bg-gray-700 text-white"
      >
        <option value="">None</option>
        {availablePages.map(page => (
          <option key={page.id} value={`/${page.name.toLowerCase()}`}>
            {page.name}
          </option>
        ))}
        <option value="#external">External URL</option>
      </select>
      {properties[linkProperty] === "#external" && (
        <input
          type="text"
          placeholder="https://example.com"
          value={properties.externalUrl || ""}
          onChange={(e) => onChange({ externalUrl: e.target.value, [linkProperty]: e.target.value })}
          className="mt-1 w-full bg-gray-700 text-white p-1"
        />
      )}
    </label>
  );

  const renderElementSpecificFields = () => {
    switch (elementType) {
      case "header":
        return (
          <>
            <label className="block mb-2">
              Logo URL:
              <input
                type="text"
                value={properties.logoUrl || ""}
                onChange={(e) => onChange({ logoUrl: e.target.value })}
                className={getInputClassName('ml-2 w-full')}
              />
            </label>
            <div className="block mb-2">
              <label>Navigation Links:</label>
              {properties.navLinks && properties.navLinks.map((link: any, index: number) => (
                <div key={index} className="flex items-center mt-1">
                  <input
                    type="text"
                    value={link.text}
                    onChange={(e) => {
                      const newLinks = [...properties.navLinks];
                      newLinks[index].text = e.target.value;
                      onChange({ navLinks: newLinks });
                    }}
                    className="w-1/2 mr-1 bg-gray-700 text-white p-1"
                    placeholder="Link Text"
                  />
                  <select
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...properties.navLinks];
                      newLinks[index].url = e.target.value;
                      onChange({ navLinks: newLinks });
                    }}
                    className="w-1/2 bg-gray-700 text-white p-1"
                  >
                    {availablePages.map(page => (
                      <option key={page.id} value={`/${page.name.toLowerCase()}`}>
                        {page.name}
                      </option>
                    ))}
                    <option value="#external">External URL</option>
                  </select>
                  {link.url === "#external" && (
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={link.externalUrl || ""}
                      onChange={(e) => {
                        const newLinks = [...properties.navLinks];
                        newLinks[index].externalUrl = e.target.value;
                        newLinks[index].url = e.target.value;
                        onChange({ navLinks: newLinks });
                      }}
                      className="w-full mt-1 bg-gray-700 text-white p-1"
                    />
                  )}
                  <button
                    onClick={() => {
                      const newLinks = properties.navLinks.filter((_: any, i: number) => i !== index);
                      onChange({ navLinks: newLinks });
                    }}
                    className="ml-1 bg-red-500 text-white p-1 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newLinks = [...(properties.navLinks || []), { text: "New Link", url: "/" }];
                  onChange({ navLinks: newLinks });
                }}
                className="mt-1 bg-gray-700 text-white p-1 rounded"
              >
                + Add Link
              </button>
            </div>
          </>
        );
      case "navbar":
        return (
          <>
            <div className="block mb-2">
              <label>Menu Items:</label>
              {properties.menuItems && properties.menuItems.map((item: any, index: number) => (
                <div key={index} className="flex items-center mt-1">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...properties.menuItems];
                      newItems[index].text = e.target.value;
                      onChange({ menuItems: newItems });
                    }}
                    className="w-1/2 mr-1 bg-gray-700 text-white p-1"
                    placeholder="Menu Text"
                  />
                  <select
                    value={item.url}
                    onChange={(e) => {
                      const newItems = [...properties.menuItems];
                      newItems[index].url = e.target.value;
                      onChange({ menuItems: newItems });
                    }}
                    className="w-1/2 bg-gray-700 text-white p-1"
                  >
                    {availablePages.map(page => (
                      <option key={page.id} value={`/${page.name.toLowerCase()}`}>
                        {page.name}
                      </option>
                    ))}
                    <option value="#external">External URL</option>
                  </select>
                  {item.url === "#external" && (
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={item.externalUrl || ""}
                      onChange={(e) => {
                        const newItems = [...properties.menuItems];
                        newItems[index].externalUrl = e.target.value;
                        newItems[index].url = e.target.value;
                        onChange({ menuItems: newItems });
                      }}
                      className="w-full mt-1 bg-gray-700 text-white p-1"
                    />
                  )}
                  <button
                    onClick={() => {
                      const newItems = properties.menuItems.filter((_: any, i: number) => i !== index);
                      onChange({ menuItems: newItems });
                    }}
                    className="ml-1 bg-red-500 text-white p-1 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newItems = [...(properties.menuItems || []), { text: "New Item", url: "/" }];
                  onChange({ menuItems: newItems });
                }}
                className="mt-1 bg-gray-700 text-white p-1 rounded"
              >
                + Add Item
              </button>
            </div>
          </>
        );
      case "jumbotron":
        return (
          <>
            <label className="block mb-2">
              Heading:
              <input
                type="text"
                value={properties.heading || ""}
                onChange={(e) => onChange({ heading: e.target.value })}
                className="ml-2 w-full bg-gray-700 text-white p-1"
              />
            </label>
            <label className="block mb-2">
              Subtext:
              <textarea
                value={properties.subtext || ""}
                onChange={(e) => onChange({ subtext: e.target.value })}
                className="ml-2 w-full bg-gray-700 text-white p-1"
                rows={3}
              />
            </label>
            <label className="block mb-2">
              Button Text:
              <input
                type="text"
                value={properties.buttonText || ""}
                onChange={(e) => onChange({ buttonText: e.target.value })}
                className="ml-2 w-full bg-gray-700 text-white p-1"
              />
            </label>
            {renderLinkSelector("buttonUrl", "Button Links To")}
          </>
        );
      case "text":
        return (
          <>
            <label className="block mb-2">
              Content:
              <textarea
                value={properties.content || ""}
                onChange={(e) => onChange({ content: e.target.value })}
                className="ml-2 w-full bg-gray-700 text-white p-1"
                rows={4}
              />
            </label>
          </>
        );
      case "button":
        return (
          <>
            <label className="block mb-2">
              Button Text:
              <input
                type="text"
                value={properties.text || ""}
                onChange={(e) => onChange({ text: e.target.value })}
                className="ml-2 w-full bg-gray-700 text-white p-1"
              />
            </label>
            {renderLinkSelector("linkTo")}
          </>
        );
      case "image":
        return (
          <>
            <label className="block mb-2">
              Image URL:
              <input
                type="text"
                value={properties.imageUrl || ""}
                onChange={(e) => onChange({ imageUrl: e.target.value })}
                className="ml-2 w-full bg-gray-700 text-white p-1"
              />
            </label>
            {renderLinkSelector("linkTo")}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`p-4 ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border border-gray-300'}`}>
      {renderCommonStyles()}
      {renderElementSpecificFields()}
    </div>
  );
}