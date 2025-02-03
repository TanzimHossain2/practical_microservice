# Inventory Service

The **Inventory Service** is responsible for managing product inventory. It provides endpoints to create, update, and retrieve inventory details within a microservices architecture.

## API Endpoints

### Inventory Management

- **POST** `/inventories` - Create a new inventory entry
- **PUT** `/inventories/:id` - Update an existing inventory
- **GET** `/inventories/:id` - Fetch inventory details
- **GET** `/inventories/:id/details` - Retrieve additional inventory details

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Docker](https://www.docker.com/) (for running the database)
- [pnpm](https://pnpm.io/) (for package management)
- [Node.js](https://nodejs.org/) (v18+ recommended)

### Running the Service

1. **Start the database**  
   Run the `docker-compose` file to initialize the database:

   ```bash
   docker-compose up -d
   ```

2. **Navigate to the Inventory Service directory**

   ```bash
   cd services/inventory
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
👉 **`http://localhost:4002`**
