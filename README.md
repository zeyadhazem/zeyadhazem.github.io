# Zeyad Hazem - Personal Portfolio Website

A modern, interactive portfolio website built with React and Three.js, showcasing my projects and experience.

## 🚀 Live Website

Visit the live website at: [https://zeyadhazem.github.io/](https://zeyadhazem.github.io/)

## 📁 Project Structure

```
zeyadhazem.github.io/
├── client/                 # React application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   └── ...
│   ├── package.json       # Dependencies and scripts
│   └── README.md          # Create React App documentation
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🛠️ Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zeyadhazem/zeyadhazem.github.io.git
   cd zeyadhazem.github.io
   ```

2. Navigate to the client directory and install dependencies:
   ```bash
   cd client
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the website in your browser.

## 🚀 Deployment

### **Important: Deploying Changes to the Live Website**

To deploy new changes to your public website, follow these steps:

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Run the deploy command:**
   ```bash
   npm run deploy
   ```

This command will:
- Build the production version of your React app
- Deploy it to GitHub Pages using the `gh-pages` branch
- Make your changes live at [https://zeyadhazem.github.io/](https://zeyadhazem.github.io/)

### Deployment Process Details

The deployment process uses the following npm scripts defined in `client/package.json`:

- `predeploy`: Automatically runs `npm run build` before deployment
- `deploy`: Uses `gh-pages` to deploy the build folder to GitHub Pages

**Note:** Make sure all your changes are committed to git before deploying, as this helps track what version is currently deployed.

## 🧪 Available Scripts

In the `client/` directory, you can run:

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run deploy` - **Deploys the app to GitHub Pages**

## 🛠️ Built With

- **React** - Frontend framework
- **Three.js** - 3D graphics and animations
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for react-three-fiber
- **GSAP** - Animation library
- **GitHub Pages** - Hosting platform

## 📝 Making Changes

1. Make your changes in the `client/src/` directory
2. Test locally with `npm start`
3. When ready to publish, run `npm run deploy` from the `client/` directory
4. Your changes will be live within a few minutes

## 🤝 Contributing

This is a personal portfolio website. If you find any issues or have suggestions, feel free to open an issue or submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).