# IVS Streaming Platform Deployment Guide

This document provides a step-by-step guide for deploying the IVS Streaming Platform.

## Deployment Steps

We've implemented a staged deployment approach using multiple CloudFormation stacks:

### 1. Deploy ECR Repository

```bash
# Run the ECR repository deployment script
./deploy-ecr.sh
```

This creates:
- An Amazon ECR repository named `ivs-streaming`

### 2. Build and Push Docker Image

Since Docker wasn't available in the environment, you'll need to build and push the Docker image manually:

```bash
# Get the repository URI
REPOSITORY_URI=$(aws cloudformation describe-stacks \
  --stack-name ivs-streaming-ecr \
  --query "Stacks[0].Outputs[?OutputKey=='RepositoryURI'].OutputValue" \
  --output text)

# Build the Docker image
docker build -t $REPOSITORY_URI:latest .

# Log in to ECR
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin $(echo $REPOSITORY_URI | cut -d/ -f1)

# Push the Docker image
docker push $REPOSITORY_URI:latest
```

### 3. Deploy ECS Cluster and Service

```bash
# Run the ECS deployment script
./deploy-ecs.sh
```

This creates:
- VPC, subnets, internet gateway, and route tables
- Security groups and IAM roles
- ECS cluster
- Application Load Balancer
- ECS service and task definition

### 4. Access Your Application

After the deployment completes, you can access your application at the service URL:

```bash
# Get the service URL
aws cloudformation describe-stacks \
  --stack-name ivs-streaming-ecs-v2 \
  --query "Stacks[0].Outputs[?OutputKey=='ServiceURL'].OutputValue" \
  --output text
```

### 5. Configure Streaming

Your IVS resources were created in the `ivs-streaming-platform` stack. To get the streaming details:

```bash
# Get IVS playback URL
aws cloudformation describe-stacks \
  --stack-name ivs-streaming-platform \
  --query "Stacks[0].Outputs[?OutputKey=='PlaybackUrl'].OutputValue" \
  --output text

# Get IVS ingest endpoint
aws cloudformation describe-stacks \
  --stack-name ivs-streaming-platform \
  --query "Stacks[0].Outputs[?OutputKey=='IngestEndpoint'].OutputValue" \
  --output text

# Get IVS stream key
aws cloudformation describe-stacks \
  --stack-name ivs-streaming-platform \
  --query "Stacks[0].Outputs[?OutputKey=='StreamKeyValue'].OutputValue" \
  --output text
```

## Cleanup

To delete all resources:

```bash
# Delete the ECS stack
aws cloudformation delete-stack --stack-name ivs-streaming-ecs-v2

# Delete the ECR stack
aws cloudformation delete-stack --stack-name ivs-streaming-ecr

# Delete the IVS stack
aws cloudformation delete-stack --stack-name ivs-streaming-platform
```

Wait for each stack deletion to complete before moving to the next.

## Troubleshooting

If you encounter issues with the deployment:

1. Check stack events:
```bash
aws cloudformation describe-stack-events --stack-name STACK_NAME
```

2. Check resources created:
```bash
aws cloudformation list-stack-resources --stack-name STACK_NAME
```

3. Check logs for the ECS service:
```bash
# Get log group name
LOG_GROUP=$(aws cloudformation describe-stack-resources \
  --stack-name ivs-streaming-ecs-v2 \
  --logical-resource-id LogGroup \
  --query "StackResources[0].PhysicalResourceId" \
  --output text)

# View logs
aws logs get-log-events --log-group-name $LOG_GROUP --log-stream-name STREAM_NAME
```