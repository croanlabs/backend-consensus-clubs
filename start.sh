#!/bin/bash
set -e

ENVIRONMENT=$1
DEFAULT_ENVIRONMENT='development'
if [ -z $ENVIRONMENT ]; then
  ENVIRONMENT=$DEFAULT_ENVIRONMENT
  echo 'Environment not specified. Set to default: ' $DEFAULT_ENVIRONMENT
else
  echo 'Environment is' $ENVIRONMENT
fi

# Create secrets
echo 'Creating Kubernetes secrets...'
kubectl apply -f config/secrets/api-secrets.yaml
kubectl apply -f config/secrets/eos-secrets.yaml

# If it's production environment do not build the docker images because
# they should have been pushed to dockerhub before.
if [ "$ENVIRONMENT" != 'production' ]; then
  echo 'Building Docker images...'
  docker build --no-cache -t consensusclubs/api-consensus-clubs:v1.0.1 api/
  docker build --no-cache -t consensusclubs/blockchain-consensus-clubs:v1.0.0 eos/
else
  echo 'ATTENTION: Ensure that updated docker images were pushed to DockerHub'
fi

echo 'Creating secrets...'
kubectl apply -f config/secrets/environments/api-secrets-$ENVIRONMENT.yaml

echo 'Creating configmap to set DNS server properly'
# See https://github.com/kubernetes/minikube/issues/2027
kubectl apply -f config/kube-app-entities/configmap-dns.yaml

# App components
echo 'Creating app components...'
kubectl apply -f config/kube-app-entities/eos.yaml
kubectl apply -f config/kube-app-entities/postgres.yaml

# Create tests components if the environment is not production
if [ "$ENVIRONMENT" != 'production' ]; then
  kubectl apply -f config/kube-app-entities/eos-tests.yaml
  kubectl apply -f config/kube-app-entities/postgres-tests.yaml
fi

# Wait until the blockchain is ready and create the api components
# For the EKS cluster the load balancer has to be created, otherwise
# a NodePort service is created.
sleep 15
kubectl apply -f config/kube-app-entities/node-deployment.yaml
if [ "$ENVIRONMENT" == 'development' ]; then
  kubectl apply -f config/kube-app-entities/node-nodeport.yaml
else
  kubectl apply -f config/kube-app-entities/node-load-balancer.yaml
fi
