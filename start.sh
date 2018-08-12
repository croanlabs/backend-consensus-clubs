#!/bin/bash
set -e

echo 'Building Docker images...'
docker build --no-cache -t consensusclubs/api-consensus-clubs:v1.0.1 api/
docker build --no-cache -t consensusclubs/blockchain-consensus-clubs:v1.0.0 eos/

# Create secrets
echo 'Creating Kubernetes secrets...'
kubectl create -f config/secrets/api-secrets.yaml
kubectl create -f config/secrets/eos-secrets.yaml

ENVIRONMENT=$1
DEFAULT_ENVIRONMENT='development'
if [ -z $ENVIRONMENT ]; then
  ENVIRONMENT=$DEFAULT_ENVIRONMENT
  echo 'Environment not specified. Set to default: ' $DEFAULT_ENVIRONMENT
else
  echo 'Environment is' $ENVIRONMENT
fi
echo 'Creating secrets...'
kubectl create -f config/secrets/environments/api-secrets-$ENVIRONMENT.yaml

# App components
echo 'Creating app components...'
kubectl create -f config/kube-app-entities/eos.yaml
kubectl create -f config/kube-app-entities/postgres.yaml

# Create tests components if the environment is not production
if [ "$ENVIRONMENT" != 'production' ]; then
  kubectl create -f config/kube-app-entities/eos-tests.yaml
  kubectl create -f config/kube-app-entities/postgres-tests.yaml
fi

# Wait until the blockchain is ready and create the api components
# For the EKS cluster the load balancer has to be created, otherwise
# a NodePort service is created.
sleep 15
kubectl create -f config/kube-app-entities/node-deployment.yaml
if [ "$ENVIRONMENT" == 'development' ]; then
  kubectl create -f config/kube-app-entities/node-nodeport.yaml
else
  kubectl create -f config/kube-app-entities/node-load-balancer.yaml
fi
