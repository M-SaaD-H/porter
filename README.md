# Porter

Porter is a browser extension that saves your profile information locally and lets you autofill job application forms with a single click.

## Demo

<div align="center">
  <video src="https://github.com/user-attachments/assets/4d774666-4698-4899-aaa3-20320b8b42c8" width="100%" controls></video>
</div>

## Why Porter?

Job applications often require you to repeatedly fill out the same information. Porter solves this by letting you store your details once and autofill them across different forms. It focuses on the most common fields required in tech applications, such as GitHub, LinkedIn, Portfolio, Resume, Name, Email, Phone, and Location.

## Features

* Store profile information locally
* One-click autofill
* Works on common application forms
* Supports custom profile fields
* Built with TypeScript
* No external servers

## Installation

### Option 1 (Recommended)

Install from a GitHub Release:

1. Download the latest release ZIP from the [Releases page](https://github.com/M-SaaD-H/porter/releases/tag/v1.0.1).
2. Extract the downloaded ZIP file.
3. Open `chrome://extensions` in your browser.
4. Enable **Developer Mode** in the top right corner.
5. Click **Load unpacked**.
6. Select the extracted extension folder.

### Option 2 (Development)

Build the extension from source:

```bash
git clone https://github.com/M-SaaD-H/porter
cd porter
bun install
bun run build
```

After building, follow steps 3-6 from Option 1, selecting the generated `dist` folder to load the unpacked extension.

## Usage

1. Open the Porter extension popup.
2. Save your profile information, including any custom fields.
3. Visit a supported application form.
4. Click **Fill Application** in the extension popup.
5. Porter will automatically fill the matching fields on the page.

## How It Works

* **Local Storage**: Stores data securely in `chrome.storage.local`.
* **Field Detection**: Detects visible form inputs on the page.
* **Label Extraction**: Extracts labels associated with the form inputs.
* **Keyword Matching**: Matches labels to your profile data using a predefined keyword mapping.
* **Autofill**: Fills the matching values into the inputs.
* **Framework Compatibility**: Dispatches standard `input` and `change` events to ensure compatibility with modern frontend frameworks (React, Vue, etc.).

## Supported Fields

By default, Porter supports the following built-in fields:

* Name
* Email
* Phone
* Location
* GitHub
* LinkedIn
* Portfolio
* Twitter / X
* Resume URL

You can also add custom fields in the extension popup to support additional form inputs.

## Project Structure

```text
porter/
├── dist/                  # Compiled extension output
├── public/                # Static assets (icons, etc.)
├── src/                   # Source code
│   ├── popup/             # Extension popup UI
│   ├── classifier.ts      # Keyword mapping and field classification
│   ├── content.ts         # Content script entry point
│   ├── filler.ts          # DOM manipulation and event dispatching
│   ├── scanner.ts         # Form input detection
│   ├── storage.ts         # Chrome storage management
│   └── types.ts           # TypeScript type definitions
├── package.json
└── vite.config.ts         # Build configuration
```

## Privacy

* Data never leaves your browser.
* No external APIs or third-party tracking.
* No analytics are collected.
* No user account is required.
* Everything is stored locally using `chrome.storage.local`.

## Development

To start developing Porter:

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start the development server (watches for changes):
   ```bash
   bun run dev
   ```

3. Build the production extension:
   ```bash
   bun run build
   ```

## Roadmap

* [ ] Multiple profiles
* [ ] Export/import profile
* [ ] Firefox support
* [ ] Chrome Web Store release
* [ ] Better field detection

## Contributing

Contributions are welcome!

Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

## License

This project is licensed under the [MIT License](./LICENSE).
