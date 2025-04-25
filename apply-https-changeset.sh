#!/bin/bash
# Apply HTTPS changes to existing ECS deployment

set -e

# Configuration
STACK_NAME="ivs-streaming-https"
REGION="us-east-1"

echo "Creating self-signed certificate for HTTPS..."

# Generate private key
openssl genrsa -out key.pem 2048

# Generate a Certificate Signing Request (CSR)
openssl req -new -key key.pem -out csr.pem -subj "/CN=ivs-streaming-stack-alb-559568584.us-east-1.elb.amazonaws.com/O=IVS Streaming/C=US"

# Generate self-signed certificate
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem

echo "Importing certificate to AWS Certificate Manager..."
CERTIFICATE_ARN=$(aws acm import-certificate \
  --certificate fileb://cert.pem \
  --private-key fileb://key.pem \
  --region $REGION \
  --query CertificateArn --output text)

echo "Certificate imported with ARN: $CERTIFICATE_ARN"

echo "Deploying HTTPS configuration stack..."
aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --template-file infrastructure/https-changeset.yaml \
  --parameter-overrides CertificateArn=$CERTIFICATE_ARN \
  --capabilities CAPABILITY_IAM \
  --region $REGION

echo "HTTPS configuration deployed successfully!"

# Get the HTTPS URLs
HTTPS_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='HttpsServiceURL'].OutputValue" --output text --region $REGION)
HTTPS_TEST_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='HttpsTestURL'].OutputValue" --output text --region $REGION)

echo "=============================="
echo "HTTPS URLs:"
echo "Production URL: $HTTPS_URL"
echo "Test URL: $HTTPS_TEST_URL"
echo "=============================="

echo "Note: Since we used a self-signed certificate, browsers will show a security warning when accessing these URLs."
echo "For production use, you should use a certificate from a trusted CA or validate a certificate issued from AWS Certificate Manager."