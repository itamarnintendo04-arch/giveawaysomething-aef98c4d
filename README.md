# GiveawaySomething

Create a modern, sleek, dark-themed Web Dashboard for a Discord bot named "GiveawaySomething". The app should use React and Tailwind CSS. The design should feel gamer-friendly, using Discord's color palette (slate, dark blue, blurple/indigo).

The app should have two main states/screens:

1. Landing / Login Screen:

- A large, eye-catching title "GiveawaySomething".

- A short description: "The ultimate giveaway & quick-drop bot for your Discord server."

- A prominent "Login with Discord" button using the classic Discord blurple color (#5865F2) and a Discord icon.

2. Main Dashboard Screen (shows after clicking login):

- Header: Shows "Welcome, Admin!" and a "Logout" button.

- Top Section: Two dropdowns. The first is "Select Server" (mock some server names), and the second is "Select Channel" (mock some channel names).

- Main Content (Grid layout with 2 beautiful cards):

  * Card 1 (Start Giveaway): 

    - Title: "🎉 Start a Giveaway"

    - Input: Prize (text)

    - Input: Duration (text, e.g., 10m, 2h)

    - Input: Number of Winners (number)

    - Button: "Launch Giveaway" (Green color).

  * Card 2 (Quick Drop):

    - Title: "⚡ Quick Drop"

    - Input: Prize (text)

    - Button: "Launch Drop" (Blue or Yellow color).

Make the UI highly polished with hover effects, rounded corners (rounded-xl), and glassmorphism touches if possible. Only build the frontend UI for now; we will connect it to a real backend API now. Make the secrets and I will put them.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://giveawaysomething.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8c42168f-11d9-4087-ad3b-b55742829888).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
