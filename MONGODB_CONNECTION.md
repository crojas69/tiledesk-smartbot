# MongoDB Connection Configuration

This document explains how to configure MongoDB connections in the Tiledesk server application.

## Overview

The application supports connecting to different types of MongoDB instances:
1. Local MongoDB instances (development)
2. MongoDB Atlas clusters (production)
3. Self-hosted MongoDB instances with SSL/TLS

## Configuration

### Environment Variables

The following environment variables control MongoDB connection settings:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `DATABASE_URI` | MongoDB connection URI | `mongodb://mongodb:27017/tiledesk` |
| `MONGODB_SSL` | Enable SSL for MongoDB connection | `true` |
| `MONGODB_SSL_VALIDATE` | Validate SSL certificates | `false` |
| `MONGODB_TLS_ALLOW_INVALID_CERTIFICATES` | Allow invalid certificates | `true` |
| `MONGODB_TLS_ALLOW_INVALID_HOSTNAMES` | Allow invalid hostnames | `true` |

### Connection URI Formats

1. **Local MongoDB instance:**
   ```
   mongodb://localhost:27017/tiledesk
   ```

2. **MongoDB Atlas cluster:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database
   ```

3. **Self-hosted MongoDB with SSL:**
   ```
   mongodb://host:port/database?ssl=true
   ```

## SSL/TLS Configuration

### For Local Development

When using a local MongoDB instance, SSL is typically not required:

```yaml
# docker-compose.yml
environment:
  DATABASE_URI: mongodb://mongodb:27017/tiledesk
  MONGODB_SSL: "false"
  MONGODB_SSL_VALIDATE: "false"
```

### For Production (MongoDB Atlas)

When connecting to MongoDB Atlas, SSL is required:

```yaml
# docker-compose.yml
environment:
  DATABASE_URI: mongodb+srv://username:password@cluster.mongodb.net/database
  MONGODB_SSL: "true"
  MONGODB_SSL_VALIDATE: "false"
  MONGODB_TLS_ALLOW_INVALID_CERTIFICATES: "true"
  MONGODB_TLS_ALLOW_INVALID_HOSTNAMES: "true"
```

### For Self-hosted MongoDB with SSL

When connecting to a self-hosted MongoDB instance with SSL:

```yaml
# docker-compose.yml
environment:
  DATABASE_URI: mongodb://host:port/database?ssl=true
  MONGODB_SSL: "true"
  MONGODB_SSL_VALIDATE: "true"  # Set to true if using valid certificates
  MONGODB_TLS_ALLOW_INVALID_CERTIFICATES: "false"  # Set to false if using valid certificates
  MONGODB_TLS_ALLOW_INVALID_HOSTNAMES: "false"  # Set to false if using valid certificates
```

## Troubleshooting SSL/TLS Issues

If you encounter SSL/TLS connection errors:

1. **Check the connection URI format:**
   - Use `mongodb://` for standard connections
   - Use `mongodb+srv://` for MongoDB Atlas

2. **Verify SSL settings:**
   - For local instances, disable SSL (`MONGODB_SSL=false`)
   - For remote instances, enable SSL (`MONGODB_SSL=true`)

3. **Certificate validation:**
   - If using self-signed certificates, set `MONGODB_SSL_VALIDATE=false`
   - For production with valid certificates, set `MONGODB_SSL_VALIDATE=true`

4. **Check firewall and network settings:**
   - Ensure the MongoDB port is accessible
   - Verify DNS resolution for MongoDB Atlas clusters

## Example Configurations

### Development Environment

```yaml
version: '3.8'
services:
  tiledesk:
    environment:
      DATABASE_URI: mongodb://mongodb:27017/tiledesk
      MONGODB_SSL: "false"
      MONGODB_SSL_VALIDATE: "false"
```

### Production Environment with MongoDB Atlas

```yaml
version: '3.8'
services:
  tiledesk:
    environment:
      DATABASE_URI: mongodb+srv://username:password@cluster.mongodb.net/tiledesk
      MONGODB_SSL: "true"
      MONGODB_SSL_VALIDATE: "false"
      MONGODB_TLS_ALLOW_INVALID_CERTIFICATES: "true"
      MONGODB_TLS_ALLOW_INVALID_HOSTNAMES: "true"
```

## Code Implementation

The connection logic is implemented in:
- `config/mongodb.js` - Connection options configuration
- `app.js` - Database connection initialization

The application automatically detects the connection type based on the URI format and applies appropriate SSL/TLS settings.
