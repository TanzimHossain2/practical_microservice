# API Gateway

API Gateway is a service that communicates with the backend services. It is a single entry point for all the clients. Public routes are only accessible through the API Gateway. Private routes internally communicate with the backend services.

## Features

- **Authentication**: API Gateway is responsible for authenticating the user and then forwarding the request to the backend services.
- **Rate Limiting**: API Gateway can limit the number of requests a client can make to the backend services.
