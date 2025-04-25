# IVS Streaming Platform Deployment Guide

This document provides updated deployment instructions after addressing the issues we encountered.

## What Happened

We encountered several issues during our initial deployment:

1. The `AmazonIVSFullAccess` IAM policy doesn't exist or isn't available in the account
2. Docker wasn't available in the environment to build and push the container image
3. The ECS service deployment was stuck waiting for a non-existent container image

## New Deployment Approach

We've created a new deployment approach using AWS App Runner instead of ECS:

1. App Runner can build the application directly from your code repository
2. No need for Docker locally or a separate ECR repository
3. Simplified infrastructure and deployment

## Cleanup Steps

Before proceeding with the new deployment, clean up the failed resources:

```bash
# Make the cleanup script executable
chmod +x cleanup-failed.sh

# Run the cleanup script
./cleanup-failed.sh
```

## App Runner Deployment Steps

```bash
# Make the deployment script executable
chmod +x deploy-apprunner.sh

# Deploy the App Runner service
./deploy-apprunner.sh
```

This script will:
1. Deploy the AWS App Runner service using CloudFormation
2. Connect it to your GitHub repository (git@github.com:perezjoseph/ivs-prototype.git)
3. Build and deploy your application
4. Configure the necessary environment variables for IVS
5. Display the service URL and IVS streaming details

## Accessing Your Application

After the deployment completes, you can access your application at the service URL provided by App Runner. This URL will be shown at the end of the deployment script.

## Streaming Setup

To broadcast to your IVS channel using OBS Studio:

1. Open OBS Studio
2. Go to Settings > Stream
3. For Service, select "Custom..."
4. For Server, enter `rtmps://{ingest-endpoint}/app/` (provided at the end of the deployment)
5. For Stream Key, enter the stream key (provided at the end of the deployment)
6. Click "OK" and "Start Streaming"

## Cleanup

When you're done with the application, you can clean up all resources:

```bash
# Clean up App Runner resources
./cleanup-apprunner.sh

# If you want to delete the IVS channel as well
aws cloudformation delete-stack --stack-name ivs-streaming-platform
```

This will completely remove all deployed resources.