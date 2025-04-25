# IVS Streaming Platform - ECS Deployment Guide

This guide explains how to deploy the IVS streaming platform using AWS ECS with Docker containers.

## Overview

We've fixed the issues in the previous deployment by:

1. Using a custom IAM policy instead of the non-existent `AmazonIVSFullAccess`
2. Providing a simplified Dockerfile for easier building
3. Creating a more robust deployment script that handles errors and edge cases
4. Adding proper environment variable injection for the IVS configuration

## Prerequisites

- AWS CLI configured with appropriate permissions
- Docker installed locally (if building the container image locally)
- Access to AWS services including CloudFormation, ECR, ECS, IAM, etc.

## Deployment Process

### Step 1: Clean Up Previous Failed Deployments

If you have any failed deployments from previous attempts, clean them up:

```bash
./cleanup-failed.sh
```

### Step 2: Check ECR Repository

Make sure you have the ECR repository deployed:

```bash
aws cloudformation describe-stacks --stack-name ivs-streaming-ecr
```

If it doesn't exist, deploy it:

```bash
./deploy-ecr.sh
```

### Step 3: Deploy with Docker (if available)

If Docker is available on your machine:

```bash
./deploy-ecs-fixed.sh
```

This script will:
1. Clean up any previous failed deployments
2. Build and push the Docker image to ECR
3. Deploy the ECS resources using CloudFormation
4. Display the service URL and IVS streaming details

### Step 4: Deploy without Docker (if Docker is not available)

If Docker is not available, you'll need to:

1. Run the script first to get instructions:
```bash
./deploy-ecs-fixed.sh
```

2. Use a machine with Docker (like an EC2 instance) to build and push the image
3. Run the script again with the SKIP_DOCKER flag:
```bash
SKIP_DOCKER=true ./deploy-ecs-fixed.sh
```

## Accessing Your Application

After the deployment completes, you can access your application at the service URL provided:

```bash
aws cloudformation describe-stacks \
  --stack-name ivs-streaming-ecs-fixed \
  --query "Stacks[0].Outputs[?OutputKey=='ServiceURL'].OutputValue" \
  --output text
```

## Streaming Setup

To broadcast to your IVS channel using OBS Studio:

1. Get your IVS details:
```bash
aws cloudformation describe-stacks \
  --stack-name ivs-streaming-platform \
  --query "Stacks[0].Outputs" \
  --output table
```

2. Open OBS Studio
3. Go to Settings > Stream
4. For Service, select "Custom..."
5. For Server, enter `rtmps://{ingest-endpoint}/app/`
6. For Stream Key, enter your stream key
7. Click "OK" and "Start Streaming"

## Cleanup

When you're done with the application, clean up all resources:

```bash
# Delete the ECS stack
./cleanup-ecs-fixed.sh

# Delete the ECR stack (optional)
aws cloudformation delete-stack --stack-name ivs-streaming-ecr

# Delete the IVS stack (optional)
aws cloudformation delete-stack --stack-name ivs-streaming-platform
```

## Troubleshooting

### Container Won't Start

If your container fails to start, check the ECS service logs:

```bash
# Get the log group name
LOG_GROUP=$(aws cloudformation describe-stack-resources \
  --stack-name ivs-streaming-ecs-fixed \
  --logical-resource-id LogGroup \
  --query "StackResources[0].PhysicalResourceId" \
  --output text)

# View recent log streams
aws logs describe-log-streams --log-group-name $LOG_GROUP --order-by LastEventTime --descending --limit 5

# View logs from a specific stream
aws logs get-log-events --log-group-name $LOG_GROUP --log-stream-name "STREAM_NAME"
```

### ECR Access Issues

If you have trouble pushing to ECR:

```bash
# Get repository URI
REPOSITORY_URI=$(aws cloudformation describe-stacks \
  --stack-name ivs-streaming-ecr \
  --query "Stacks[0].Outputs[?OutputKey=='RepositoryURI'].OutputValue" \
  --output text)

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin $(echo $REPOSITORY_URI | cut -d/ -f1)
```