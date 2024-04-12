<h1><img align="left" src="assets/profile-dark.svg#gh-dark-mode-only" alt="rbxdocsearch" width="40px" height="40px"><img align="left" src="assets/profile-light.svg#gh-light-mode-only" alt="rbxdocsearch" width="40px" height="40px">rbxdocsearch (WIP)</h1>

search roblox documentations using a discord bot.

## Prerequisities

- Git
- Bun installed in your system
- ESLint Extension in your code editor

> [!NOTE]
> If you're planning to run this bot using Node, you might need to tweak some of the code to make it work with it since this bot relies on Bun's global variables.

## Getting Started

1. Clone this repository,
2. Create `.env` with the following config:
    ```
    DISCORD_TOKEN=<your discord bot token>
    GITHUB_TOKEN=<your github PAT>
    CLIENT=<your discord bot client id>
    ```
3. Install required dependencies:
    ```bash
    bun install
    ```
4. Fetch the latest documentation from Roblox's [creator-docs](https://github.com/Roblox/creator-docs) repo:
    ```bash
    bun fetch-docs.js
    ```
5. Register slash commands:
    ```bash
    bun register-commands.js
    ```
6. Run the bot:
    ```bash
    bun .
    ```

This project was created using `bun init` in bun v1.1.3. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
