#!/bin/bash
# Deploy script for ECS with CodeDeploy Blue/Green deployment

set -e

# Configuration
STACK_NAME="ivs-streaming-stack"
LAMBDA_STACK_NAME="ivs-streaming-lambdas"
REGION="us-east-1"
ECR_REPO="ivs-streaming"
IMAGE_TAG="latest" # Or use a specific tag

# Get repository URI
ECR_REPOSITORY_URI="851725368801.dkr.ecr.us-east-1.amazonaws.com/$ECR_REPO"

echo "Deploying Lambda functions for CodeDeploy lifecycle hooks..."
aws cloudformation deploy \
  --stack-name $LAMBDA_STACK_NAME \
  --template-file infrastructure/codedeploy-lambdas.yaml \
  --parameter-overrides \
    Environment=dev \
  --capabilities CAPABILITY_IAM \
  --region $REGION

echo "Getting Lambda ARNs..."
BEFORE_INSTALL_FUNCTION=$(aws cloudformation describe-stacks --stack-name $LAMBDA_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='BeforeInstallFunctionArn'].OutputValue" --output text --region $REGION)
AFTER_INSTALL_FUNCTION=$(aws cloudformation describe-stacks --stack-name $LAMBDA_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='AfterInstallFunctionArn'].OutputValue" --output text --region $REGION)
AFTER_TEST_FUNCTION=$(aws cloudformation describe-stacks --stack-name $LAMBDA_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='AfterAllowTestTrafficFunctionArn'].OutputValue" --output text --region $REGION)
BEFORE_TRAFFIC_FUNCTION=$(aws cloudformation describe-stacks --stack-name $LAMBDA_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='BeforeAllowTrafficFunctionArn'].OutputValue" --output text --region $REGION)
AFTER_TRAFFIC_FUNCTION=$(aws cloudformation describe-stacks --stack-name $LAMBDA_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='AfterAllowTrafficFunctionArn'].OutputValue" --output text --region $REGION)

echo "Updating appspec.yaml with Lambda ARNs..."
cat > appspec.yaml << EOF
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: <TASK_DEFINITION>
        LoadBalancerInfo:
          ContainerName: "ivs-streaming-container"
          ContainerPort: 3000
        PlatformVersion: "LATEST"
Hooks:
  - BeforeInstall: "${BEFORE_INSTALL_FUNCTION}"
  - AfterInstall: "${AFTER_INSTALL_FUNCTION}"
  - AfterAllowTestTraffic: "${AFTER_TEST_FUNCTION}"
  - BeforeAllowTraffic: "${BEFORE_TRAFFIC_FUNCTION}"
  - AfterAllowTraffic: "${AFTER_TRAFFIC_FUNCTION}"
EOF

echo "Deploying CloudFormation stack for ECS and CodeDeploy..."
aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --template-file infrastructure/ecs-codedeploy.yaml \
  --parameter-overrides \
    Environment=dev \
    ECRRepositoryURI=$ECR_REPOSITORY_URI \
    ImageTag=$IMAGE_TAG \
  --capabilities CAPABILITY_IAM \
  --region $REGION

echo "Getting ECS service information..."
ECS_CLUSTER=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ECSClusterName'].OutputValue" --output text --region $REGION)
ECS_SERVICE=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ECSServiceName'].OutputValue" --output text --region $REGION)
TASK_DEFINITION_ARN=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='TaskDefinitionArn'].OutputValue" --output text --region $REGION)
CODE_DEPLOY_APP=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CodeDeployApplicationName'].OutputValue" --output text --region $REGION)
DEPLOYMENT_GROUP=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DeploymentGroupName'].OutputValue" --output text --region $REGION)

echo "Getting current task definition..."
TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition $TASK_DEFINITION_ARN --region $REGION)

# Register a new task definition revision with the latest image
echo "Registering new task definition..."
NEW_TASK_DEFINITION=$(echo $TASK_DEFINITION | jq --arg IMAGE "$ECR_REPOSITORY_URI:$IMAGE_TAG" '.taskDefinition | .containerDefinitions[0].image = $IMAGE | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)')
NEW_TASK_DEFINITION_ARN=$(aws ecs register-task-definition --region $REGION --cli-input-json "$NEW_TASK_DEFINITION" --query "taskDefinition.taskDefinitionArn" --output text)

echo "Preparing appspec.yaml..."
# Update the appspec.yaml with the new task definition
APPSPEC=$(cat appspec.yaml | sed "s|<TASK_DEFINITION>|$NEW_TASK_DEFINITION_ARN|g")
echo "$APPSPEC" > appspec.yaml

echo "Starting CodeDeploy deployment..."
DEPLOYMENT_ID=$(aws deploy create-deployment \
  --application-name $CODE_DEPLOY_APP \
  --deployment-group-name $DEPLOYMENT_GROUP \
  --revision '{"revisionType": "AppSpecContent", "appSpecContent": {"content": "'"$(cat appspec.yaml)"'", "sha256": "'"$(shasum -a 256 appspec.yaml | cut -d' ' -f1)"'"}}' \
  --description "Deployment of $IMAGE_TAG" \
  --region $REGION \
  --query "deploymentId" \
  --output text)

echo "Deployment started with ID: $DEPLOYMENT_ID"
echo "Monitoring deployment status..."

# Monitor deployment status
while true; do
  STATUS=$(aws deploy get-deployment --deployment-id $DEPLOYMENT_ID --region $REGION --query "deploymentInfo.status" --output text)
  echo "Deployment status: $STATUS"
  
  if [ "$STATUS" == "Succeeded" ]; then
    echo "Deployment completed successfully!"
    break
  elif [ "$STATUS" == "Failed" ] || [ "$STATUS" == "Stopped" ]; then
    echo "Deployment failed or was stopped."
    exit 1
  fi
  
  sleep 10
done

SERVICE_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ServiceURL'].OutputValue" --output text --region $REGION)
TEST_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='TestURL'].OutputValue" --output text --region $REGION)
echo "=============================="
echo "Deployment Summary:"
echo "Production URL: $SERVICE_URL"
echo "Test URL: $TEST_URL"
echo "=============================="