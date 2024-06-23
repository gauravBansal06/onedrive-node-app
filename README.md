# OneDrive Explorer Node Application

## App Functionalities

- **Service URL**: [http://localhost:3000/](http://localhost:3000/)
- **SignIn Page**: Root page with a button for Microsoft signin.
- **Home Page**: Displays signed-in user info and lists the directories and files in the root directory of OneDrive.
  - [http://localhost:3000/home](http://localhost:3000/home)
- **File Details Page**: Clicking on a file on the home page provides more information about the file, such as shared users.
  - [http://localhost:3000/file/{fileId}](http://localhost:3000/file/{fileId})
- **Download File Support**: Allows downloading files from OneDrive.
- **Change Notifications Subscription**: Subscribes to change notifications for the OneDrive root directory to receive updates.

## Prerequisites

1. **Microsoft Azure Account**: [azure.microsoft.com](https://azure.microsoft.com)
2. **Ngrok**: [ngrok.com](https://ngrok.com/docs/getting-started/)
3. **Node.js**: [nodejs.org](https://nodejs.org/), This project is built over Node 16

## Repository Setup

   ```bash
   git clone https://github.com/gauravBansal06/strac-onedrive-node-app
   cd strac-onedrive-node-app
   npm install
   ```

## Configure App in Azure AD Portal

1. **Navigate to Azure AD Portal**

   - Go to [Azure AD Portal](https://aad.portal.azure.com/).

2. **Register a New Application**

   - Click on **App registrations** and then **New registration**.
   - Enter a name for your application, select the appropriate account type, and specify the redirect URI:
     - **Redirect URI**: Set to the `OAUTH_REDIRECT_URI` from project's `.env` file which is **http://localhost:3000/auth/callback**.
   - Note the **Application (client) ID** of the newly created app: This will be added in project's `.env` file.

3. **Configure Client Secret**

   - In your registered application, navigate to **Certificates & secrets**.
   - Navigate to **Client secrets**.
   - Click on **New Client Secret**.
   - Fill required info like Description, Expire time etc and Click on **Add**.
   - Copy the **Value** of the newly added secret: This will be added in project's `.env` file.

4. **Configure API Permissions**

   - In your registered application, navigate to **API permissions**.
   - Click on **Add a permission**, then select **Microsoft Graph**.
   - Choose the appropriate permission type:

     - **Application Permissions**:
       - `Files.Read`: Allows the app to read all files that the signed-in user can access.
       - `Files.Read.All`: Allows the app Read all files that user can access.
       - `profile`: Allows the app to view users' basic profile.
       - `email`: Allows the app to view users' email address.
       - `Users.Read`: Allows the app to Sign in and read user profile.

   - Click on **Add permissions**.

5. **Grant Admin Consent** (Optional)
   - After adding the necessary permissions, click on **Grant admin consent for [your organization]**.
   - Confirm the consent dialog.


## Setup Instructions

   - Open Terminal and Run NGROK: `ngrok http 3000` and note the Forwarding URL. E.g: `https://1403-103-226-200-142.ngrok-free.app`
   - Create the `.env` file in project's root and copy contents from `.env-sample`.
   - Update the `.env` file with the following details:
       ```dotenv
       OAUTH_CLIENT_ID=<your_app_client_id>
       OAUTH_CLIENT_SECRET=<your_app_client_secret>
       NOTIFICATION_WEBHOOK_HOST=<ngrok_url>
       ```
   - Run the Application
        ```bash
        npm start
        ```