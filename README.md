# Gearvn-Fake-Lite
Final project for Web Application Development course, 22CLC03.

An E-commerce web app for electronic devices selling.

# The 2 backend Servers
To satisfy the project requirement, the backend is splitted into 2 server: 
- The main system which is responsible for normal CRUD requests
- The subsystem which is only used for handling CRUD requests relating to balance and payment such as get balance, deposit or withdraw

# DotEnv files
This project requires 2 .env files in both backend and frontend directory
### backend's .env
```
MAIN_PORT = 3000
SUB_PORT = 8000
NODE_ENV = development
MONGO_URI = YOUR_MONGO_URI
CLOUDINARY_NAME = YOUR_CLOUDINARY_NAME
CLOUDINARY_KEY = YOUR_CLOUDINARY_KEY
CLOUDINARY_SECRET = YOUR_CLOUDINARY_SECRET
CLERK_PUBLISHABLE_KEY = YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY = YOUR_CLERK_SECRET_KEY
MAIN_ACCOUNT_ID = THE_CLERK_ACCOUNT_ID_FOR_RECEIVING_MONEY_FROM_ORDERS
MAIN_VERIFY_PRIVATE_KEY = I don't know what this is, I'm asking Longnguyen2004
SUB_VERIFY_PUBLIC_KEY = I don't know what this is, I'm asking Longnguyen2004
```

### backend's .env
```
VITE_CLERK_PUBLISHABLE_KEY = YOUR_CLERK_PUBLISHABLE_KEY
```

# Run this project
1. Run "npm i" at the root, backend and frontend directory
2. At root directory, run "npm run dev"
3. Go to [localhost](http://localhost:5173/)

# Main Account
The main account is a Clerk account used for receiving the money from orders. Sign up an account for the Clerk project, get the ID and put it inside the backend's .env file.
