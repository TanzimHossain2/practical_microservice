# Product Service

The **Product Service** is responsible for managing product details. It provides endpoints to create, update, and retrieve product details within a microservices architecture.

## Endpoints

- POST /products - Create a new product
- GET /products - Get product Collection
- GET /products/:id - Get a product Details

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Docker](https://www.docker.com/) (for running the database)
- [pnpm](https://pnpm.io/) (for package management)
- [Node.js](https://nodejs.org/) (20+ recommended)

### Running the Service

1. **Start the database**  
   Run the `docker-compose` file to initialize the database:

   ```bash
   docker-compose up -d
   ```

2. **Navigate to the Product Service directory**

   ```bash
    cd services/product
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Run database migrations**

   ```bash
    pnpm migrate:dev
   ```

5. **Start the service**

   ```bash
   pnpm dev
   ```

   The service will be available at:
   👉 **`http://localhost:4001`**

## Environment Variables

Have a look at the `.env.demo` file to see the required environment variables for the service.

