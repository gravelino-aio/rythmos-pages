# Rythmos Hardware Documentation Library

This project automates the generation of 21 hardware datasheets for the Rythmos platform. It uses a JSON-based data source and a central HTML template to produce high-end, responsive documentation pages.

## How to Use

### 1. Requirements
Ensure you have **Node.js** installed on your system.

### 2. Generating the Pages
To build/update all documentation pages, run the following command in your terminal:

```bash
node generate.js
```

This will process `data.json` and generate 21 HTML files in the `/dist` folder.

### 3. How to View the Files
The generated files are standalone HTML documents and can be viewed directly in any modern web browser.

1.  Navigate to the `/dist` folder.
2.  Double-click any `.html` file (e.g., `kallos-wearable.html`) to open it in your browser.

**Important Note:** To see images and icons correctly, ensure the `/dist` folder remains in the same parent directory as the `/images` and `/style.css` files. The project uses relative paths to maintain visual integrity.

## Project Structure
*   `data.json`: The single source of truth for all device specifications and descriptions.
*   `template.html`: The master layout used for all generated pages.
*   `generate.js`: The automation script that maps data to the template.
*   `/dist`: Contains the final generated HTML files.
*   `/images`: Centralized asset library for all hardware devices.
*   `style.css`: Master stylesheet for the documentation library.
