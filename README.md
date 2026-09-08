# World-Class Resume Builder

A premium, AI-powered resume builder designed to help you create ATS-friendly, professional resumes in minutes. Built with modern web technologies and focused on user experience, this application streamlines the resume creation process from job description parsing to final PDF export.

![Resume Builder Banner](https://placehold.co/1200x400/2563eb/ffffff?text=Resume+Builder+Preview)

## 🚀 Key Features

*   **AI-Powered Tailoring**: Automatically parses job descriptions and tailors your resume content (skills, summary, experience) using Azure OpenAI to maximize ATS compatibility.
*   **Smart Resume Parsing**: Upload your existing PDF resume, and the system intelligently extracts your details.
*   **Optimized Templates**: Choose from a variety of professional templates, including ATS-specific layouts designed to pass automated systems.
*   **Real-Time Preview**: See changes instantly as you edit your profile.
*   **Interactive Editing**:
    *   **Drag-and-Drop**: Easily reorder experience and education sections.
    *   **Rich Text Support**: Edit bullet points and descriptions with ease.
*   **Privacy First**: All processing happens securely.
*   **High-Quality PDF Export**: Download your resume in a clean, professional PDF format.

## 🛠️ Tech Stack

*   **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Use of modern CSS variables.
*   **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/).
*   **AI Integration**: Azure OpenAI Service (GPT models).
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Motion](https://motion.dev/).
*   **PDF Generation**: `react-to-print`, `jspdf`, `html2canvas`.
*   **State Management**: React Context & Hooks.

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/resume-builder.git
    cd resume-builder
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory and add your Azure OpenAI credentials. You can copy the structure below:

    ```env
    VITE_AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
    VITE_AZURE_OPENAI_API_KEY=your_api_key_here
    VITE_AZURE_OPENAI_DEPLOYMENT=your_deployment_name
    VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview
    ```

    > **Note**: Without these keys, the AI features (parsing and tailoring) will not function.

4.  **Start the Development Server**
    ```bash
    npm run dev
    ```

    The app should now be running at `http://localhost:5173`.

## 📂 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── builder/       # Core builder steps (JD, Profile, Preview)
│   │   ├── ui/            # Reusable UI components
│   │   └── LandingPage.tsx
│   ├── templates.tsx      # Resume template definitions
│   └── App.tsx            # Main application component
├── lib/                   # Utility libraries
├── styles/                # Global styles and tailwind config
└── utils/
    └── resumeParser.ts    # AI parsing logic
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.