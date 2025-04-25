# Complete AWS Deployment for IVS Streaming Platform

This guide explains how to deploy the complete solution for the IVS streaming platform using a single CloudFormation template that integrates CodeBuild, ECR, and ECS.

## Overview

This deployment creates:

1. A complete AWS infrastructure including:
   - VPC, subnets, and networking components
   - ECR repository for Docker images
   - CodeBuild project connected to your GitHub repository
   - ECS cluster, task definition, and service
   - Application Load Balancer
   - IVS channel and stream key
   - Lambda function to trigger the initial CodeBuild build

2. An automated CI/CD pipeline that:
   - Detects changes to your repository
   - Automatically builds new Docker images
   - Deploys them to ECS

## Prerequisites

- AWS CLI configured with appropriate permissions
- Access to AWS services: CloudFormation, CodeBuild, ECR, ECS, IVS, IAM, etc.
- Your code pushed to your GitHub repository (git@github.com:perezjoseph/ivs-prototype.git)

## Deployment Steps

1. Run the complete deployment script:

```bash
./deploy-complete.sh
```

This script will:
- Clean up any previously failed deployments
- Deploy the complete CloudFormation stack
- Wait for deployment completion
- Display all outputs and important information

2. The deployment will take approximately 10-15 minutes to complete.

3. After completion, you'll get:
   - The URL to access your application
   - The CodeBuild project URL to monitor builds
   - The ECR repository URI
   - IVS details (playback URL, ingest endpoint, stream key)

## CodeBuild Integration

The deployment automatically configures GitHub webhooks to trigger builds when code is pushed to your repository. The CodeBuild project:

1. Pulls the latest code from your repository
2. Builds a Docker image using the Dockerfile in the repository
3. Pushes the image to ECR with both "latest" and commit-specific tags
4. ECS automatically uses the latest image

## Streaming Setup

To broadcast to your IVS channel using OBS Studio:

1. Get your IVS details from the deployment outputs
2. Open OBS Studio
3. Go to Settings > Stream
4. For Service, select "Custom..."
5. For Server, enter `rtmps://{ingest-endpoint}/app/`
6. For Stream Key, enter your stream key
7. Click "OK" and "Start Streaming"

## Monitoring

- Monitor application: Access via the Service URL in the outputs
- Monitor builds: Access the CodeBuild console via the URL in the outputs
- Monitor ECS: Check the ECS service in the AWS console
- Monitor logs: Check CloudWatch logs (log group name: `/ecs/ivs-streaming-complete`)

## Cleanup

When you're done, run:

```bash
./cleanup-complete.sh
```

This will delete all resources created by the deployment.

## Troubleshooting

### Container Issues

If the application isn't working:

1. Check the CodeBuild logs to ensure the build succeeded
2. Check the ECS service logs in CloudWatch
3. Verify the container is running in the ECS console
4. Check if the service can pull the image from ECR

### Networking Issues

1. Verify the security group allows traffic on port 3000
2. Check the health check status in the target group
3. Ensure the container is exposing port 3000

### GitHub Webhook Issues

If builds aren't triggering automatically:

1. Check the webhook configuration in your GitHub repository
2. Verify the CodeBuild project has webhook triggers enabled
3. Manually trigger a build to verify permissions