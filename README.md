# TechResumeApp

A lightweight, no-nonsense tool designed to tailor your resume for ATS (Applicant Tracking Systems) without the bloat, paywalls, or privacy concerns of mainstream resume builders.

## Why TechResumeApp?

Unlike paid-tier "resume optimization" platforms, **TechResumeApp** is built for developers who want full control over their data and formatting.

- **Developer-First**: No cluttered drag-and-drop interfaces.
- **Privacy-Centric**: Your resume data stays local. No third-party servers tracking your experience.
- **ATS Guaranteed**: We don't guess what parsers want; we implement strict sanitization logic to ensure your resume is readable by any standard ATS.
- **Truly Lightweight**: No excessive frameworks, no subscription models, just pure, optimized text generation.

## Features

- **Smart Skill Sanitization**: Automatically matches and ranks your skills based on your profile to prevent AI hallucinations.
- **Experience Tailoring**: Intelligently swaps or caps bullet points while ensuring role and company authenticity.
- **ATS-Ready Output**: Generates clean, structured, plain-text resume representations optimized for parsers.

## Getting Started

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```

## Architecture

This application is built with **Next.js**, focusing on server-side performance and minimal client-side overhead.

- `app/`: Core application logic and UI.
- `lib/`: Business logic for sanitization and ATS formatting.
- `components/`: Modular UI components.
- `tests/`: Unit tests ensuring ATS compliance logic remains robust.

## Contributing

This project is lightweight and designed for speed. If you find a bug or have an improvement that keeps the tool fast and privacy-focused, feel free to open a PR.
"# toasty-resume" 
