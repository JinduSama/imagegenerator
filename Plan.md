# Image Generation App Plan

## Core Features
1. **Text Prompt Input**: A text box with history/autocomplete for entering prompts.
2. **Model Selection**: Dropdown to select models from OpenRouter API (support FLUX, DALL-E, Stable Diffusion models).
3. **Image Generation**: Button to generate images with support for batch generation (1-4 images).
4. **Image Display**: Gallery view for generated images with full-size viewing option.
5. **Local Save**: Save images with metadata (prompt, model, timestamp) to local storage.
6. **Thumbnail Gallery**: Display last 10 generated images with prompts in a sidebar or panel.
7. **Adjustable Parameters**: Image size presets, style options, quality settings, aspect ratio.
8. **Dark Mode UI**: Modern, visually appealing interface with dark theme.

## Technical Enhancements (Add These)
9. **Settings Persistence**: Save user preferences (API key, default model, sizes) to localStorage.
10. **API Key Management**: Secure input for API key with visibility toggle, stored in .env.
11. **Rate Limiting Handling**: Built-in retry logic and queue system for API rate limits.
12. **Error Handling**: Toast notifications for errors, graceful failure handling.
13. **Loading States**: Progress bars with percentage and estimated time.
14. **Keyboard Shortcuts**: Ctrl+Enter to generate, arrow keys to navigate thumbnails.
15. **Responsive Design**: Mobile-friendly layout with collapsible panels.
16. **Prompt Templates**: Save and reuse common prompt patterns.
17. **Batch Controls**: Generate multiple variations at once.
18. **gitignore Sensitive Data**: Ensure .env and uploads are in .gitignore.

## Technology Stack
- **Frontend**: React + Vite (faster than CRA)
- **Backend**: Node.js + Express (or serverless functions)
- **Styling**: Tailwind CSS + shadcn/ui (modern components)
- **State Management**: Zustand or React Query
- **Storage**: Local file system + IndexedDB for metadata

## Development Phases
1. **Setup**: Initialize React+Vite project, configure Tailwind, setup Express backend
2. **API Integration**: Connect OpenRouter API, implement rate limiting, error handling
3. **Core UI**: Build input components, model selector, parameter controls
4. **Image Handling**: Display images, save to disk, load from storage
5. **Gallery**: Implement thumbnail gallery with last 10 images
6. **Polish**: Add loading states, keyboard shortcuts, responsive design
7. **Testing**: Unit tests, API integration tests, E2E testing
8. **Documentation**: README, API usage guide, setup instructions

## Suggested File Structure
```
/src
  /components    # UI components
  /hooks         # Custom hooks
  /services      # API calls
  /store         # State management
  /utils         # Helper functions
/uploads         # Generated images
.env.example     # Environment template
```

## Security Considerations
- Never commit API keys
- Validate all inputs
- Sanitize prompts before sending to API

