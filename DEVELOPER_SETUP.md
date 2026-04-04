# Developer Setup Guide for Isabella Hart Interior

This document provides step-by-step instructions for setting up the Developer Panel for the Isabella Hart Interior project.

## Prerequisites
Before you begin, ensure that you have the following installed on your machine:
- Node.js (version x.x.x)
- npm (version x.x.x)
- Git

## Step 1: Clone the Repository
To get started, clone the repository to your local machine using the following command:

```bash
git clone https://github.com/<owner>/isabellahartinterior.git
cd isabellahartinterior
```

Replace `<owner>` with the appropriate GitHub username or organization.

## Step 2: Install Dependencies
In the project directory, run the following command to install the necessary npm dependencies:

```bash
npm install
```

## Step 3: Configure API Key
The Developer Panel requires an API key for access. Follow these instructions to configure it:
1. Obtain your API key from the API provider.
2. Create a `.env` file in the root directory of your project.
3. Add the following line to the `.env` file:
   
   ```plaintext
   API_KEY=<your_api_key>
   ```
   
   Replace `<your_api_key>` with your actual API key.

## Step 4: Set Up Environment Variables
Apart from the API key, you may need to set up other environment variables:
- `DB_HOST`: Database host address
- `DB_USER`: Database username
- `DB_PASS`: Database password

Add these variables to the `.env` file as well:

```plaintext
DB_HOST=<your_db_host>
DB_USER=<your_db_user>
DB_PASS=<your_db_pass>
```

## Step 5: Run the Development Server
After configuring everything, you can start the development server with the following command:

```bash
npm start
```

## Troubleshooting Guide
If you encounter any issues during setup or usage, refer to the following tips:
- **Issue:** API key not recognized  
  **Solution:** Double-check the API key entered in the `.env` file.
- **Issue:** Environment variables not loading  
  **Solution:** Ensure you are using the `dotenv` package and have correctly set up your `.env` file.
- **Issue:** Server not starting  
  **Solution:** Check the terminal for any error messages and verify that all dependencies were installed correctly.

For further assistance, please refer to the project documentation or contact the development team.