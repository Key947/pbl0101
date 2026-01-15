PBL0101 - Complete ZIP (Backend + Frontend)
==========================================
Run the backend (pbl-server)
   - In VS Code, open a new terminal (Terminal -> New Terminal).
   - Change directory:
     cd pbl_project/pbl-server
   - Install dependencies:
     npm install
   - Start the server:
     node server.js
   - You should see: "Server running on http://localhost:3000"

Open the frontend (pbl-client)
   Option A (simplest): Open the file directly in the browser
     - Open pbl_project/pbl-client/index.html by double-clicking it or right-click -> Open with -> Browser.
     - Note: Some browsers block requests from file:// to http://. If you get errors, use Option B.

   Option B (recommended for beginners): Use VS Code Live Server extension
     - In VS Code, install "Live Server" extension by Ritwick Dey.
     - Open the pbl-client folder in VS Code, right-click index.html -> "Open with Live Server".
     - The page will open at something like http://127.0.0.1:5500 and can talk to the backend at http://localhost:3000.

