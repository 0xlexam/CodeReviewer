# CodeReviewer

## Overview

CodeReviewer is a Node.js server built with TypeScript and Express to manage API requests in a code review and collaboration environment. It supports code submission, retrieval, commenting, and review sessions, enhancing developer productivity through secure and efficient RESTful interactions.

## Features

- **Code Submission**: Submit code for review.
- **Retrieve Submissions**: Access submitted code.
- **Post Comments**: Add feedback on submissions.
- **Review Sessions**: Manage collaborative code reviews.

## Getting Started

### Prerequisites

- Node.js v14+
- npm v6+

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/0xlexam/CodeReviewer.git
   cd CodeReviewer
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up environment variables:

   ```sh
   cp .env.example .env
   ```

4. Start the server:

   ```sh
   npm start
   ```

The server will be running at `http://localhost:3000`.

## Contributing

1. Fork the repository.
2. Create a branch (`git checkout -b feature-branch`).
3. Commit changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.
