E-commerce Web App Backend (MERN Stack + TypeScript)

This is the backend server for an eCommerce web application built using the MERN (MongoDB, Express, React, Node.js) stack, with TypeScript. 
It provides all the core functionalities needed to manage users, products, orders, and more. The backend includes features such as authentication, authorization, caching, and full CRUD operations.

Technologies Used

    Node.js: JavaScript runtime used to build the backend server.
    Express.js: Framework for building the server and routing.
    MongoDB: NoSQL database to store user, product, and order data.
    Mongoose: ODM for MongoDB to model the data and interact with the database.
    TypeScript: Superset of JavaScript that provides static typing.
    Node Caching: Caching layer to optimize performance.
    Multer: Middleware for handling file uploads (e.g., product images).
    ESLint & Prettier: For maintaining code quality and formatting.

Features
1. Authentication & Authorization
    Role-based Authorization: Routes protected based on user roles (e.g., admin vs. regular users).

2. Node Caching

    In-memory Caching: Common queries and data (e.g., product listings) are cached using Node.js to reduce database load and improve performance.

3. CRUD Operations

    Users: Create, read, update, and delete users. Admins can manage all users, while regular users can only manage their own accounts.
    Products: Full CRUD functionality for products, including file upload for product images using Multer and Cloudinary.
    Orders: Manage orders, track status, and associate orders with users.

4. Input Validation

    Request Validation: Data validation for incoming requests using middleware to ensure data integrity and prevent malicious inputs.

5. File Uploads

    Multer & Cloudinary Integration: Product images are uploaded and stored on Cloudinary.

6. Error Handling

    Global Error Handling: Centralized error handling middleware to capture and return meaningful error messages to the client.
