# MultiSavings Project

MultiSavings is a simple web application that helps users manage and track their savings across multiple financial accounts. The application allows users to create periods (e.g., months) and within each period, add and manage different financial accounts and their corresponding balances. The app is built with **Nuxt3**, **Vue3**, and **TailwindCSS**, and uses **Firebase** for authentication and **Firestore** as the database.

## Features

- **User Authentication**: Secure user authentication using Google Sign-In.
- **Data Encryption**: Sensitive user data (account names and balances) is encrypted before being stored in Firestore, ensuring user privacy and security.
- **Period Management**: Users can create periods (e.g., months) and copy over the accounts and balances from the most recent period.
- **Account Management**: Within each period, users can add, edit, or delete financial accounts and track their balances.
- **Mobile Responsiveness**: The application is fully responsive and works well on mobile devices.

## Project Structure

- **Frontend**: Built with Nuxt3, Vue3, and TailwindCSS.
- **Backend/Database**: Firebase Firestore is used to store user data.
- **Authentication**: Firebase Authentication is used to manage user sign-ins, specifically using Google Sign-In.
- **Encryption**: Data is encrypted using AES encryption before being stored in Firestore, with each user having a unique encryption key.

## Usage

### Sign In:

- Click on the "Login" button in the top-right corner and sign in using your Google account.

### Create a Period:

- Once logged in, you can create a new period (e.g., a month) by clicking the "Add Period" button.
- The accounts and balances from the most recent period will be copied over to the new period.

### Manage Accounts:

- Within each period, you can add new accounts, update existing account balances, or delete accounts.
- All account data is encrypted before being stored in Firestore.

### Delete a Period:

- You can delete any period, and the most recent period will be automatically selected.

## Data Encryption

This app ensures user privacy by encrypting account names and balances before storing them in Firestore. Each user has a unique encryption key stored in the `users` collection in Firestore, which is used for encrypting and decrypting their data.

## Firestore Structure

- **users**: Contains documents for each user, storing their `encryptionKey`, `email`, and `createdAt` timestamp.
- **periods**: Contains documents for each period created by users. Each document stores:
  - `period`: The name of the period (e.g., January 2024).
  - `accounts`: An array of encrypted account objects, each with an `id`, `name`, and `amount`.
  - `createdAt`: A timestamp of when the period was created.
  - `userId`: The UID of the user who created the period.

## Contributing

Contributions are welcome! If you have any suggestions or improvements, please fork the repository and create a pull request.


