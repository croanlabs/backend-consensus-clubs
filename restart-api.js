kubectl delete deployment nodejs-deployment
docker build --no-cache -t consensusclubs/api-consensus-clubs:v1.0.1 api/
kubectl apply -f config/kube-app-entities/node-deployment.yaml
