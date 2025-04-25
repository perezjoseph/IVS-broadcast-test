# IVS Streaming Platform

A streaming platform built using Amazon Interactive Video Service (IVS).

## Overview

This project uses Amazon IVS to create a livestreaming platform with low-latency streaming capabilities. It includes:

- CloudFormation templates for deploying the IVS infrastructure
- React frontend for video playback
- Express backend for API handling
- Docker container support for deployment
- Multiple deployment options (ECS and App Runner)

## Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js 18+ (for local development)
- Docker (for container builds, optional depending on deployment method)

## Deployment Options

This repository includes multiple deployment options:

### Option 1: ECS with Docker (Preferred for Production)

Deploy using Amazon ECS with Docker containers:

```bash
# Deploy the ECS infrastructure
./deploy-ecs-fixed.sh
```

See [ECS_DEPLOYMENT.md](./ECS_DEPLOYMENT.md) for detailed instructions.

### Option 2: AWS App Runner (No Docker Required)

Deploy using AWS App Runner directly from the Git repository:

```bash
# Deploy the App Runner service
./deploy-apprunner.sh
```

See [DEPLOYMENT_FIXED.md](./DEPLOYMENT_FIXED.md) for detailed instructions.

## Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Access the application at http://localhost:3000.

## Streaming Setup

To broadcast to your IVS channel using OBS Studio:

1. Get your IVS details from the deployment outputs
2. Open OBS Studio
3. Go to Settings > Stream
4. For Service, select "Custom..."
5. For Server, enter `rtmps://{ingest-endpoint}/app/`
6. For Stream Key, enter your stream key
7. Click "OK" and "Start Streaming"

## Cleanup

Each deployment method has its own cleanup script:

```bash
# For ECS deployments
./cleanup-ecs-fixed.sh

# For App Runner deployments
./cleanup-apprunner.sh
```

## License

ISC