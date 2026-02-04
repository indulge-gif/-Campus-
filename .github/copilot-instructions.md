# Copilot Instructions for Campus Project

## Project Overview
This repository contains the code for the WeChat Mini Program "民大Campus导航". The project is designed to provide navigation and related functionalities for users within the campus environment.

## Project Structure
The project is organized as follows:

- `Codes/`: Contains the main source code for the WeChat Mini Program.
  - `app.js`, `app.json`, `app.wxss`: Entry point and global configuration for the Mini Program.
  - `pages/`: Contains the individual pages of the Mini Program.
    - `about/`, `advancedSearch/`, `detail/`, `home/`, `locations/`, `splash/`: Each folder represents a page and includes the corresponding `.js`, `.json`, `.wxml`, and `.wxss` files.
  - `utils/`: Utility functions and shared logic, such as `locations.js`.
- `project.config.json`: Configuration file for the Mini Program project.
- `project.private.config.json`: Private configuration file for the project.
- `README.md`: Overview of the project.
- `.vscode/`: Contains VS Code-specific settings.

## Key Development Practices

1. **WeChat Mini Program Structure**:
   - Each page consists of four files: `.js` (logic), `.json` (page configuration), `.wxml` (markup), and `.wxss` (styles).
   - The `app.js`, `app.json`, and `app.wxss` files define global settings and behaviors.

2. **Utility Functions**:
   - Shared logic is stored in the `utils/` directory. For example, `utils/locations.js` likely contains reusable functions related to location handling.

3. **Configuration Files**:
   - `project.config.json` and `project.private.config.json` are critical for project setup and deployment. Ensure these files are correctly configured before building or deploying the Mini Program.

## Developer Workflows

1. **Building and Running the Mini Program**:
   - Open the project in the WeChat Developer Tools.
   - Ensure the `project.config.json` and `project.private.config.json` files are correctly set up.
   - Use the WeChat Developer Tools to preview and debug the Mini Program.

2. **Testing**:
   - Use the built-in testing tools in the WeChat Developer Tools to test the Mini Program.

3. **Debugging**:
   - Use the debugging tools in the WeChat Developer Tools to inspect and debug the Mini Program.

## Project-Specific Conventions

- Follow the standard WeChat Mini Program development practices.
- Maintain consistency in the structure of page folders (`.js`, `.json`, `.wxml`, `.wxss` files).
- Use the `utils/` directory for shared logic to avoid code duplication.

## Key Files

- `app.js`: Entry point for the Mini Program.
- `app.json`: Global configuration for the Mini Program.
- `utils/locations.js`: Contains utility functions for handling locations.
- `pages/`: Contains the main pages of the Mini Program.

## External Dependencies

- The project relies on the WeChat Mini Program framework. Ensure you have the WeChat Developer Tools installed to build and run the project.

## Notes
- This project is intended for collaborative development. Please ensure that all changes are properly documented and tested before committing.
- For any questions or issues, refer to the `问题汇总.txt` file for common problems and solutions.