# BildGenerator - AI Image Generator

A modern, feature-rich AI image generation application built with React, Vite, and Node.js. Generate images using various AI models through the OpenRouter API.

![BildGenerator](https://via.placeholder.com/800x400?text=BildGenerator)

## Features

### Core Features
- **Text Prompt Input** - Enter detailed prompts with history/autocomplete support
- **Model Selection** - Choose from FLUX.2 Pro, DALL-E 2/3, and Stable Diffusion XL
- **Batch Generation** - Generate 1-4 images at once
- **Image Gallery** - View all generated images in a responsive grid
- **Local Save** - Images saved to local storage with metadata
- **Thumbnail Gallery** - Quick access to recent images in sidebar
- **Adjustable Parameters** - Custom sizes, aspect ratios, and quality settings
- **Dark Mode UI** - Beautiful dark theme with modern design

### Technical Enhancements
- **Settings Persistence** - Preferences saved to localStorage
- **API Key Management** - Secure input with visibility toggle
- **Rate Limiting** - Built-in retry logic and queue system
- **Error Handling** - Toast notifications and graceful failures
- **Loading States** - Progress bars with percentage display
- **Keyboard Shortcuts** - Ctrl+Enter to generate, Ctrl+S for settings
- **Responsive Design** - Mobile-friendly with collapsible sidebar
- **Prompt History** - Reuse common prompt patterns

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Backend**: Node.js + Express
- **API**: OpenRouter (unified interface to multiple AI models)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai/keys))

### Installation

1. Clone the repository:
\`\`\`bash
cd bildgenerator
\`\`\`

2. Install all dependencies:
\`\`\`bash
npm run install:all
\`\`\`

3. Create your environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Add your OpenRouter API key to `.env`:
\`\`\`env
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
PORT=3001
\`\`\`

### Running the App

Start both frontend and backend:
\`\`\`bash
npm run dev
\`\`\`

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Individual Commands

Start only the server:
\`\`\`bash
npm run server
\`\`\`

Start only the client:
\`\`\`bash
npm run client
\`\`\`

Build for production:
\`\`\`bash
npm run build
\`\`\`

## Project Structure

\`\`\`
bildgenerator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── ImageGallery.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── ModelSelector.tsx
│   │   │   ├── PromptInput.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── UI.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   │   └── api.ts
│   │   ├── store/         # Zustand state management
│   │   │   └── store.ts
│   │   ├── utils/         # Utility functions
│   │   │   └── cn.ts
│   │   ├── App.tsx        # Main app component
│   │   ├── main.tsx       # App entry point
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                 # Express backend
│   └── index.js           # Server entry point
├── uploads/               # Generated images
├── .env                   # Environment variables
├── .env.example           # Environment template
├── .gitignore
├── package.json           # Root package.json
└── README.md
\`\`\`

## API Endpoints

### POST /api/generate
Generate new images.

**Request:**
\`\`\`json
{
  "prompt": "A beautiful sunset over mountains",
  "model": "flux2-pro",
  "width": 1024,
  "height": 1024,
  "numImages": 1,
  "apiKey": "sk-or-v1-..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "images": [
    {
      "filename": "image_1703500000000_1.png",
      "url": "/uploads/image_1703500000000_1.png",
      "prompt": "A beautiful sunset over mountains",
      "model": "black-forest-labs/flux.2-pro",
      "timestamp": 1703500000000,
      "width": 1024,
      "height": 1024
    }
  ]
}
\`\`\`

### GET /api/images
Get list of generated images.

### GET /api/health
Health check endpoint.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + Enter | Generate images |
| Ctrl + S | Open settings |
| Escape | Close modal |

## Supported Models

| Model | ID | Description |
|-------|-----|-------------|
| FLUX.2 Pro | `flux2-pro` | Frontier-level quality |
| DALL-E 3 | \`dalle3\` | Detailed & accurate |
| DALL-E 2 | \`dalle2\` | Fast generation |
| Stable Diffusion XL | \`stable-diffusion\` | Versatile |

## Security

- **API Keys**: Never commit API keys. Use `.env` file.
- **Input Validation**: All prompts are validated before sending.
- **Rate Limiting**: Built-in protection against API abuse.
- **Git Ignore**: `uploads/` and `.env` are excluded from version control.

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- [OpenRouter](https://openrouter.ai) for providing unified API access
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
