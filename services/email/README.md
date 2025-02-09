# Email Service

The email service is responsible for sending emails to users. Use NodeMailer to send emails and MailHog to view sent emails.

We use RabbitMQ to connect Email Service with other services. When a user places an order, the Order Service sends a message to the Email Service to send an email notification. If the email fails to send, the message is requeued for later processing.

## Service Dependencies

- **RabbitMQ** - Message broker for communication between services.

