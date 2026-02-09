# FidoNet Simulator 1995

> "Welcome to the matrix, Neo... I mean, SysOp."

A text-based RPG/Simulator about the FidoNet culture in the mid-90s. Experience the nostalgia of dial-up modems, BBS exploration, mailer configuration, and virus outbreaks.

## Features

- **Terminal Interface**: Authentic MS-DOS style CLI with `DIR`, `CD`, `TYPE`, and more.
- **BBS Simulation**: Connect to bulletin board systems using `TERMINAL.EXE` and a simulated 14400 modem.
- **Quest System**: Story-driven campaign to set up your node, gain points, and become a respected SysOp.
- **Realistic Configuration**: Edit `T-MAIL.CTL` and `GOLDED.CFG` files just like in the old days.
- **Economy**: Manage your phone bill and savings. Don't let your debt get too high!
- **Virus Outbreaks**: Protect your system from viruses like "OneHalf" and "Win95".

## Tech Stack

- **Framework**: React 19 (Vite)
- **State Management**: Redux Toolkit
- **UI Components**: `react95` for Windows 95 aesthetics, `react-rnd` for window management.
- **Testing**: Vitest, React Testing Library
- **Linting**: ESLint

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start development server**:
    ```bash
    npm run dev
    ```

3.  **Run tests**:
    ```bash
    npm test
    ```

## Project Structure

- `src/domain/`: Core business logic (Commands, Quests, Events) - *Clean Architecture*
- `src/engine/`: Legacy game engine components (gradually migrating to domain)
- `src/components/`: React UI components (Terminal, Desktop, Apps)
- `src/content/`: Game data (Quests, Messages)
- `src/hooks/`: Custom React hooks

## License

MIT