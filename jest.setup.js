// jest.setup.js
process.env.GITLAB_PERSONAL_ACCESS_TOKEN = 'test-token';
process.env.GITLAB_API_URL = 'https://gitlab.example.com';
process.env.USE_GITLAB_WIKI = 'false'; // Set a default for tests
process.env.GITLAB_READ_ONLY_MODE = 'false'; // Set a default for tests
