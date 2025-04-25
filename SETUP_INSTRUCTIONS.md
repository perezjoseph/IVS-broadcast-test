# IVS Streaming Platform Setup Instructions

## Overview

This document provides practical setup instructions for your IVS streaming platform deployment.

## Deployment Status

The CloudFormation stack `ivs-streaming-complete` has been launched. This comprehensive stack will deploy all necessary components including:

- VPC and networking resources
- ECR repository for Docker images
- CodeBuild project connected to your GitHub repository
- ECS cluster for containerized deployment
- Application Load Balancer for web traffic
- IVS channel for streaming
- Lambda function to trigger the initial build

## Accessing Your Deployment

After the deployment completes (in approximately 10-15 minutes), you can check the status and get access information using:

```bash
# Check deployment status
aws cloudformation describe-stacks --stack-name ivs-streaming-complete --query "Stacks[0].StackStatus"

# Get all outputs including URLs and endpoints
aws cloudformation describe-stacks --stack-name ivs-streaming-complete --query "Stacks[0].Outputs[*].[OutputKey, OutputValue]" --output table
```

## Setting Up OBS Studio

1. Get your IVS details:
```bash
# Get ingest endpoint
aws cloudformation describe-stacks --stack-name ivs-streaming-complete --query "Stacks[0].Outputs[?OutputKey=='IngestEndpoint'].OutputValue" --output text

# Get stream key
aws cloudformation describe-stacks --stack-name ivs-streaming-complete --query "Stacks[0].Outputs[?OutputKey=='StreamKeyValue'].OutputValue" --output text
```

2. Open OBS Studio
3. Go to Settings > Stream
4. For Service, select "Custom..."
5. For Server, enter `rtmps://{ingest-endpoint}/app/` (using the value from step 1)
6. For Stream Key, enter the value from step 1
7. Click "OK"
8. Set up your scene, sources, and audio
9. Click "Start Streaming"

## Watching Your Stream

1. Get the service URL:
```bash
aws cloudformation describe-stacks --stack-name ivs-streaming-complete --query "Stacks[0].Outputs[?OutputKey=='ServiceURL'].OutputValue" --output text
```

2. Open the URL in your browser to watch the stream

## GitHub Integration

The deployment automatically creates a webhook on your GitHub repository to trigger builds when you push code changes. 

To make changes to your application:
1. Clone your repository: `git clone git@github.com:perezjoseph/ivs-prototype.git`
2. Make changes to the code
3. Commit and push your changes
4. CodeBuild will automatically build a new Docker image and deploy it to ECS

## Monitoring Builds

You can monitor your builds using:

```bash
# Get the CodeBuild project URL
aws cloudformation describe-stacks --stack-name ivs-streaming-complete --query "Stacks[0].Outputs[?OutputKey=='CodeBuildProjectURL'].OutputValue" --output text
```

## Cleanup

When you're done with the application:

```bash
# Delete all resources
aws cloudformation delete-stack --stack-name ivs-streaming-complete
```

This will delete all resources created by the deployment.