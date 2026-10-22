# **CS164 LBA**

An efficient and user-friendly application to plan your perfect day touring San Francisco’s top attractions. The app combines a smart backend API to optimize routes and a modern frontend interface for ease of use.

## **Features**
- **Curated SF Attractions**: Explore iconic locations like Chinatown, Pier 39, and the Palace of Fine Arts.
- **Smart Route Planning**: Optimize your travel route with minimal time and maximum fun.
- **Flexible Travel Options**: Choose between driving, public transit, or walking.

---

## **Tech Stack**
- **Frontend**: React (hosted on Vercel)
- **Backend**: Flask (hosted on Railway)

---

## **Installation and Local Setup**

### **Prerequisites**
- Node.js 22.15+ (22 LTS is used in compatibility checks)
- Python 3.11+ (for the backend)
- Pip (Python package manager)

### **1. Clone the Repository**
```bash
git clone https://github.com/Ifeoluwakolopin/lba.git
cd lba
```

### **2. Backend Setup**

#### Install Dependencies:
```bash
pip install -r requirements.txt
```

#### Run Locally:
```bash
python api.py
```

Your Flask backend will start at `http://127.0.0.1:5000`.

---

### **3. Frontend Setup**
Navigate to the `optimal-route-app` directory:
```bash
cd optimal-route-app
```

#### Install Dependencies:
```bash
npm ci
```

#### Create an Environment File:
In the `optimal-route-app` directory, create a `.env` file with the following:
```env
REACT_APP_API_BASE_URL=http://127.0.0.1:5000
```

#### Run Locally:
```bash
npm start
```

Your React app will start at `http://localhost:3000`.

---

### **4. Access the Application**
- Open the frontend in your browser: [http://localhost:3000](http://localhost:3000).
- The frontend will make API calls to the Flask backend running at `http://127.0.0.1:5000`.

---

## **Contributing**

### Dependency maintenance

The frontend retains Create React App, its start/build/test/eject scripts,
React 18, Google Maps integration and existing routes. Scoped overrides update
the SVG loader, CSS minimizer, source-map URL loader and optional Workbox
plugin within the existing webpack configuration; Node 22 is required.
`npm start` delegates to CRA through a small webpack-dev-server 5 adapter:
HTTPS, source maps, custom proxy setup, SPA fallback and no-op service-worker
middleware are retained. Host checks default to `auto`, and development assets
no longer advertise wildcard cross-origin access. The explicit legacy
`DANGEROUSLY_DISABLE_HOST_CHECK` escape hatch remains available.
Compatible scoped HTTP-proxy, UUID and Underscore parents and the maintained
selector-parser API are refreshed without forcing incompatible helper exports.
The Python environment retains optimization, geospatial and notebook/Jupyter
functionality. Compatibility CI uses mocked Google Maps, the real GLPK solver
and no production services. The frontend build retains local CRA warning
behavior (`CI=false`); it does not claim the stale template test passes.

Run `npm audit` including development dependencies when updating the lockfile.
The security branch alone is excluded from automatic Vercel deployment at
both potential project roots; other branches retain existing deployment behavior.
CRA's remaining upstream development-tool advisories (including unpatched
braces) are not dismissed or certified safe. Patched webpack-dev-server removes
node-forge through its maintained certificate generator, and NYC's compatible
YAML 4 loader removes the sprintf-js ownership path.
Replacing the complete build/test toolchain needs a separately reviewed
compatibility plan, not an `npm audit --force` downgrade.

We welcome contributions to enhance the app! Follow these steps to contribute:

### **1. Fork the Repository**
Click the "Fork" button on the top-right corner of the repository.

### **2. Clone Your Fork**
```bash
git clone https://github.com/your-username/sf-tour-planner.git
cd sf-tour-planner
```

### **3. Create a Branch**
Create a new branch for your feature or bug fix:
```bash
git checkout -b feature/your-feature-name
```

### **4. Make Changes**
- Edit the code to add your feature or fix bugs.
- Ensure you write clear, readable, and well-documented code.

### **5. Test Your Changes**
- Run the frontend and backend locally to ensure everything works as expected.

### **6. Commit and Push**
```bash
git add .
git commit -m "Add your message here"
git push origin feature/your-feature-name
```

### **7. Create a Pull Request**
- Go to the main repository on GitHub.
- Click **"Pull Requests"** > **"New Pull Request"**.
- Select your branch and submit your PR with a clear description of your changes.
