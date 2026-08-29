# Zeyad Hazem - Personal Portfolio Website

A modern, interactive portfolio website built with React and Three.js, showcasing my projects and experience.

## 🚀 Live Website

Visit the live website at: [https://zeyadhazem.github.io/](https://zeyadhazem.github.io/)

## 📁 Project Structure

```
zeyadhazem.github.io/
├── client/                 # React application
│   ├── public/            # Static assets (photos, 3D models, icons, HDR environment)
│   ├── assets-source/     # Full-resolution originals, not deployed
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   └── ...
│   ├── package.json       # Dependencies and scripts
│   └── README.md          # Client app notes
├── hooks/                 # Git hooks (version controlled)
│   └── pre-push           # Pre-push hook for automatic deployment
├── setup-hooks.sh         # Script to install git hooks
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

2. Set up git hooks for automatic deployment:
   ```bash
   ./setup-hooks.sh
   ```

3. Navigate to the client directory and install dependencies:
   ```bash
   cd client
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the website in your browser.

## 🚀 Deployment

### **Automatic Deployment with Git Hook**

This repository is configured with a **git pre-push hook** that automatically deploys your changes when you push to the `master` or `main` branch.

**How it works:**
- When you push to `master`/`main`, the hook automatically runs `npm run deploy`
- Your changes are built and deployed to GitHub Pages
- The website updates at [https://zeyadhazem.github.io/](https://zeyadhazem.github.io/)

**To deploy your changes:**
1. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

2. Push to master (deployment happens automatically):
   ```bash
   git push origin master
   ```

The hook will:
- ✅ Detect you're pushing to master/main
- 🚀 Automatically run `npm run deploy` from the client directory
- 📦 Build and deploy your React app to GitHub Pages
- 🌐 Make your changes live within minutes

### **Manual Deployment (Alternative)**

If you prefer to deploy manually or need to deploy without pushing:

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Run the deploy command:**
   ```bash
   npm run deploy
   ```

### Deployment Process Details

The deployment process uses the following npm scripts defined in `client/package.json`:

- `predeploy`: Automatically runs `npm run build` before deployment
- `deploy`: Uses `gh-pages` to deploy the build folder to GitHub Pages

**Note:** The git hook ensures that deployments only happen when pushing to the main branch, keeping your development workflow clean and preventing accidental deployments from feature branches.

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
2. Test locally with `npm start` (from the `client/` directory)
3. When ready to publish:
   ```bash
   git add .
   git commit -m "Describe your changes"
   git push origin master
   ```
4. The git hook will automatically deploy your changes to GitHub Pages
5. Your changes will be live at [https://zeyadhazem.github.io/](https://zeyadhazem.github.io/) within a few minutes

**Note:** The automated deployment only triggers when pushing to the `master` or `main` branch. Pushes to other branches will not trigger deployment.

## 🤝 Contributing

This is a personal portfolio website. If you find any issues or have suggestions, feel free to open an issue or submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).