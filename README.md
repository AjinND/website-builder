# Website Builder

A powerful drag-and-drop website builder that helps you design and generate code for web applications across multiple frameworks.

## Overview

Website Builder is a modern visual development tool that allows you to design websites through an intuitive drag-and-drop interface. Once your design is complete, you can generate all the necessary code files for your project in your chosen framework.

![Website Builder Screenshot](./public/screenshot/website-builder.png)

## Features

- **Visual Drag-and-Drop Interface**: Design your website without writing code
- **Multi-Page Support**: Create, rename, duplicate, and manage multiple pages for your website
- **Responsive Design**: Preview and optimize your design for different device sizes (Desktop, Laptop, Tablet, Mobile)
- **Nested Components**: Add components inside containers for complex layouts
- **Dark/Light Theme**: Switch between dark and light themes for the editor interface
- **Extensive Component Library**: Pre-built components including:
  - Layout elements (Header, Navbar, Jumbotron, Footer, Divider, Container)
  - Content elements (Text, Heading, Card, List)
  - Interactive elements (Button, Form, Input)
  - Media elements (Image, Video, Icon)
- **Framework Selection**: Generate code for different frameworks (React fully supported, Angular and Vue coming soon)
- **Code Generation**: Download a complete, ready-to-run project with all necessary files
- **Detailed Property Customization**: Fine-tune the appearance and behavior of each component
- **Page Navigation**: Link components to navigate between pages
- **Movable Toolbox**: Drag the toolbox anywhere on the screen or dock it to either side
- **Redux State Management**: Efficient state management for elements, pages, and theme
- **TypeScript Support**: Full type safety and better development experience
- **Improved Component Architecture**: Better separation of concerns and reusable components
- **Enhanced Drag and Drop**: Improved drag and drop functionality with proper handling of nested elements
- **Improved Element Positioning**: Better handling of element positioning and resizing
- **Intuitive Canvas Layout**: Properly centered canvas with improved element visibility
- **Robust Element Interaction**: Improved handling of element selection, repositioning, and resizing
- **Persistent State**: Save your work automatically with Redux Persist
- **Advanced Style Editor**: Categorized style and content properties for easier editing
- **Responsive Element Scaling**: Elements automatically scale when changing device sizes

## Recent Updates

- **Redux Persist Integration**: Added persistent storage to save your work automatically
- **Advanced Style Editor**: Implemented tabbed interface with categorized properties for style and content
- **Responsive Element Scaling**: Elements now automatically adjust when switching between device sizes
- **Enhanced Element Constraints**: Improved boundary constraints for elements within containers
- **Optimized Performance**: Reduced unnecessary re-renders with throttled updates
- **Improved Nested Elements**: Better handling of parent-child relationships for nested components
- **Canvas Scaling**: Automatic canvas scaling based on available screen space
- **Element Path Breadcrumb**: Added navigation for nested element hierarchy
- **Expanded Component Properties**: More customization options for all component types
- **Improved Code Generation**: Enhanced generated code with better component structure
- **Bug Fixes**: Fixed issues with element positioning, NaN errors, and improved visibility of elements on the canvas
- **Canvas Improvements**: Fixed canvas positioning and scaling issues for better usability
- **Element Interaction Fixes**: Resolved issues with element repositioning and resizing, preventing errors when elements are deleted during interaction
- **Updated Dependencies**: Upgraded to Next.js 15, React 19, and Tailwind CSS 4

## Supported Frameworks

- **React**: Full support with React Router for multi-page applications
- **Angular**: Limited support (coming soon)
- **Vue**: Limited support (coming soon)

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AjinND/website-builder.git
cd website-builder
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How to Use

1. **Select a Framework**: Choose your target framework (React, Angular, or Vue)
2. **Choose a Device Size**: Select the device size to design for (Desktop, Laptop, Tablet, Mobile)
3. **Build Your Pages**:
   - Drag elements from the toolbox onto the canvas
   - Click on elements to edit their properties in the style editor
   - Add multiple pages using the + button in the page tabs
   - Rename, duplicate, or delete pages as needed
   - Set up navigation between pages
4. **Generate Code**: Click the "Generate Code" button to download a zip file with all your project files
5. **Run Your Project**: Extract the zip file and follow the instructions in the generated README to run your project locally

## Working with Components

### Available Components

#### Layout Elements
- **Header**: Page header with logo and navigation links
- **Navbar**: Navigation menu for your website
- **Jumbotron**: Hero section with heading, text, and call to action
- **Footer**: Page footer with links and copyright information
- **Divider**: Horizontal divider to separate content sections
- **Container**: Container to group and organize elements
- **Div**: Flexible div element for custom layouts

#### Content Elements
- **Text**: Simple text content blocks
- **Heading**: Section heading with customizable size (h1-h5)
- **Card**: Card with title, content, image, and action button
- **List**: Ordered or unordered list of items

#### Interactive Elements
- **Button**: Clickable buttons with customizable action
- **Form**: Input form with customizable fields
- **Input**: Text input field with various input types

#### Media Elements
- **Image**: Image element with optional link
- **Video**: Embedded video player
- **Icon**: Icon with customizable style

### Editing Components

1. Click on any component on the canvas to select it
2. Use the style editor panel to modify its properties:
   - Switch between Style and Content tabs to find relevant properties
   - Change text content, colors, and font styles
   - Set up links to other pages or external URLs
   - Customize component-specific properties
   - Adjust positioning and sizing
   - Add or remove items from array properties (like navigation links)

### Working with Containers

1. Drag a container element onto the canvas
2. Drag other elements into the container
3. Elements inside containers can be positioned relative to the container
4. Containers can be resized to accommodate their contents
5. Nested containers support unlimited depth of component hierarchy

## Generated Project Structure

When you generate code for a React project, you'll receive a zip file with the following structure:

```
my-react-app/
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── public/
│   └── index.html
└── src/
    ├── App.js
    ├── AppRouter.js
    ├── index.js
    ├── index.css
    ├── components/
    │   ├── Header.js
    │   ├── Navbar.js
    │   ├── Jumbotron.js
    │   ├── TextBlock.js
    │   ├── ButtonElement.js
    │   ├── ImageElement.js
    │   ├── ContainerElement.js
    │   ├── DivElement.js
    │   ├── CardElement.js
    │   └── [Other Components].js
    └── pages/
        ├── Home.js
        └── [OtherPages].js
```

## Running the Generated Project

1. Extract the zip file
2. Navigate to the project directory
3. Install dependencies:
```bash
npm install
# or
yarn install
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see your website

## Development

This project was built using:

- [Next.js 15](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [React DnD](https://react-dnd.github.io/react-dnd/) - Drag and drop for React
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Redux Persist](https://github.com/rt2zz/redux-persist) - Persistent state storage
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- [JSZip](https://stuk.github.io/jszip/) - JavaScript library for creating zip files
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Lodash](https://lodash.com/) - Utility library
- [OpenAI API](https://openai.com/) - For AI-assisted features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- Full support for React, Angular and Vue frameworks
- Implement fully responsive design
- Additional components (carousels, tabs, accordions, etc.)
- Custom CSS editor
- Template library
- Enhance AI integration for code generation and design assistance
- Collaborative editing
- Real-Time preview to see your changes instantly as you build
- Component reuse across pages
- Export to popular hosting platforms
- Component library integration
- Undo/redo functionality
- Advanced animation options